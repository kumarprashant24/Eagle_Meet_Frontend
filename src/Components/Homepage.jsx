import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import randomstring from "randomstring";
import Peer from "peerjs";
import io from "socket.io-client";
import { Link } from "react-router-dom";
const socketURL = "http://localhost:5000";
const socket = io.connect(socketURL);

export default function Homepage() {
  const [meetingId, setMeetingId] = useState("");

  useEffect(() => {
    setMeetingId(uuidv4());
  }, []);
  return (
    <div className="d-flex justify-content-center align-items-center" style={{height:'90vh'}}>
      <div>
      <div className="container d-flex " >
        <div className="row">
          <div className="col-md-6 d-flex align-items-center">
            <div className="">
              <div className="">
                <h1 className="">Secure Video Conferencing for everyone</h1>
                <div className="">
                  Connect, collaborate, and celebrate from anywhere with Eagle
                  Meet
                </div>
              </div>
              <div className="d-flex">
                <div className="p-4 ps-0">
                  <h2 className="">2.7K</h2>
                  <p className="">Users</p>
                </div>
                <div className="p-4">
                  <h2 className="">1.8K</h2>
                  <p className="">Subscribes</p>
                </div>
                <div className="p-4">
                  <h2 className="">35</h2>
                  <p className="">Downloads</p>
                </div>
                <div className="p-4">
                  <h2 className="">4</h2>
                  <p className="">Products</p>
                </div>
              </div>

              <div className="">
                <Link to={`/meeting/${meetingId}`}>
                  <button className="btn btn-success">Start</button>
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="">
              <img
                className="w-100"
                src="https://previews.123rf.com/images/microone/microone1907/microone190700383/128173895-video-conference-people-group-on-computer-screen-taking-with-colleague-video-conferencing-and-online.jpg"
                alt="stats"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
      
    </div>
  );
}
