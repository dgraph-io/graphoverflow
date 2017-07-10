import React from "react";
import { Link } from "react-router-dom";

const RelatedQuestionList = ({ questions }) => {
  return (
    <ul className="list-unstyled">
      {questions.map(question => {
        const questionLink = `/questions/${question._uid_}`;
        const questionScore = question.UpvoteCount - question.DownvoteCount;

        return (
          <li className="related-question-item" key={question._uid_}>
            <Link to={questionLink}>
              <span className="related-question-score">
                {questionScore}
              </span>
              {question.Title[0].Text}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
export default RelatedQuestionList;
