import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
import { useRef } from "react";
import Modal from "./Modal";
import MeetingList from "./MeetingList";
import Chat from "./Chat";
const socketURL = "http://localhost:5000";
const socket = io.connect(socketURL);

let checkpeer = {};

export default function Meeting({ user }) {
  const [refresh, setRefresh] = useState(false);
  const { uid } = useParams();
  const [peerid, setPeerId] = useState("");
  const [col, setCol] = useState("col-md-8");
  const [meetingList, setMeetingList] = useState([]);
  let offStreamVideo = null;
  const [offStreamId, setOffStreamId] = useState("");

  const navigate = useNavigate();
  let [clients, setClients] = useState([]);
  let [myStreamId, setMyStreamId] = useState("");
  const [myStreamVideo, setMyStreamVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);
  const [defaultVideoTheme, setDefaultVideoThereme] = useState(false);
  const [toggleTheme, setToggleTheme] = useState(false);
  let uniqueStreamId = "";
  const peer = new Peer();
  const [hideAvtar,setHideAvtar] = useState(-1)

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
      addVideoStream(userDetails, userVideoStream);
    });
    call.on("close", () => {});

    checkpeer[data] = call;
  }
  function addVideoStream(user, stream) {
    setClients((current) => [...current, {stream:stream,user:user}]);
    setMeetingList((current) => [...current, {streamId:stream.id,user:user}]);
  }

  socket.on("user-disconnected", (data) => {
    if (checkpeer[data.id]) checkpeer[data.id].close();
    setMeetingList(current =>
      current.filter(employee => {
        return employee.streamId !== data.streamId;
      }),
    );
    document.getElementById(data.streamId).remove();
  
    

  });

  const mute = () => {
    // if (isMuted === false) {
    //   console.log(   myStreamVideo.getTracks());
    //   myStreamVideo.getTracks()[0].enabled = false;
    //   setIsMuted(true);
    // } else {
    //   myStreamVideo.getTracks()[0].enabled = true;
    //   setIsMuted(false);
    // }
  };
  const stopVideo = (streamId, streamVideo) => {
    if (isDisplay === false) {
      console.log("off");
      myStreamVideo.getTracks()[0].enabled = false;
      setHideAvtar(10);
      setIsDisplay(true);
    } else {
      setHideAvtar(-1);
      console.log("on");

      myStreamVideo.getTracks()[0].enabled = true;
      
      setIsDisplay(false);
    }

    socket.emit("off-video", {
      room: uid,
      streamId: streamId,
      userId: user._id,
      peerid: peerid,
    });
  };
  socket.off("set-default-video").on("set-default-video", (data) => {
    setOffStreamId(data.streamId);

    // clients.map((element)=>{

    //   if(element.id === data.streamId)
    //   {
    //     offStreamVideo= element
    //   }
    // })
  });
  const closeMeeting = () => {
    socket.emit("call-ended", {
      room: uid,
      streamId: myStreamId,
      peerId: peerid,
    });
    myStreamVideo.getTracks().forEach(function (track) {
      track.stop();
    });
    navigate("/");
  };
  socket.on("user-leave", (data) => {
    if (checkpeer[data.peerId]) checkpeer[data.peerId].close();
    document.getElementById(data.streamId).remove();
  });



  return (
    <>
      <div className="bg-dark">
        <Modal room={uid} user={user} url={window.location.href}></Modal>
        <MeetingList meetingList={meetingList} />
        <Chat room={uid} user={user}></Chat>

        <div
          style={{ height:"91.1vh", overflow: "auto" }}
          className="position-relative container p-0 "
        >
          <div className="grid-system" id="rows">
            {clients.map((element, index) => {
              return (
                <>
                  <div
                    className="w-100 position-relative"
                    id={element.stream.id}
                    key={index}
                  >
                    <video
                      className="rounded-3"
                      ref={(video) => {
                        if (video) video.srcObject = element.stream;
                      }}
                      autoPlay
                    ></video>
                    <div className="d-flex position-absolute bottom-0 mb-4 ms-2">
                      <img src={element.user.picture_url} className="tiny_pic"/>
                    <div className="text-white d-flex align-items-center ms-2">{element.user.firstname+ " " + element.user.lastname}</div>
                    </div>

                    {/* <div className="position-absolute  w-100 top-0" style={{zIndex:`${hideAvtar}`,height:"90%"}}>
                      <div
                        className="d-flex  justify-content-center align-items-center"
                        style={{ height: "100%" }}
                      >
                        <img src={user.picture_url} className="avtar" />
                      </div>
                    </div> */}
                  </div>
                </>
              );
            })}
          </div>

        
        </div>
        <div className="d-flex justify-content-center ">
            <div
              className="d-flex row justify-content-between  p-2 container-fluid"
              style={{ background: "rgba(0, 0, 0, 0.5)" }}
            >
              <div className="d-flex align-items col justify-content-center ms-3">
                <div className="d-flex">
                  <div data-bs-toggle="modal" data-bs-target="#exampleModal">
                    <div>
                      <i className="fa-solid  fa-shapes corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i>
                    </div>
                  </div>
                  <div>
                    <div>
                      <i className="fa-solid  fa-circle-info corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-center col">
                <div
                  className="me-2"
                  onClick={() => {
                    mute();
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
                <div onClick={closeMeeting}>
                  <i className="fa-solid  fa-phone-slash call-end bg-danger round-img  d-flex justify-content-center align-items-center text-white"></i>
                </div>
              </div>
              <div className="d-flex col justify-content-center me-3">
                <div
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasRight"
                  aria-controls="offcanvasRight"
                >
                  <div>
                    <i className="fa-solid  fa-user corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i>
                  </div>
                </div>
                <div
                  data-bs-toggle="offcanvas"
                  data-bs-target="#chatoffcanvasRight"
                  aria-controls="chatoffcanvasRight"
                >
                  <div>
                    <i className="fa-solid  fa-message corner fa-2x  round-img  d-flex justify-content-center align-items-center text-white"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </>
  );
}
