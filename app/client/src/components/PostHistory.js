import React from "react";

import History from "./History";
import "../assets/styles/PostHistory.css";

const PostHistory = ({ post }) => {
  // If the latest history's timestamp is greater than that of the post itself,
  // the post is edited in some ways
  const isEdited =
    new Date(post.History[0].Timestamp) > new Date(post.Timestamp);

  let verb;
  if (isEdited) {
    verb = "edited";
  } else if (post.Type === "Question") {
    verb = "asked";
  } else {
    verb = "answered";
  }

  return (
    <div className="history-container">
      {isEdited
        ? <History
            author={post.History[0].Author[0]}
            verb={verb}
            timestamp={post.History[0].Timestamp}
          />
        : null}

      {/* In the dataset, Some posts have no owner */}
      <History
        author={post.Owner ? post.Owner[0] : null}
        verb={verb}
        timestamp={post.Timestamp}
      />
    </div>
  );
};
export default PostHistory;
