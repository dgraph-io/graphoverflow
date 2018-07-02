import React from "react";
import { Link } from "react-router-dom";

const UserPostItem = ({ post }) => {
  const score = post.upvoteCount - post.downvoteCount;
  const questionLink = `/questions/${post.uid}`;

  return (
    <li className="user-post-item">
      <Link to={questionLink}>
        <span className="user-post-score">{score}</span>
        {post.Title[0].Text}
      </Link>
    </li>
  );
};
export default UserPostItem;
