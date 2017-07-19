import React from "react";
import classnames from "classnames";
import { withRouter } from "react-router-dom";

const PostVote = ({
  post,
  onVote,
  onCancelVote,
  userUpvoted,
  userDownvoted,
  currentUser,
  history,
  postScore
}) => {
  return (
    <div className="post-vote-container">
      <div className="post-vote">
        <a
          href="#upvote"
          className={classnames("vote-btn", { voted: userUpvoted })}
          onClick={e => {
            e.preventDefault();
            if (!currentUser) {
              history.push("/login");
              return;
            }

            if (userUpvoted) {
              onCancelVote({ type: "Upvote" });
              return;
            }
            onVote({ type: "Upvote" });
          }}
        >
          <i className="fa fa-chevron-up" />
        </a>
        <div className="vote-count">
          {postScore}
        </div>
        <a
          href="#downvote"
          className={classnames("vote-btn", {
            voted: userDownvoted
          })}
          onClick={e => {
            e.preventDefault();
            if (!currentUser) {
              history.push("/login");
              return;
            }

            if (userDownvoted) {
              onCancelVote({ type: "Downvote" });
              return;
            }
            onVote({ type: "Downvote" });
          }}
        >
          <i className="fa fa-chevron-down" />
        </a>
      </div>
    </div>
  );
};
export default withRouter(PostVote);
