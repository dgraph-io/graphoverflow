import React from "react";

import PostHistory from "./PostHistory";
import PostActions from "./PostActions";
import CommentList from "./CommentList";
import TagList from "./TagList";
import marked from "marked";

const Post = ({ post, currentUser, onQuestionDelete }) => {
  const postScore = post.UpvoteCount - post.DownvoteCount;
  console.log(currentUser);

  return (
    <div className="post">
      {/* questions have title and answers don't */}
      {post.Title ? <h1 className="post-title">{post.Title[0].Text}</h1> : null}

      <div className="post-content">
        <div className="vote-count-container">
          <div className="vote-count">
            {postScore}
          </div>
        </div>
        <div className="post-body-container">
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: marked(post.Body[0].Text) }}
          />
          {post.Tags ? <TagList tags={post.Tags} /> : null}
          <PostActions
            post={post}
            currentUser={currentUser}
            onQuestionDelete={onQuestionDelete}
          />
          <PostHistory post={post} />

          {post.Comment ? <CommentList comments={post.Comment} /> : null}
        </div>
      </div>
    </div>
  );
};
export default Post;
