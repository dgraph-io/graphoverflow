import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import marked from "marked";

const CommentItem = ({ comment, currentUser, onDeleteComment }) => {
  const isOwner = currentUser && comment.Author[0].uid === currentUser.uid;
  const author = comment.Author[0];

  return (
    <li className="comment-item">
      <div className="comment-score">
        {comment.Score}
      </div>
      <p className="comment-content">
        <span
          className="comment-body"
          dangerouslySetInnerHTML={{ __html: marked(comment.Text) }}
        />{" "}
        -{" "}
        <span className="comment-author-name">
          <Link to={`/users/${author.uid}`}>
            {author.DisplayName}
          </Link>
        </span>{" "}
        <span className="comment-timestamp">
          {moment(comment.Timestamp).fromNow()}
        </span>
        {isOwner
          ? <a
              href="#delete"
              onClick={e => {
                e.preventDefault();
                onDeleteComment(comment.uid);
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
