import React from "react";
import moment from "moment";
import marked from "marked";

const CommentItem = ({ comment, currentUser, onDeleteComment }) => {
  const isOwner = currentUser && comment.Author[0]._uid_ === currentUser._uid_;

  return (
    <li className="comment-item">
      <div className="comment-score">
        {comment.Score}
      </div>
      <p className="comment-content">
        <span
          className="comment-body"
          dangerouslySetInnerHTML={{ __html: marked(comment.Text) }}
        />
        {" "}
        -
        {" "}
        <span className="comment-author-name">
          {comment.Author[0].DisplayName}
        </span>
        {" "}
        <span className="comment-timestamp">
          {moment(comment.Timestamp).fromNow()}
        </span>
        {isOwner
          ? <a
              href="#delete"
              onClick={e => {
                e.preventDefault();
                onDeleteComment(comment._uid_);
              }}
            >
              <i className="fa fa-close" />
            </a>
          : null}
      </p>
    </li>
  );
};
export default CommentItem;
