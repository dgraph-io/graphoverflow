import React from "react";

import { runQuery } from "../lib/helpers";
import { getQuestionQuery } from "../queries/Question";
import QuestionLayout from "./QuestionLayout";

import "../assets/styles/Question.css";

export default class Question extends React.Component {
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
    const { question, questionLoaded } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            {questionLoaded
              ? <QuestionLayout question={question} />
              : <div>Loading</div>}
          </div>
        </div>
      </div>
    );
  }
}
