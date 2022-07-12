import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
import { useRef } from "react";
const socketURL = "http://localhost:5000";
const socket = io.connect(socketURL);

let checkpeer = {};

export default function Meeting() {
  const videoGridPanel = useRef();
  const { uid } = useParams();
  const [peerid, setPeerId] = useState("");
  const myVideo = document.createElement("video");
  const col = document.createElement("div");
  col.setAttribute("class", "col");
  col.append(myVideo);
  let [clients, setClients] = useState([]);
  let myStreamId = "" 
  const [myStreamVideo, setMyStreamVideo] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isDisplay, setIsDisplay] = useState(false);
  const peer = new Peer();

  const loadUser = () => {
    setClients([]);

    navigator.mediaDevices.getUserMedia({ video: true,audio:false}).then((stream) => {
    
      myStreamId = stream.id;
      setMyStreamVideo(stream);
      addVideoStream(col, stream);
      peer.on("call", (call) => {
        call.answer(stream)
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
      socket.emit("join_room", { room: uid, id: id,streamId:myStreamId});
    });
  };

  useEffect(() => {
    loadUser();
    console.log(clients);
  }, []);

  function connectToNewUser(data, stream) {
    
    const call = peer.call(data, stream);
    call.on("stream", (userVideoStream) => {
      addVideoStream(col, userVideoStream);
    });
    call.on("close", () => {
     
    });

    checkpeer[data] = call;
  }
  function addVideoStream(col, stream) {
    
    setClients((current) => [...current, stream]);
    console.log(clients);
  }

  socket.on("user-disconnected", (data) => {
    console.log(data);
    if (checkpeer[data.id]) checkpeer[data.id].close();
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
  const stopVideo = () => {
    if (isDisplay === false) {
      console.log( myStreamVideo.getTracks());
      myStreamVideo.getTracks()[0].enabled = false;

      setIsDisplay(true);
    } else {
      myStreamVideo.getTracks()[0].enabled = true;
      setIsDisplay(false);
    }
  };
  return (
    <>
      <div
        style={{ height: "90vh", overflow: "auto" }}
        className="position-relative"
      >
        <div className="row" id="rows">
     
          {clients.map((element, index) => {
            return (
              <>
                <div className="col" id={element.id}>
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
        <div className="d-flex justify-content-center">
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
          <div>
            <i className="fa-solid  fa-phone-slash call-end bg-danger round-img  d-flex justify-content-center align-items-center text-white"></i>
          </div>
        </div>
      </div>
    </>
  );
}
