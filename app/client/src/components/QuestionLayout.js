import React from "react";

import Post from "./Post";
import PostInfo from "./PostInfo";

const QuestionLayout = ({ question, currentUser }) => {
  const questionScore = question.UpvoteCount - question.DownvoteCount;
  const answers = question["Has.Answer"];

  return (
    <div className="row">
      <div className="col-12 col-sm-9">
        <Post post={question} currentUser={currentUser} />

        {answers
          ? <div className="answers">
              {answers.map(answer => {
                return (
                  <Post
                    key={answer._uid_}
                    post={answer}
                    currentUser={currentUser}
                  />
                );
              })}
            </div>
          : <div>no answers yet</div>}

      </div>
      <div className="col-12 col-sm-3">
        <PostInfo post={question} />
      </div>
    </div>
  );
};
export default QuestionLayout;
