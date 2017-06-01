import React from "react";

import Post from "./Post";
import PostInfo from "./PostInfo";
import AnswerComposer from "./AnswerComposer";

const QuestionLayout = ({
  question,
  answers,
  currentUser,
  onDeletePost,
  onCreateAnswer
}) => {
  const questionScore = question.UpvoteCount - question.DownvoteCount;

  return (
    <div>
      <div className="row">
        <div className="col-12 col-sm-9">
          <Post
            post={question}
            currentUser={currentUser}
            onDeletePost={onDeletePost}
          />

          {answers.length > 0
            ? <div className="answers">
                {answers.map(answer => {
                  return (
                    <Post
                      key={answer._uid_}
                      post={answer}
                      currentUser={currentUser}
                      onDeletePost={onDeletePost}
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

      <div className="row">
        <div className="col-9">
          <AnswerComposer question={question} onCreateAnswer={onCreateAnswer} />
        </div>
      </div>
    </div>
  );
};
export default QuestionLayout;
