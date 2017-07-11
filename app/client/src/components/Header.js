import React from "react";
import { Link } from "react-router-dom";

import UserActions from "./UserActions";
import GuestActions from "./GuestActions";
import SearchInput from "./SearchInput";

import "../assets/styles/Header.css";

import logo from "../assets/images/logo.svg";

const Header = ({ user, onLogout }) => {
  return (
    <nav className="navbar navbar-light bg-faded">
      <div className="container">
        <div className="header-content">
          <div className="left">
            <Link className="navbar-brand" to="/">
              <img src={logo} alt="logo" className="logo" />

              <span className="name">Graphoverflow</span>
            </Link>

            <SearchInput />
          </div>

          {user
            ? <UserActions onLogout={onLogout} user={user} />
            : <GuestActions />}
        </div>
      </div>
    </nav>
  );
};
export default Header;
