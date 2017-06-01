import React from "react";

const TagList = ({ tags }) => {
  return (
    <div>
      {tags.map(tag => {
        return (
          <div className="tag" key={tag.TagName}>
            {tag.TagName}
          </div>
        );
      })}
    </div>
  );
};
export default TagList;
