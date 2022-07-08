import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import Peer from "peerjs";
import io from "socket.io-client";
const socketURL = "http://localhost:5000";
const socket = io.connect(socketURL);

let checkpeer = {};

export default function Meeting() {
  const { uid } = useParams();
  const [peerid, setPeerId] = useState("");
  const myVideo = document.createElement("video");

  const videoGrid = document.getElementById("video-grid");

  const peer = new Peer();

  const loadUser = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      addVideoStream(myVideo, stream);
      peer.on("call", (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });
      socket.off().on("user-connected", (data) => {
        connectToNewUser(data.id, stream);
      });
    });
    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("join_room", { room: uid, id: id });
    });
  };
  
  useEffect(() => {
    loadUser();
  }, []);

  function connectToNewUser(data, stream) {
    const videoUser = document.createElement("video");
    const call = peer.call(data, stream);
    call.on("stream", (userVideoStream) => {
      addVideoStream(videoUser, userVideoStream);
    });
    call.on("close", () => {
      videoUser.remove();
    });

    checkpeer[data] = call;
  }
  function addVideoStream(video, stream) {
    const videoGrid = document.getElementById("video-grid");

    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGrid.append(video);
  }

  socket.on("user-disconnected", (userId) => {
    if (checkpeer[userId]) checkpeer[userId].close();
  });

  return (
    <>
      {/* <h1>{peerid}</h1> */}
      {/* <button onClick={joinRoom}>click</button>
      <button onClick={send}>send</button>
      <h1>{message}</h1> */}

      <div id="video-grid" className=""></div>
    </>
  );
}
