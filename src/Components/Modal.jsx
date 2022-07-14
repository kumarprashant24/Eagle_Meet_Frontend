import React from "react";
import { useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Modal({ room,user ,url}) {
    const codeText =useRef();
    const urlText =useRef();

    const  copyToClipboard = (text)=> {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard')
      }
  return (
    <>
    <div
      className="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Your Meeting's ready
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="text-body">
              Share this meeting code with others you want in the meeting
            </div>
            
            <div className="fw-bold mt-3 text-body">Meeting Link:</div>
            <div className=" p-2 rounded d-flex justify-content-between" style={{ backgroundColor: "#F1F3F4" }}>
            <div ref={urlText}>{url}</div>
          
              <div onClick={()=>{copyToClipboard(urlText.current.innerText)}}>
              <i className="fa-solid fa-copy"></i>
              </div>
            </div>
            <div className="fw-bold mt-3 text-body">Meeting Code:</div>
            <div className=" p-2 rounded d-flex justify-content-between" style={{ backgroundColor: "#F1F3F4" }}>
            <div ref={codeText}>{room}</div>
          
              <div onClick={()=>{copyToClipboard(codeText.current.innerText)}}>
              <i className="fa-solid fa-copy"></i>
              </div>
            </div>

            <div className="d-flex mt-3">
                <div><img src="https://www.gstatic.com/meet/security_shield_with_background_2f8144e462c57b3e56354926e0cda615.svg"/></div>
              <div className="ms-2 text-black-50"> People who use this meeting link must get your permission before they can join</div>
            </div>
            {user== null?"": <div className="mt-3 text-black-50">joined as {user.email}</div>}
           
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <ToastContainer theme="colored" />
    </>
    
  );
}
