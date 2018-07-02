import React from "react";

import SearchResultQuestionItem from "./SearchResultQuestionItem";
import SearchResultAnswerItem from "./SearchResultAnswerItem";

const SearchResultList = ({ posts, searchTerm, searchTermWords }) => {
  return (
    <ul className="list-unstyled search-result-list">
      {posts.map(post => {
        if (post.Type === "Question") {
          return (
            <SearchResultQuestionItem
              question={post}
              searchTerm={searchTerm}
              searchTermWords={searchTermWords}
              key={post.uid}
            />
          );
        } else {
          return (
            <SearchResultAnswerItem
              answer={post}
              searchTerm={searchTerm}
              searchTermWords={searchTermWords}
              key={post.uid}
            />
          );
        }
      })}
    </ul>
  );
};

export default SearchResultList;
