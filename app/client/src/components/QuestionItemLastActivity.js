import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import { kFormat } from "../lib/helpers";

const QuestionItemLastActivity = ({ question }) => {
  const questionCreatedAt = question.Timestamp;
  let lastAnswerCreatedAt;
  if (question["Has.Answer"]) {
    lastAnswerCreatedAt = question["Has.Answer"][0].Timestamp;
  }

  if (!lastAnswerCreatedAt) {
    const owner = question.Owner[0];
    return (
      <div>
        asked {moment(questionCreatedAt).fromNow()} by{" "}
        <Link
          to={`/users/${owner.uid}`}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {owner.DisplayName || "no_username"}
        </Link>{" "}
        <span className="reputation">{kFormat(owner.Reputation)}</span>
      </div>
    );
  }

  const lastAnswer = question["Has.Answer"][0];
  const lastAnswerOwner = lastAnswer.Owner ? lastAnswer.Owner[0] : null;

  return (
    <div>
      answered {moment(lastAnswerCreatedAt).fromNow()} by{" "}
      {lastAnswerOwner
        ? <div>
            <Link to={`/users/${lastAnswer.Owner[0].uid}`}>
              {lastAnswerOwner.DisplayName || "no_username"}
            </Link>{" "}
            <span className="reputation">
              {kFormat(lastAnswerOwner.Reputation)}
            </span>
          </div>
        : <div>Unknown user</div>}
    </div>
  );
};
export default QuestionItemLastActivity;
