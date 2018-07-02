import React from "react";
import { Link } from "react-router-dom";
import striptags from "striptags";
import Highlighter from "react-highlight-words";

import { excerpt } from "../lib/helpers";

const SearchResultQuestionItem = ({
  question,
  searchTerm,
  searchTermWords
}) => {
  const questionLink = `/questions/${question.uid}`;
  const questionScore = question.UpvoteCount - question.DownvoteCount;

  return (
    <li className="search-result-item">
      <div className="row">
        <div className="col-12 col-sm-2">
          <div className="stats">
            <div className="stat">
              <div className="number">
                {questionScore}
              </div>
              <div className="noun">Votes</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-10">
          <div className="title">
            <Link to={questionLink}>
              Q:{" "}
              <Highlighter
                searchWords={searchTermWords}
                textToHighlight={question.Title[0].Text}
              />
            </Link>
          </div>

          <div className="exerpt">
            <Highlighter
              searchWords={searchTermWords}
              textToHighlight={excerpt(
                striptags(question.Body[0].Text),
                searchTerm
              )}
            />
          </div>
        </div>
      </div>
    </li>
  );
};
export default SearchResultQuestionItem;
