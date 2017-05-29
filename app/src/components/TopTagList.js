import React from "react";

import "../assets/styles/TopTagList.css";

const TopTagList = ({ tags }) => {
  return (
    <section className="side-section top-tag-list-container">
      <h2>Top Tags</h2>
      <ul className="tag-list">
        {tags.map(tag => {
          return (
            <li className="tag-item" key={tag._uid_}>
              <span className="tag">
                {tag.TagName} <span className="count">x {tag.PostCount}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
export default TopTagList;
