import React from "react";
import { Link } from "react-router-dom";

const PostActions = ({ post, currentUser, onDeletePost }) => {
  const isOwner = currentUser && post.Owner[0].uid === currentUser.uid;
  return (
    <div>
      {isOwner
        ? <div>
            <Link to={`/posts/${post.uid}/edit`}>edit</Link>
            <a
              href="#delete"
              onClick={e => {
                e.preventDefault();
                onDeletePost(post.uid);
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
