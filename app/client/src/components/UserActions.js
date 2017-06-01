import React from "react";

const UserActions = ({ onLogout, user }) => {
  return (
    <div className="actions">
      <div className="user">
        {user.DisplayName}
      </div>
      <div className="separator">
        ·
      </div>
      <a
        href="#logout"
        onClick={e => {
          e.preventDefault();
          onLogout();
        }}
        className="action"
      >
        <i className="fa fa-sign-out" /> Sign out
      </a>
    </div>
  );
};
export default UserActions;
