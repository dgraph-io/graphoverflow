import React from "react";

import UserPostItem from "./UserPostItem";

const UserPostList = ({ posts }) => {
  return (
    <ul className="list-unstyled">
      {posts.map(post => {
        return <UserPostItem key={post.uid} post={post} />;
      })}
    </ul>
  );
};
export default UserPostList;
