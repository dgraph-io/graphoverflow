import React from "react";
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
        asked
        {" "}
        {moment(questionCreatedAt).fromNow()}
        {" "}
        by
        {" "}
        {owner.DisplayName}
        {" "}
        <span className="reputation">{kFormat(owner.Reputation)}</span>
      </div>
    );
  }

  const lastAnswer = question["Has.Answer"][0];

  return (
    <div>
      answered {moment(lastAnswerCreatedAt).fromNow()} by
      {" "}
      {lastAnswer.Owner[0].DisplayName}
      {" "}
      <span className="reputation">
        {kFormat(lastAnswer.Owner[0].Reputation)}
      </span>
    </div>
  );
};
export default QuestionItemLastActivity;
