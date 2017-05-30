import React from "react";

const Answer = ({ post }) => {
  const postScore = post.UpvoteCount - post.DownvoteCount;

  return (
    <div className="post">
      {post.Title ? <h1 className="post-title">{post.Title[0].Text}</h1> : null}

      <div className="post-content">
        <div className="vote-count-container">
          <div className="vote-count">
            {postScore}
          </div>
        </div>
        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.Body[0].Text }}
        />
      </div>
    </div>
  );
};
export default Answer;
