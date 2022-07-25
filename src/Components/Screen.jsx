import React, { useEffect } from "react";
export default function Screen({
  isSharing,
  presenting,
  user,
  myBigScreen,
  bigScreen,
  clients,
  stopScreenShare,
  

}) {

  return (
    <div className="position-relative h-100  p-0 ">
      {isSharing ? (
        <div
          className="text-white justify-content-between ms-2 me-2 p-2 rounded mt-2  d-flex"
          style={{background : "#3c4043"}}
        >
          <div className="d-flex ">
          <div className="d-flex align-items-center">
            <img src={presenting.picture_url} className="tag" />
          </div>
          <div className="d-flex align-items-center ms-2">
            {presenting._id === user._id
              ? "You are presenting screen"
              : `${presenting.firstname}  ${presenting.lastname} is presenting screen`}
          </div>
          </div>
          <div>
            {presenting._id ===user._id?
           <div className="text-primary" onClick={stopScreenShare} style={{cursor:"pointer"}}>Stop Screen Sharing</div> 
          :""  
          }
          </div>
       
        </div>
      ) : (
        ""
      )}

      <div className="row m-0 gy-3">
        {isSharing ?  (
          <div className="col-md-8 mt-5 ">
           
              <div className="big-screen-grid mt-2">
                {presenting._id === user._id ? (
                  <video
                    className="rounded-3 big-screen-video"
                    ref={(video) => {
                      if (video) video.srcObject = myBigScreen;
                    }}
                    autoPlay
                  ></video>
                ) : (
                  <video
                    className="rounded-3 big-screen-video"
                    ref={(video) => {
                      if (video) video.srcObject = bigScreen;
                    }}
                    autoPlay
                  ></video>
                )}
              </div>
          
          </div>
        ) : (
          ""
        )}

        <div className={isSharing?`col participant-col-bigscreen`:`col participant-col`} >
          <div className="grid-system container " id="rows">
            {clients.map((element, index) => {
              return (
                <>
                  <div
                    className={
                      clients.length === 1
                        ? `w-100 position-relative single-col`
                        : `w-100 position-relative h-100`
                    }
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
                        {element.user._id === user._id
                          ?  "(You)"
                          : element.user.firstname +
                            " " +
                            element.user.lastname}
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
