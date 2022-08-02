import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
import Modal from "./Modal";
import { toast } from "react-toastify";
import MeetingList from "./MeetingList";
import Screen from "./Screen";
import Chat from "./Chat";
import { SERVER_URL } from "../config";
import Controls from "./Controls";
const socket = io.connect(SERVER_URL);
let checkpeer = {};

export default function Meeting({ user }) {
  const [currentPeer, setCurrentPeer] = useState([]);
  const { uid } = useParams();

  const [peerid, setPeerId] = useState("");
  const [messageNotification, setMessageNotification] = useState(0);
  const [backupStream,setBackupStream] = useState(null);
  const [bigScreen, setBigScreen] = useState(null);
  const [myBigScreen, setMyBigScreen] = useState(null);
  const [meetingList, setMeetingList] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [toggleScreenShare, setToggleScreenShare] = useState(false);
  const navigate = useNavigate();
  let [clients, setClients] = useState([]);
  let [myStreamId, setMyStreamId] = useState("");
  const [myStreamVideo, setMyStreamVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);
  const [presenting, setPresenting] = useState({});
  let uniqueStreamId = "";
  const peer = new Peer();
  let streamIds = [];
  const loadUser = () => {
    setClients([]);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        
        setMyStreamId(stream.id);
        uniqueStreamId = stream.id;
        setMyStreamVideo(stream);
        addVideoStream(user, stream);

        peer.on("call", (call) => {
          call.answer(stream, user);

          call.on("stream", (userVideoStream) => {
            if (streamIds.indexOf(userVideoStream.id) === -1) {
              setCurrentPeer((current) => [...current, call.peerConnection]);
              addVideoStream(call.metadata.user, userVideoStream);
              streamIds.push(userVideoStream.id);
            }
          });
        });
        socket.off().on("user-connected", (data) => {
          console.log("user joined");
          connectToNewUser(data.id, stream, data.user);
        });
      });
    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("join_room", {
        room: uid,
        id: id,
        streamId: uniqueStreamId,
        user: user,
        anotherUser: {},
      });
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  function connectToNewUser(data, stream, userDetails) {
   
    const options = { metadata: { userId: peer.id, user: user } };
    const call = peer.call(data, stream, options);
    call.on("stream", (userVideoStream) => {
      setCurrentPeer((current) => [...current, call.peerConnection]);
      if (streamIds.indexOf(userVideoStream.id) === -1) {
        addVideoStream(userDetails, userVideoStream);
        streamIds.push(userVideoStream.id);
      }
    });
    call.on("close", () => {});

    checkpeer[data] = call;
  }
  function addVideoStream(user, stream) {
    setClients((current) => [
      ...current,
      { stream: stream, zIndex: "-1", zIndexMic: "-1", user: user },
    ]);
    setMeetingList((current) => [
      ...current,
      { streamId: stream.id, user: user },
    ]);
  }

  socket.off("user-disconnected").on("user-disconnected", (data) => {
    console.log(checkpeer[data.id]);
    if (checkpeer[data.id]) checkpeer[data.id].close();
    console.log(checkpeer[data.id]);
    setMeetingList((current) =>
      current.filter((employee) => {
        return employee.streamId !== data.streamId;
      })
    );
    setClients((current) =>
      current.filter((element) => {
        return element.stream.id !== data.streamId;
      })
    );
    toast.info(
      `${data.user.firstname} ${data.user.lastname} has left the meeting`,
      {
        position: "bottom-left",
      }
    );
    setIsSharing(false);
    setBigScreen(null);
    setPresenting({});
  });

  const mute = (streamId, streamVideo) => {
    if (isMuted === false) {
      myStreamVideo.getTracks()[0].enabled = false;
      socket.emit("off-mic", {
        room: uid,
        streamId: streamId,
        zIndexMic: "1",
      });
      setIsMuted(true);
    } else {
      myStreamVideo.getTracks()[0].enabled = true;
      socket.emit("off-mic", {
        room: uid,
        streamId: streamId,
        zIndexMic: "-1",
      });
      setIsMuted(false);
    }
  };
  socket.off("set-default-mic").on("set-default-mic", (data) => {
    setClients((current) =>
      current.map((obj) => {
        if (obj.stream.id === data.streamId) {
          return { ...obj, zIndexMic: data.zIndexMic };
        }
        return obj;
      })
    );
  });
  const stopVideo = (streamId) => {
    if (isDisplay === false) {
      socket.emit("off-video", {
        room: uid,
        streamId: streamId,
        zIndex: "1",
      });
      myStreamVideo.getTracks()[1].enabled = false;

      setIsDisplay(true);
    } else {
      socket.emit("off-video", {
        room: uid,
        streamId: streamId,
        zIndex: "-1",
      });

      myStreamVideo.getTracks()[1].enabled = true;

      setIsDisplay(false);
    }
  };
  socket.off("set-default-video").on("set-default-video", (data) => {
    setClients((current) =>
      current.map((obj) => {
        if (obj.stream.id === data.streamId) {
          return { ...obj, zIndex: data.zIndex };
        }
        return obj;
      })
    );
  });
  const closeMeeting = () => {
    socket.emit("call-ended", {
      room: uid,
      streamId: myStreamId,
      peerId: peerid,
      name: `${user.firstname} ${user.lastname}`,
    });
    myStreamVideo.getTracks().forEach(function (track) {
      track.stop();
    });
    navigate("/");
  };
  socket.off("user-leave").on("user-leave", (data) => {
    if (checkpeer[data.peerId]) checkpeer[data.peerId].close();

    setClients((current) =>
      current.filter((element) => {
        return element.stream.id !== data.streamId;
      })
    );

    toast.info(`${data.name} has left the  meeting`, {
      position: "bottom-left",
    });
    setIsSharing(false);
    setBigScreen(null);
    setPresenting({});
  });

  const stopScreenShare = () => {
    setToggleScreenShare(false);
    setClients((current) =>
      current.map((obj) => {
        if (obj.user._id === user._id) {
          return { ...obj, stream: myStreamVideo };
        }
        return obj;
      })
    );
    socket.emit("stop-share-screen", { room: uid });
    setIsSharing(false);
    setBigScreen(null);
    let videoTrack = myStreamVideo.getVideoTracks()[0];
    currentPeer.map((element) => {
      let sender = element.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
    });
  };

  const shareScreen = () => {

    // socket.emit('backup',{room: uid,streamId: myStreamId,user: user})
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      .then((stream) => {
        let videoTrack = stream.getVideoTracks()[0];
        // setClients((current) =>
        //   current.map((obj) => {
        //     if (obj.user._id === user._id) {
        //       return { ...obj, stream: stream };
        //     }
        //     return obj;
        //   })
        // );
        setMyBigScreen(stream);
        setToggleScreenShare(true);
        videoTrack.onended = function () {
          stopScreenShare();
        };
        currentPeer.map((element) => {
          let sender = element.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
          });
          console.log(sender);
          
          sender.replaceTrack(videoTrack);
        });
        socket.emit("share-screen", {
          room: uid,
          streamId: myStreamId,
          user: user,
        });
       
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
// socket.off('backup-stream').on('backup-stream',data=>{
//  console.log(data);
//   clients.map((element) => {
//     if (element.stream.id === data.streamId) {
//       console.log(element);
//       console.log(element.stream.getTracks());
//       //  setBackupStream(element.stream)
//     }
//   });

// })
  socket.off("big-screen").on("big-screen", (data) => {
    let stream;
    setPresenting(data.user);
    clients.map((element) => {
      if (element.stream.id === data.streamId) {
        stream = element.stream;
      }
    });
    setIsSharing(true);
    setBigScreen(stream);
    // console.log(backupStream.getTracks());
    // console.log(stream.getTracks());
    
    clients.map((element) => {
      if (element.stream.id === data.streamId) {
        element.stream =myStreamVideo;
      }
    });
  
  });
  socket.off("close-big-screen").on("close-big-screen", (data) => {
    setIsSharing(false);
    setBigScreen(null);
    setPresenting({});
  });

  const openMessageBox = () => {
    setMessageNotification(0);
  };

  return (
    <>
      <div className="bg-dark position-relative" style={{ height: "100%" }}>
        <Modal room={uid} user={user} url={window.location.href}></Modal>
        <MeetingList meetingList={meetingList} user={user} />
        <Chat
          room={uid}
          user={user}
          messageNotification={messageNotification}
          setMessageNotification={setMessageNotification}
        ></Chat>
        <div className="screen">
          <Screen
            isSharing={isSharing}
            presenting={presenting}
            user={user}
            myBigScreen={myBigScreen}
            bigScreen={bigScreen}
            clients={clients}
            stopScreenShare={stopScreenShare}
          ></Screen>
        </div>

        <Controls
          mute={mute}
          myStreamId={myStreamId}
          myStreamVideo={myStreamVideo}
          isMuted={isMuted}
          stopVideo={stopVideo}
          isDisplay={isDisplay}
          shareScreen={shareScreen}
          closeMeeting={closeMeeting}
          toggleScreenShare={toggleScreenShare}
          openMessageBox={openMessageBox}
          messageNotification={messageNotification}
        ></Controls>
      </div>
    </>
  );
}
