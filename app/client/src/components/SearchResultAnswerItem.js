import React from "react";
import { Link } from "react-router-dom";
import striptags from "striptags";
import Highlighter from "react-highlight-words";

import { excerpt } from "../lib/helpers";

const SearchResultAnswerItem = ({ answer, searchTerm, searchTermWords }) => {
  // The dataset has data integrity issue. Some answers do not belong to questions
  if (!answer.question || !answer.question[0].Title) {
    return null;
  }

  const questionLink = `/questions/${answer.question[0].uid}#${answer.uid}`;
  const score = answer.UpvoteCount - answer.DownvoteCount;

  return (
    <li className="search-result-item">
      <div className="row">
        <div className="col-12 col-sm-2">
          <div className="stats">
            <div className="stat">
              <div className="number">
                {score}
              </div>
              <div className="noun">Votes</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-10">
          <div className="title">
            <Link to={questionLink}>
              A:{" "}
              <Highlighter
                searchWords={searchTermWords}
                textToHighlight={answer.question[0].Title[0].Text}
              />
            </Link>
          </div>

          <div className="exerpt">
            <Highlighter
              searchWords={searchTermWords}
              textToHighlight={excerpt(
                striptags(answer.Body[0].Text),
                searchTerm
              )}
            />
          </div>
        </div>
      </div>
    </li>
  );
};
export default SearchResultAnswerItem;
