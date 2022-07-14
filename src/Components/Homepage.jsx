import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import randomstring from "randomstring";
import Peer from "peerjs";
import io from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
const socketURL = "http://localhost:5000";
const socket = io.connect(socketURL);


export default function Homepage({user}) {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [inputs,setInputs] = useState({
    meeting_link:"",
 
});
const OnInputChange = e=>{
  setInputs({...inputs,[e.target.name]:e.target.value}); 
};
const joinMeeting = () =>{
  console.log(inputs);
  navigate(`/meeting/${inputs.meeting_link}`);
}
  useEffect(() => {
    setMeetingId(uuidv4());
  }, []);
  return (
    <>
      <Navbar user={user}></Navbar>
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
              <div className="row ">
                <div className=" col p-4 ">
                  <h2 className="">2.7K</h2>
                  <p className="">Users</p>
                </div>
                <div className=" col p-4">
                  <h2 className="">1.8K</h2>
                  <p className="">Subscribes</p>
                </div>
                <div className="col p-4">
                  <h2 className="">35</h2>
                  <p className="">Downloads</p>
                </div>
                <div className="col p-4">
                  <h2 className="">4</h2>
                  <p className="">Products</p>
                </div>
              </div>

              <div className="row gx-2">
                <Link to={`/meeting/${meetingId}`} className="col-md-6">
                  <button className="btn btn-success p-3 w-100"><i className="fa-solid fa-video me-2"></i>New Meeting</button>
                </Link>
                <div className="col-md-6">
                  <div className="d-flex">
                  <input type="email" class="form-control p-3" name="meeting_link" value={inputs.meeting_link}  onChange={(e)=>OnInputChange(e)} id="exampleFormControlInput1" placeholder="Meeting Link"/>
                <div className="d-flex align-items-center ms-2 text-success text-decoration-underline" onClick={joinMeeting}>join</div>
                  </div>
              
                </div>
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
    </>
    
  );
}
