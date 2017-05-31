import React from "react";
import { Link } from "react-router-dom";

import "../assets/styles/Header.css";

import logo from "../assets/images/logo.svg";

const Header = () => {
  return (
    <nav className="navbar navbar-light bg-faded">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="logo" className="logo" />

          <span className="name">
            Graphoverflow
          </span>
        </Link>

        <div className="actions" />
      </div>
    </nav>
  );
};
export default Header;
