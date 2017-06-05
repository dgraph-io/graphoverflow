import React from "react";

import CommentItem from "./CommentItem";
import "../assets/styles/CommentList.css";

const CommentList = ({ comments, currentUser, onDeleteComment }) => {
  return (
    <ul className="comment-list">
      {comments.map(comment => {
        return (
          <CommentItem
            key={comment._uid_}
            comment={comment}
            currentUser={currentUser}
            onDeleteComment={onDeleteComment}
          />
        );
      })}
    </ul>
  );
};
export default CommentList;
