import React from "react";

import QuestionItem from "./QuestionItem";

const QuestionList = ({ questions }) => {
  return (
    <ul className="list-unstyled question-list">
      {questions.map(question => {
        return <QuestionItem question={question} key={question.uid} />;
      })}
    </ul>
  );
};

export default QuestionList;
