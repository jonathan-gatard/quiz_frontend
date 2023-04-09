
import React from "react";
import Cookies from "js-cookie";
export function NavBar({ uid }) {

  function handleLogOut() {
    Cookies.remove('isLogged');
    Cookies.remove('uid');
    window.location.reload();
  }

  return (
    <>
      <div className="navbar-container">
        <div className="navbar">
          <div className="navbar-title">
            <span className="title">eTraining </span>
            <span className="by"> by Inolab</span>
          </div>
          <button onClick={handleLogOut}>Logout</button>
          <div className="navbar-user">
            <img src="https://www.leparisien.fr/resizer/tLT5Pi5IToCEU6qBl6kIcTKf-J0=/932x582/arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/26OZA4GZS7JEKKHYEOHWF4TR2Q.jpg"></img>
            <div>
              <span>Jonathan GATARD</span>
              <span>{uid}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}