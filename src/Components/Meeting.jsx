import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
import { useRef } from "react";
import Modal from "./Modal";
import { toast } from "react-toastify";
import MeetingList from "./MeetingList";
import Screen from "./Screen";
import Chat from "./Chat";
import LeaveMeeting from "./LeaveMeeting";
import { SERVER_URL } from "../config";
import Controls from "./Controls";
// const socketURL = SERVER_URL;
const socket = io.connect(SERVER_URL);

let checkpeer = {};
// let currentPeer = [];
export default function Meeting({ user }) {
  const [currentPeer, setCurrentPeer] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { uid } = useParams();
  const [peerid, setPeerId] = useState("");
  const [bigScreen, setBigScreen] = useState(null);
  const [myBigScreen, setMyBigScreen] = useState(null);
  const [meetingList, setMeetingList] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  const [toggleScreenShare,setToggleScreenShare] = useState(false)

  const navigate = useNavigate();
  let [clients, setClients] = useState([]);
  let [myStreamId, setMyStreamId] = useState("");
  const [myStreamVideo, setMyStreamVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);
  const [presenting, setPresenting] = useState({});

  let uniqueStreamId = "";
  const peer = new Peer();
  const [hideAvtar, setHideAvtar] = useState(-1);

  const toggleRefresh = () => setRefresh((p) => !p);

  const loadUser = () => {
    setClients([]);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setMyStreamId(stream.id);
        uniqueStreamId = stream.id;
        setMyStreamVideo(stream);
        addVideoStream(user, stream);

        peer.on("call", (call) => {
          call.answer(stream, user);

          call.on("stream", (userVideoStream) => {
            setCurrentPeer((current) => [...current, call.peerConnection]);

            addVideoStream(call.metadata.user, userVideoStream);
          });
        });
        socket.off().on("user-connected", (data) => {
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
  }, [refresh]);

  function connectToNewUser(data, stream, userDetails) {
    const options = { metadata: { user: user } };
    const call = peer.call(data, stream, options);
    call.on("stream", (userVideoStream) => {
      setCurrentPeer((current) => [...current, call.peerConnection]);
      addVideoStream(userDetails, userVideoStream);
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
    if (checkpeer[data.id]) checkpeer[data.id].close();
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

    // document.getElementById(data.streamId).remove();
  });

  const mute = (streamId, streamVideo) => {
    if (isMuted === false) {
      // myStreamVideo.getTracks()[0].enabled = false;
      socket.emit("off-mic", {
        room: uid,
        streamId: streamId,
        zIndexMic: "1",
      });
      setIsMuted(true);
    } else {
      // myStreamVideo.getTracks()[0].enabled = true;
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
  const stopVideo = (streamId, streamVideo) => {
    if (isDisplay === false) {
      socket.emit("off-video", {
        room: uid,
        streamId: streamId,

        zIndex: "1",
      });
      myStreamVideo.getTracks()[0].enabled = false;
      setHideAvtar(10);
      setIsDisplay(true);
    } else {
      setHideAvtar(-1);

      socket.emit("off-video", {
        room: uid,
        streamId: streamId,
        zIndex: "-1",
      });

      myStreamVideo.getTracks()[0].enabled = true;

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

  const stopScreenShare = (stream) => {
    setToggleScreenShare(false)
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
        setClients((current) =>
          current.map((obj) => {
            if (obj.user._id === user._id) {
              return { ...obj, stream: stream };
            }
            return obj;
          })
        );
        setMyBigScreen(stream)
        setToggleScreenShare(true);
        videoTrack.onended = function () {
          stopScreenShare();
        };
        currentPeer.map((element) => {
          let sender = element.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
          });
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
  });
  socket.off("close-big-screen").on("close-big-screen", (data) => {
    setIsSharing(false);
    setBigScreen(null);
    setPresenting({});
  });
  return (
    <>
      <div className="bg-dark position-relative" style={{ height: "100%" }}>
        <Modal room={uid} user={user} url={window.location.href}></Modal>
        <MeetingList meetingList={meetingList} />
        <Chat room={uid} user={user}></Chat>
        <div className="screen" >
        <Screen
          isSharing={isSharing}
          presenting={presenting}
          user={user}
          myBigScreen={myBigScreen}
          bigScreen={bigScreen}
          clients={clients}
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
        ></Controls>
      </div>
    </>
  );
}
