import axios from "axios";
import React from "react";

export default function Navbar({ user }) {
  const handleLogout = async (e) => {
    e.preventDefault();
    window.open(`http://localhost:5000/api/auth/logout`, "_self");
  };

  return (
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div class="container-fluid">
        <img src="/eagle.jpg" className="logo me-2"/>
        <a class="navbar-brand" href="#">
          Eagle Meet
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
          <div class="d-flex">
            <div className="d-flex align-items-center me-3">
              <img src={user.picture_url} className="tiny_pic"/>
          
            </div>
            <div className="d-flex align-items-center" onClick={handleLogout}>
            <i className="fa-solid fa-2x fa-right-from-bracket"></i>
                   
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
