import React from "react";
import { withRouter } from "react-router-dom";

import Loading from "./Loading";
import QuestionList from "./QuestionList";

import { runQuery } from "../lib/helpers";
import { getQuestionByTagNameQuery } from "../queries/Tag";

class Tag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questions: [],
      initialDataLoaded: false,
      questionsLoaded: false
    };
  }

  componentDidMount() {
    const { match: { params: { tagName } } } = this.props;
    const query = getQuestionByTagNameQuery(tagName);
    runQuery(query).then(res => {
      const { questions, topTags, topUsers } = res;

      this.setState({
        questions,
        initialDataLoaded: true,
        questionsLoaded: true
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.tagName !== nextProps.match.params.tagName) {
      this.refreshQuestions(nextProps.match.params.tagName);
    }
  }

  refreshQuestions = tagName => {
    const query = getQuestionByTagNameQuery(tagName);

    runQuery(query).then(res => {
      const { questions, topTags, topUsers } = res;

      this.setState({
        questions,
        questionsLoaded: true
      });
    });
  };

  render() {
    const { match: { params: { tagName } } } = this.props;
    const { initialDataLoaded, questionsLoaded, questions } = this.state;

    if (!initialDataLoaded) {
      return <Loading />;
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <section className="section">
              <div className="heading">
                <h2>
                  Questions tagged with "{tagName}"
                </h2>
              </div>

              {questionsLoaded
                ? <QuestionList questions={questions} />
                : <Loading />}
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Tag);
