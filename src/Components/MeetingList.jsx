import React from "react";
import { useEffect } from "react";

export default function MeetingList({ meetingList }) {
  useEffect(() => {
    // console.log(meetingList)
  }, []);
  return (
    <>
      <div
        className="offcanvas offcanvas-end"
        
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 id="offcanvasRightLabel">Users in Meeting</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          {meetingList.map((element) => {
            return (
              <>
                <div className="d-flex align-items-center mb-2 border-bottom p-2">
                  <div>
                    <img className="tiny_pic" src={element.user.picture_url} />
                  </div>
                  <div className="ms-3">
                    {element.user.firstname + " " + element.user.lastname}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
}
