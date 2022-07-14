import React from "react";
import { useEffect } from "react";
import Navbar from "./Navbar";

export default function Login({user}) {
  const GoogleAuth = (e) => {
    e.preventDefault();
    window.open(`http://localhost:5000/api/auth/google`, "_self");
  };


  return (
    <>
       <Navbar user={user}></Navbar>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "90vh" }}
      >
        <div className="container">
          <div className=" ">
            <div className="row">
              <div className="col-md-6 d-flex align-items-center justify-content-center">
                <div className="">
                  <img
                    className="w-100"
                    src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg"
                    alt="stats"
                  />
                </div>
              </div>

              <div className="col-md-6 d-flex align-items-center ">
                <div className="">
                  <div className="">
                    <h1 className="">Premium video meetings. Now free for everyone with Eagle Meet.</h1>
                    <div className="">
                      Connect, collaborate, and celebrate from anywhere with
                      Eagle Meet
                    </div>
                  </div>
                  <div className="">
                    <div className="mt-5">
                      <button
                        class="btn btn-outline-success"
                        type="submit"
                        onClick={GoogleAuth}
                      >
                        <img className='google' src='https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-webinar-optimizing-for-success-google-business-webinar-13.png' />
                        Continue with Google
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}