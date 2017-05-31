import React from "react";
import moment from "moment";
import classnames from "classnames";

import avatar from "../assets/images/diggy-face.png";

const History = ({ author, verb, timestamp }) => {
  return (
    <div
      className={classnames("history", {
        asked: verb.toLowerCase() === "asked"
      })}
    >
      <div className="timestamp">
        {verb.toLowerCase()} {moment(timestamp).fromNow()}
      </div>
      <div className="author-info">
        <div className="author-avatar-container">
          <img
            src={avatar}
            alt={author.DisplayName}
            className="author-avatar"
          />
        </div>

        <div className="meta">
          <div className="author-name">
            {author.DisplayName}
          </div>
          <div className="author-rep">
            {author.Reputation}
          </div>
        </div>
      </div>

    </div>
  );
};
export default History;
