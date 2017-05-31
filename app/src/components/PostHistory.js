import React from "react";

import History from "./History";
import "../assets/styles/PostHistory.css";

const PostHistory = ({ post }) => {
  // If the latest history's timestamp is greater than that of the post itself,
  // the post is edited in some ways
  const isEdited =
    new Date(post.History[0].Timestamp) > new Date(post.Timestamp);

  return (
    <div className="history-container">
      {isEdited
        ? <History
            author={post.History[0].Author[0]}
            verb="edited"
            timestamp={post.History[0].Timestamp}
          />
        : null}
      <History author={post.Owner[0]} verb="asked" timestamp={post.Timestamp} />
    </div>
  );
};
export default PostHistory;
