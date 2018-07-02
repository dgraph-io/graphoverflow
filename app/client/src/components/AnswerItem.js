import React from "react";
import { Link, withRouter } from "react-router-dom";
import classnames from "classnames";

import QuestionItemLastActivity from "./QuestionItemLastActivity";

import "../assets/styles/QuestionItem.css";

const QuestionItem = ({ question, history }) => {
  // console.log(question.uid);
  const questionLink = `/questions/${question.uid}`;
  const questionScore = question.UpvoteCount - question.DownvoteCount;

  return (
    <li
      className={classnames("question-item", {
        unanswered: question.ChosenAnswerCount === 0
      })}
      onClick={() => {
        history.push(questionLink);
      }}
    >
      <div className="row">
        <div className="col-12 col-sm-3">
          <div className="stats">
            <div className="stat">
              <div className="number">
                {questionScore}
              </div>
              <div className="noun">Votes</div>
            </div>

            <div className="stat">
              <div className="number">
                {question.AnswerCount}
              </div>
              <div className="noun">Answers</div>
            </div>

            <div className="stat">
              <div className="number">
                {question.ViewCount}
              </div>
              <div className="noun">Views</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-9">
          <div>
            <Link
              to={questionLink}
              onClick={e => {
                e.stopPropagation();
              }}
            >
              {JSON.stringify(question.Title[0].Text)}
            </Link>
          </div>
          <div className="tags">
            {question.Tag
              ? question.Tag.map(tag => {
                  return (
                    <div className="tag" key={tag.TagName}>
                      {tag.TagName}
                    </div>
                  );
                })
              : null}
          </div>
          <div className="last-activity">
            <QuestionItemLastActivity question={question} />
          </div>
        </div>
      </div>
    </li>
  );
};
export default withRouter(QuestionItem);
