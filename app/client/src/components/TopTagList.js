import React from "react";
import { Link } from "react-router-dom";

import "../assets/styles/TopTagList.css";

const TopTagList = ({ tags }) => {
  return (
    <section className="side-section top-tag-list-container">
      <h2>Top Tags</h2>

      <ul className="tag-list">
        {tags.map(tag => {
          return (
            <li className="tag-item" key={tag.uid}>
              <span className="tag">
                <Link to={`/tags/${tag.TagName}`}>
                  {tag.TagName}{" "}
                  <span className="count">x {tag.QuestionCount}</span>
                </Link>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
export default TopTagList;
