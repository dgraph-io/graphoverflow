import React from "react";
import { Link } from "react-router-dom";

const PostActions = ({ post, currentUser }) => {
  const isOwner = post.Owner[0]._uid_ === currentUser._uid_;
  return (
    <div>
      {isOwner ? <Link to={`/questions/${post._uid_}/edit`}>edit</Link> : null}
    </div>
  );
};
export default PostActions;
