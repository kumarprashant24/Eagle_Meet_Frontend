import React from 'react'

export default function Controls({mute,myStreamId,myStreamVideo,isMuted,stopVideo,isDisplay,shareScreen,closeMeeting,toggleScreenShare}) {
  return (
    <div className="d-flex justify-content-center mt-2 w-100 ">
    <div
      className="d-flex row justify-content-between   p-2 container-fluid"
      // style={{ background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="info align-items col justify-content-center ms-3">
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
        {toggleScreenShare?
          <div
          onClick={shareScreen}
          style={{ cursor: "pointer" }}
          className="bg-white  round-img  p-2 d-flex ailgn-items-center me-2"
        >
          <box-icon name="slideshow" color="green" size="md"></box-icon>
        </div>
        :
        <div
        onClick={shareScreen}
        style={{ cursor: "pointer" }}
        className="bg-secondary  round-img  p-2 d-flex ailgn-items-center me-2"
      >
        <box-icon name="slideshow" color="white" size="md"></box-icon>
      </div>
      }
      
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
  )
}
