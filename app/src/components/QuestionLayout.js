import React from "react";
import Post from "./Post";

const QuestionLayout = ({ question }) => {
  const questionScore = question.UpvoteCount - question.DownvoteCount;

  return (
    <div>
      <Post post={question} />

      <div className="answers">
        {question["Has.Answer"].map(answer => {
          return <Post key={answer._uid_} post={answer} />;
        })}
      </div>
    </div>
  );
};
export default QuestionLayout;
