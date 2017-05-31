import React from "react";
import moment from "moment";

const PostInfo = ({ post }) => {
  return (
    <div>
      <ul className="list-unstyled">
        <li>
          Asked: {moment(post.Timestamp).fromNow()}
        </li>
        <li>
          Viewed: {post.ViewCount} times
        </li>
      </ul>
    </div>
  );
};
export default PostInfo;
