import React from "react";
import moment from "moment";

const PostInfo = ({ post }) => {
  return (
    <section className="section side-section">
      <ul className="list-unstyled">
        <li>
          Asked: {moment(post.Timestamp).fromNow()}
        </li>
        <li>
          Viewed: {post.ViewCount} times
        </li>
      </ul>
    </section>
  );
};
export default PostInfo;
