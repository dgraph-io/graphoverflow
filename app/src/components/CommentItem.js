import React from "react";
import moment from "moment";
import marked from "marked";

const CommentItem = ({ comment }) => {
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
      </p>
    </li>
  );
};
export default CommentItem;
