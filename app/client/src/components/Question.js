import React from "react";
import { connect } from "react-redux";
import request from "superagent";
import { withRouter } from "react-router-dom";
import cloneDeep from "lodash/cloneDeep";

import { runQuery } from "../lib/helpers";
import { getQuestionQuery, getAnswerQuery } from "../queries/Question";
import QuestionLayout from "./QuestionLayout";

import "../assets/styles/Question.css";

class Question extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questionLoaded: false,
      question: {},
      answers: []
    };
  }

  componentDidMount() {
    const questionUID = this.props.match.params.uid;
    this.refreshQuestion(questionUID);
    this.incrementViewCount(questionUID);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.uid !== nextProps.match.params.uid) {
      this.refreshQuestion(nextProps.match.params.uid);
    }
  }

  incrementViewCount = questionUID => {
    request.post(`/api/posts/${questionUID}/viewCount`).catch(err => {
      console.log(err);
    });
  };

  refreshQuestion = questionUID => {
    const query = getQuestionQuery(questionUID);

    runQuery(query).then(res => {
      console.log(res);
      const question = res.question[0];
      const relatedQuestions = res.tags[0].relatedQuestions;

      // NOTE: `answers` is still present in `question`. Maybe we can delete it
      this.setState({
        question,
        relatedQuestions,
        answers: cloneDeep(question["Has.Answer"]) || [],
        questionLoaded: true
      });
    });
  };

  handleDeletePost = uid => {
    const { history } = this.props;

    request
      .delete(`/api/posts/${uid}`)
      .then(() => {
        history.push("/");
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleCreateAnswer = (questionUID, body) => {
    request
      .post(`/api/posts/${questionUID}/answers`)
      .send({ body, postType: "Answer" })
      .then(res => {
        const answerUID = res.body;
        const answerQuery = getAnswerQuery(answerUID);

        // Rather than having the server return the answer object, we fetch
        // the answer object using the returned uid, because client knows which
        // fields to fetch (see /quries/Question). It is generally a good idea
        // to keep the shape of the required objects in a single place to avoid
        // overfetching, or worse, underfetching
        return runQuery(answerQuery).then(res => {
          const answer = res.answer[0];

          this.setState({
            answers: [...this.state.answers, answer]
          });
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const { user } = this.props;
    const { question, relatedQuestions, answers, questionLoaded } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            {questionLoaded
              ? <QuestionLayout
                  question={question}
                  relatedQuestions={relatedQuestions}
                  answers={answers}
                  currentUser={user}
                  onDeletePost={this.handleDeletePost}
                  onCreateAnswer={this.handleCreateAnswer}
                />
              : <div>Loading</div>}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.session.user
});

const mapDispatchToProps = dispatch => ({});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Question)
);
