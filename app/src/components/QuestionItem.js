import React from "react";
import { Link } from "react-router-dom";
import { parseTagString } from "../lib/helpers";

import "../assets/styles/QuestionItem.css";

const QuestionItem = ({ question }) => {
  const tags = parseTagString(question.Tags[0].Text);

  return (
    <li className="question-item">
      <div className="row">
        <div className="col-12 col-sm-3">
          <div className="stats">
            <div className="stat">
              <div className="number">
                {question.VoteCount}
              </div>
              <div className="noun">
                Votes
              </div>
            </div>

            <div className="stat">
              <div className="number">
                {question.AnswerCount}
              </div>
              <div className="noun">
                Answers
              </div>
            </div>

            <div className="stat">
              <div className="number">
                {question.ViewCount}
              </div>
              <div className="noun">
                Views
              </div>
            </div>
          </div>

        </div>
        <div className="col-12 col-sm-9">
          <div>
            <Link to={`/questions/${question._uid_}`}>
              {JSON.stringify(question.Title[0].Text)}
            </Link>
          </div>
          <div className="tags">
            {tags.map(tag => {
              return (
                <div className="badge badge-info" key={tag}>
                  {tag}
                </div>
              );
            })}
          </div>
          <div className="last-activity" />
        </div>
      </div>
    </li>
  );
};
export default QuestionItem;
