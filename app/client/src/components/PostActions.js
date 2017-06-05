import React from "react";
import { Link } from "react-router-dom";

const PostActions = ({ post, currentUser, onDeletePost }) => {
  const isOwner = currentUser && post.Owner[0]._uid_ === currentUser._uid_;
  return (
    <div>
      {isOwner
        ? <div>
            <Link to={`/posts/${post._uid_}/edit`}>edit</Link>
            <a
              href="#delete"
              onClick={e => {
                e.preventDefault();
                onDeletePost(post._uid_);
              }}
            >
              Delete
            </a>
          </div>
        : null}
    </div>
  );
};
export default PostActions;
