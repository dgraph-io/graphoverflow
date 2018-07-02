import React from "react";
import pluralize from "pluralize";
import classnames from "classnames";

import Post from "./Post";
import PostInfo from "./PostInfo";
import AnswerComposer from "./AnswerComposer";
import RelatedQuestionList from "./RelatedQuestionList";

const QuestionLayout = ({
  question,
  relatedQuestions,
  answers,
  currentUser,
  onDeletePost,
  onCreateAnswer,
  currentAnswerTab,
  onChangeAnswerTab,
  allAnswerTabs
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

          <div className="heading">
            <div className="answer-count">
              {pluralize("Answer", question.AnswerCount, true)}
            </div>

            <ul className="tab-navigation">
              <li className="tab-item">
                <a
                  href="#tab-vote"
                  className={classnames("tab-link", {
                    active: currentAnswerTab === allAnswerTabs.TAB_ACTIVE
                  })}
                  onClick={e => {
                    e.preventDefault();
                    onChangeAnswerTab(allAnswerTabs.TAB_ACTIVE);
                  }}
                >
                  Active
                </a>
              </li>
              <li className="tab-item">
                <a
                  href="#tab-vote"
                  className={classnames("tab-link", {
                    active: currentAnswerTab === allAnswerTabs.TAB_OLDEST
                  })}
                  onClick={e => {
                    e.preventDefault();
                    onChangeAnswerTab(allAnswerTabs.TAB_OLDEST);
                  }}
                >
                  Oldest
                </a>
              </li>
              <li className="tab-item">
                <a
                  href="#tab-vote"
                  className={classnames("tab-link", {
                    active: currentAnswerTab === allAnswerTabs.TAB_VOTE
                  })}
                  onClick={e => {
                    e.preventDefault();
                    onChangeAnswerTab(allAnswerTabs.TAB_VOTE);
                  }}
                >
                  Votes
                </a>
              </li>
            </ul>
          </div>

          {answers.length > 0
            ? <div className="answers">
                {answers.map(answer => {
                  return (
                    <Post
                      key={answer.uid}
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

          <section className="section side-section emphasize">
            <h2>Related questions</h2>

            <RelatedQuestionList questions={relatedQuestions} />
          </section>
        </div>
      </div>

      {currentUser
        ? <div className="row">
            <div className="col-9">
              <AnswerComposer
                question={question}
                onCreateAnswer={onCreateAnswer}
              />
            </div>
          </div>
        : <div>
            <a href="/api/auth">Login</a> to answer questions
          </div>}
    </div>
  );
};
export default QuestionLayout;
