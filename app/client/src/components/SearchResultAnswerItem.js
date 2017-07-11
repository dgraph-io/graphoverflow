import React from "react";
import { Link } from "react-router-dom";
import striptags from "striptags";
import Highlighter from "react-highlight-words";

import { excerpt } from "../lib/helpers";

const SearchResultAnswerItem = ({ answer, searchTerm }) => {
  const questionLink = `/questions/${answer.question[0]._uid_}#${answer._uid_}`;
  const score = answer.UpvoteCount - answer.DownvoteCount;

  return (
    <li className="search-result-item">
      <div className="row">
        <div className="col-12 col-sm-3">
          <div className="stats">
            <div className="stat">
              <div className="number">
                {score}
              </div>
              <div className="noun">Votes</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-9">
          <div className="title">
            <Link to={questionLink}>
              A:{" "}
              <Highlighter
                searchWords={[searchTerm]}
                textToHighlight={answer.question[0].Title[0].Text}
              />
            </Link>
          </div>

          <div className="exerpt">
            <Highlighter
              searchWords={[searchTerm]}
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
