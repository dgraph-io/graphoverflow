import React from "react";
import { connect } from "react-redux";
import request from "superagent";
import { withRouter } from "react-router-dom";
import cloneDeep from "lodash/cloneDeep";

import { runQuery } from "../lib/helpers";
import {
  getQuestionQuery,
  getAnswerQuery,
  getAnswersQuery
} from "../queries/Question";
import QuestionLayout from "./QuestionLayout";
import Loading from "./Loading";

import "../assets/styles/Question.css";
import { ALL_ANSWER_TABS } from "../lib/const";

class Question extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questionLoaded: false,
      question: {},
      answers: [],
      currentAnswerTab: ALL_ANSWER_TABS.TAB_VOTE
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
    const { user } = this.props;
    let currentUserUID;
    if (user) {
      currentUserUID = user.uid;
    }
    const query = getQuestionQuery(questionUID, currentUserUID);

    runQuery(query).then(({ data }) => {
      const { tags } = data;
      const question = data.question[0];
      let relatedQuestions;

    if (tags.length > 1) {
      relatedQuestions = tags ? tags[0].relatedQuestions : [];
    }
    if (tags.length < 1) {
      relatedQuestions = [];
    }

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
        return runQuery(answerQuery).then(({ data }) => {
          const answer = data.answer[0];

          this.setState({
            answers: [...this.state.answers, answer]
          });
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  refreshAnswers = (questionUID, tabName) => {
    const query = getAnswersQuery(questionUID, tabName);

    runQuery(query).then(({ data }) => {
      if (data && data.question) {
        const question = data.question[0];
        const answers = question["Has.Answer"];

        this.setState({ answers });
      }
    });
  };

  handleChangeAnswerTab = tabName => {
    const questionUID = this.props.match.params.uid;

    this.setState({ currentAnswerTab: tabName }, () => {
      this.refreshAnswers(questionUID, tabName);
    });
  };

  render() {
    const { user } = this.props;
    const {
      question,
      relatedQuestions,
      answers,
      questionLoaded,
      currentAnswerTab
    } = this.state;

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
                  currentAnswerTab={currentAnswerTab}
                  allAnswerTabs={ALL_ANSWER_TABS}
                  onDeletePost={this.handleDeletePost}
                  onCreateAnswer={this.handleCreateAnswer}
                  onChangeAnswerTab={this.handleChangeAnswerTab}
                />
              : <Loading />}
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
