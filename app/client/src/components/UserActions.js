import React from "react";
import { Link } from "react-router-dom";

const UserActions = ({ onLogout, user }) => {
  return (
    <div className="actions">
      <div className="user">
        <Link to={`/users/${user.uid}`}>
          {user.DisplayName}
        </Link>
      </div>
      <div className="separator">
        ·
      </div>
      <a href="/api/logout" className="action">
        <i className="fa fa-sign-out" /> Sign out
      </a>
    </div>
  );
};
export default UserActions;
