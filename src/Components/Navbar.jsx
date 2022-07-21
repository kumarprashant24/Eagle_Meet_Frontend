import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ user }) {
  const handleLogout = async (e) => {
    e.preventDefault();
    window.open(`http://localhost:5000/api/auth/logout`, "_self");
  };

  // useEffect(() => {
  //   console.log(user);
  //   if (user === null) {
  //     console.log("it is correct");
  //   } else {
  //     console.log("not corrext");
  //   }
  // }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
     
          <div className="d-flex align-items-center">
            <img src="/eagle.png" className="logo " />
            <div className=" fw-bold text-dark">Eagle Meet</div>
          </div>
      

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
          {user == null ? (
            ""
          ) : (
            <>
              <div className="d-flex">
                <div className="d-flex align-items-center me-3">
                  <img src={user.picture_url} className="tiny_pic" />
                </div>
                <div
                  className="d-flex align-items-center"
                  onClick={handleLogout}
                >
                  <i className="fa-solid fa-2x fa-arrow-right-from-bracket text-black-50"></i>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
