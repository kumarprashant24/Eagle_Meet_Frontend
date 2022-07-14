import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
import { useRef } from "react";
import Modal from "./Modal";
const socketURL = "http://localhost:5000";
const socket = io.connect(socketURL);

let checkpeer = {};

export default function Meeting({ user }) {


  const [refresh, setRefresh] = useState(false);
  const { uid } = useParams();
  const [peerid, setPeerId] = useState("");
  const [col, setCol] = useState("col-md-8");

  const navigate = useNavigate();
  let [clients, setClients] = useState([]);
  let [myStreamId, setMyStreamId] = useState("");
  const [myStreamVideo, setMyStreamVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);
  let uniqueStreamId = "";
  const peer = new Peer();

  const toggleRefresh = () => setRefresh((p) => !p);
  const loadUser = () => {
    
    setClients([]);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setMyStreamId(stream.id);
        uniqueStreamId = stream.id;
        setMyStreamVideo(stream);
        addVideoStream(col, stream);
        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            addVideoStream(col, userVideoStream);
          });
        });
        socket.off().on("user-connected", (data) => {
          connectToNewUser(data.id, stream);
        });
      });
    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("join_room", { room: uid, id: id, streamId: uniqueStreamId });
    });
  };

  useEffect(() => {
    loadUser();
  }, [refresh]);

  function connectToNewUser(data, stream) {
    const call = peer.call(data, stream);
    call.on("stream", (userVideoStream) => {
      addVideoStream(col, userVideoStream);
    });
    call.on("close", () => {});

    checkpeer[data] = call;
  }
  function addVideoStream(col, stream) {
    setClients((current) => [...current, stream]);
  }

  socket.on("user-disconnected", (data) => {
    if (checkpeer[data.id]) checkpeer[data.id].close();

    document.getElementById(data.streamId).remove();

    if (clients.length % 2 === 1) {
      const vid = document.getElementById(data.streamId);
    }
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
  const stopVideo = () => {
    if (isDisplay === false) {
      myStreamVideo.getTracks()[0].enabled = false;
      setIsDisplay(true);
    } else {
      myStreamVideo.getTracks()[0].enabled = true;
      setIsDisplay(false);
    }
  };
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
    console.log(checkpeer);
    if (checkpeer[data.peerId]) checkpeer[data.peerId].close();
    document.getElementById(data.streamId).remove();
  });
  return (
    <>
    <Modal room={uid} user={user} url={window.location.href}></Modal>
      <div className="position-relative">
        <div className=" position-fixed bottom-50">
        <button
          type="button"
          className="btn btn-success rounded-0"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
         <i className="fa-solid fa-arrow-right"></i>
        </button>
        </div>
        <div
          style={{ height: "100%", overflow: "auto" }}
          className="position-relative container "
        >
          {/*       
        <div className="row gx-2" id="rows">
          
          {clients.map((element, index) => {
            if (
              clients.length === 1 ||
              (index === clients.length - 1 && index % 2 === 0)
            ) {
              return (
                <>
                  <div className="col-md-12" id={element.id} key={index}>
                    {element.id}
                    <video
                      ref={(video) => {
                        if (video) video.srcObject = element;
                      }}
                      autoPlay
                    ></video>
                  </div>
                </>
              );
            } 
          
            else {
              
          
              return (
                <>
                  <div className="col-md-6" id={element.id}  key={index}>
                  {element.id}
                    <video
                      ref={(video) => {
                        if (video) video.srcObject = element;
                      }}
                      autoPlay
                    ></video>
                  </div>
                </>
              );
            }
          })}
        </div> */}

          <div className="grid-system" id="rows">
            {clients.map((element, index) => {
              return (
                <>
                  <div className="w-100" id={element.id} key={index}>
                  
                    <video
                      ref={(video) => {
                        if (video) video.srcObject = element;
                      }}
                      autoPlay
                    ></video>
                  </div>
                </>
              );
            })}
          </div>

          <div className="d-flex justify-content-center ">
            <div className="d-flex justify-content-center position-fixed bottom-0 container bg-success w-100">
              <div
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
              <div onClick={stopVideo}>
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
          </div>
        </div>
      </div>
    </>
  );
}
