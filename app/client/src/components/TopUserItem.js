import React from "react";
import { Link } from "react-router-dom";

import { trimStr, stripTags } from "../lib/helpers";
import avatar from "../assets/images/diggy-face.png";

const TopUserItem = ({ user }) => {
  return (
    <div className="top-user-item">
      <div className="info-row">
        <img src={avatar} alt={user.DisplayName} className="user-avatar" />
        <div className="info">
          <Link to={`/users/${user._uid_}`} className="username">
            {user.DisplayName}
          </Link>
          <p className="about-me">
            {trimStr(stripTags(user.AboutMe), 70)}
          </p>
        </div>
      </div>
      <div className="statistics">
        <div>
          Reputation:
          <span className="reputation num">{user.Reputation}</span>
        </div>
        <div>
          Chosen answers this month:
          <span className="num">{user.NumAcceptedAnswers}</span>
        </div>
      </div>
    </div>
  );
};
export default TopUserItem;
