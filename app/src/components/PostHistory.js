import React from "react";

import History from "./History";
import "../assets/styles/PostHistory.css";

const PostHistory = ({ post }) => {
  return (
    <div className="history-container">
      <History author={post.Owner[0]} verb="asked" timestamp={post.Timestamp} />
    </div>
  );
};
export default PostHistory;
