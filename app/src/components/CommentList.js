import React from "react";

import CommentItem from "./CommentItem";
import "../assets/styles/CommentList.css";

const CommentList = ({ comments }) => {
  return (
    <ul className="comment-list">
      {comments.map(comment => {
        return <CommentItem key={comment._uid_} comment={comment} />;
      })}
    </ul>
  );
};
export default CommentList;
