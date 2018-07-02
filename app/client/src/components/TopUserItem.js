import React from "react";
import { Link } from "react-router-dom";
import striptags from "striptags";

import { trimStr } from "../lib/helpers";

const TopUserItem = ({ user }) => {
  return (
    <div className="top-user-item">
      <div className="info-row">
        <div className="info">
          <Link to={`/users/${user.uid}`} className="username">
            {user.DisplayName}
          </Link>
          <p className="about-me">
            {trimStr(striptags(user.AboutMe), 70)}
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
