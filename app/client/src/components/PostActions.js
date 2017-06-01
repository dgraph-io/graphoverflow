import React from "react";
import { Link } from "react-router-dom";

const PostActions = ({ post, currentUser, onQuestionDelete }) => {
  const isOwner = post.Owner[0]._uid_ === currentUser._uid_;
  return (
    <div>
      {isOwner
        ? <div>
            <Link to={`/questions/${post._uid_}/edit`}>edit</Link>
            <a
              href="#delete"
              onClick={e => {
                e.preventDefault();
                onQuestionDelete();
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
