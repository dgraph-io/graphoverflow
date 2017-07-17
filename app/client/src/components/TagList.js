import React from "react";
import { Link } from "react-router-dom";

const TagList = ({ tags }) => {
  return (
    <div>
      {tags.map(tag => {
        return (
          <div className="tag" key={tag.TagName}>
            <Link to={`/tags/${tag.TagName}`}>
              {tag.TagName}
            </Link>
          </div>
        );
      })}
    </div>
  );
};
export default TagList;
