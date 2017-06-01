import React from "react";
import { connect } from "react-redux";

import { runQuery } from "../lib/helpers";
import { getQuestionQuery } from "../queries/Question";
import QuestionLayout from "./QuestionLayout";

import "../assets/styles/Question.css";

class Question extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questionLoaded: false,
      question: {}
    };
  }

  componentDidMount() {
    const { match: { params } } = this.props;
    const query = getQuestionQuery(params.uid);

    runQuery(query).then(res => {
      const { question } = res;

      this.setState({ question: question[0], questionLoaded: true });
    });
  }

  render() {
    const { user } = this.props;
    const { question, questionLoaded } = this.state;

    const currentUser = user || {};

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            {questionLoaded
              ? <QuestionLayout question={question} currentUser={currentUser} />
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

export default connect(mapStateToProps, mapDispatchToProps)(Question);
