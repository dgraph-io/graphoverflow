import React from "react";
import moment from "moment";
import classnames from "classnames";

import { Link } from "react-router-dom";

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

      {author
        ? <div className="author-info">
            <div className="meta">
              <div className="author-name">
                <Link to={`/users/${author.uid}`}>
                  {author.DisplayName}
                </Link>
              </div>
              <div className="author-rep">
                {author.Reputation}
              </div>
            </div>
          </div>
        : <div className="author-info">
            <div className="meta">
              <div className="author-name">Deleted user</div>
              <div className="author-rep">0</div>
            </div>
          </div>}
    </div>
  );
};
export default History;
