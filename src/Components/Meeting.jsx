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
import Chat from "./Chat";
import LeaveMeeting from "./LeaveMeeting";
import {SERVER_URL} from '../config';
const socketURL = SERVER_URL;
const socket = io.connect(socketURL);

let checkpeer = {};
let currentPeer = [];
export default function Meeting({ user }) {
  const [refresh, setRefresh] = useState(false);
  const { uid } = useParams();
  const [peerid, setPeerId] = useState("");
  const [bigScreen,setBigScreen] = useState(null);
  const [meetingList, setMeetingList] = useState([]);
  const [isSharing,setIsSharing] = useState(false)


  const navigate = useNavigate();
  let [clients, setClients] = useState([]);
  let [myStreamId, setMyStreamId] = useState("");
  const [myStreamVideo, setMyStreamVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);

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
            currentPeer.push(call.peerConnection);
            console.log(currentPeer);
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
      // currentPeer=call.peerConnection;
      currentPeer.push(call.peerConnection);

      console.log(currentPeer);
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
    toast.info(`${data.user.firstname} ${data.user.lastname} left meeting`, {
      position: "bottom-left",
    });

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
    console.log(data);
    setClients((current) =>
      current.map((obj) => {
        if (obj.stream.id === data.streamId) {
          console.log(obj);
          return { ...obj, zIndexMic: data.zIndexMic };
        }
        return obj;
      })
    );
  });
  const stopVideo = (streamId, streamVideo) => {
    if (isDisplay === false) {
      console.log("off");
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
      console.log("on");
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
  
    toast.info(`${data.name} left  meeting`, { position: "bottom-left" });
  });

  const stopScreenShare = (stream) => {
    socket.emit('stop-share-screen',{room:uid})
    setIsSharing(false)
    setBigScreen(null)
    let videoTrack = myStreamVideo.getVideoTracks()[0];
    currentPeer.map((element) => {
      let sender = element.getSenders().find(function (s) {
        return s.track.kind == videoTrack.kind;
      });
      sender.replaceTrack(videoTrack)
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
        videoTrack.onended = function () {
          stopScreenShare();
        };
        currentPeer.map((element) => {
          let sender = element.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
          });
          sender.replaceTrack(videoTrack);
          
        });
        socket.emit('share-screen',{room:uid,streamId:myStreamId})

      })
      .catch((err) => {
        console.log(err);
      });
  };

  socket.off('big-screen').on('big-screen',data=>{
    
    let stream;
    clients.map((element)=>{
      if(element.stream.id === data.streamId)
      {
         stream = element.stream
      }
    })
    setIsSharing(true)
    setBigScreen(stream)

  })
  socket.off('close-big-screen').on('close-big-screen',data=>{
  
    setIsSharing(false)
    setBigScreen(null)

  })
  return (
    <>
      <div className="bg-dark position-relative" style={{ height: "100%" }}>
        <Modal room={uid} user={user} url={window.location.href}></Modal>
        <MeetingList meetingList={meetingList} />
        <Chat room={uid} user={user}></Chat>

        <div
          style={{ height: "89vh", overflow: "auto" }}
          className="position-relative container p-0 "
        >
          {isSharing?
          <div className="big-screen-grid mt-2">
          <video
            className="rounded-3 big-screen-video"
            ref={(video) => {
              if (video) video.srcObject = bigScreen;
            }}
            autoPlay
          ></video>
        </div>:""
        }
          
          <div className="grid-system mt-2" id="rows">
            {clients.map((element, index) => {
              return (
                <>
                  {/* <div className="text-white">{clients.length}</div> */}
                  <div
                    className={clients.length===1?`w-100 position-relative single-col`:`w-100 position-relative h-100`}
                    // style={clients.length===1?{height:"88vh"}:{height:"100%"}}
                    id={element.stream.id}
                    key={index}
                  >
                    <video
                      className="rounded-3 "
                      ref={(video) => {
                        if (video) video.srcObject = element.stream;
                      }}
                      autoPlay
                    ></video>
                    <div className=" position-absolute top-0 w-100 h-100  d-flex justify-content-center align-items-center">
                      <img
                        src={element.user.picture_url}
                        className="avtar "
                        style={{ zIndex: `${element.zIndex}` }}
                      />
                    </div>
                    <div
                      className="position-absolute top-0 end-0"
                      style={{ zIndex: `${element.zIndexMic}` }}
                    >
                      <i className="fa-solid fa-microphone-slash text-white me-2 mt-2 corner   round-img bg-secondary"></i>
                    </div>
                    <div className="d-flex position-absolute bottom-0 mb-1 ms-2">
                      <img src={element.user.picture_url} className="tag" />
                      <div className="text-white fw-bold d-flex align-items-center font-size ms-2">
                        {element.user.firstname + " " + element.user.lastname}
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>

        <div className="d-flex justify-content-center mt-2 position-absolute bottom-0 w-100 ">
          <div
            className="d-flex row justify-content-between  p-2 container-fluid"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="d-flex align-items col justify-content-center ms-3">
              <div className="d-flex">
                <div data-bs-toggle="modal" data-bs-target="#exampleModal">
                  <div style={{ cursor: "pointer" }}>
                    <i className="fa-solid  fa-shapes corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i>
                  </div>
                </div>
                <div>
                  <div style={{ cursor: "pointer" }}>
                    <i className="fa-solid  fa-circle-info corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls  */}
            <div className="d-flex align-items-center justify-content-center col">
              <div
                className="me-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  mute(myStreamId, myStreamVideo);
                }}
              >
                {isMuted ? (
                  <i className="fa-solid  fa-microphone-slash call-end bg-danger round-img  d-flex justify-content-center align-items-center text-white"></i>
                ) : (
                  <i className="fa-solid  fa-microphone unmute bg-secondary round-img  d-flex justify-content-center align-items-center text-white"></i>
                )}
              </div>
              <div
                className="me-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  stopVideo(myStreamId, myStreamVideo);
                }}
              >
                {isDisplay ? (
                  <i className="fa-solid  fa-video-slash call-end bg-danger round-img  d-flex justify-content-center align-items-center text-white"></i>
                ) : (
                  <i className="fa-solid  fa-video call-end bg-secondary round-img  d-flex justify-content-center align-items-center text-white"></i>
                )}
              </div>
              <div
                onClick={shareScreen}
                style={{ cursor: "pointer" }}
                className="bg-secondary round-img  p-2 d-flex ailgn-items-center me-2"
              >
                <box-icon name="slideshow" color="white" size="md"></box-icon>
              </div>
              <div onClick={closeMeeting} style={{ cursor: "pointer" }}>
                <i className="fa-solid  fa-phone-slash call-end bg-danger round-img  d-flex justify-content-center align-items-center text-white"></i>
              </div>
            </div>
            <div className="d-flex col justify-content-center me-3">
              <div
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasRight"
                aria-controls="offcanvasRight"
                className="d-flex justify-content-center align-items-center me-3"
              >
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <box-icon name="user" color="white" size="md"></box-icon>
                </div>
              </div>
              <div
                data-bs-toggle="offcanvas"
                data-bs-target="#chatoffcanvasRight"
                aria-controls="chatoffcanvasRight"
                className="d-flex justify-content-center align-items-center"
              >
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <box-icon
                    name="conversation"
                    color="white"
                    size="md"
                  ></box-icon>
                  {/* <i className="fa-solid  fa-message corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
