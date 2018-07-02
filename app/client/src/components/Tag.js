import React from "react";
import { withRouter, Link } from "react-router-dom";

import Loading from "./Loading";
import QuestionList from "./QuestionList";

import { runQuery } from "../lib/helpers";
import { getQuestionByTagNameQuery, getRelatedTags } from "../queries/Tag";

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
    const query = `
{
  ${getQuestionByTagNameQuery(tagName)}
  ${getRelatedTags(tagName)}
}`;
    runQuery(query).then(({ data }) => {
      const { questions, relatedTags } = data;

      this.setState({
        questions,
        relatedTags,
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
    const query = `
{
  ${getQuestionByTagNameQuery(tagName)}
  ${getRelatedTags(tagName)}
}`;

    runQuery(query).then(({ data }) => {
      const { questions, relatedTags, topTags, topUsers } = data;

      this.setState({
        questions,
        relatedTags,
        questionsLoaded: true
      });
    });
  };

  render() {
    const { match: { params: { tagName } } } = this.props;
    const {
      initialDataLoaded,
      questionsLoaded,
      questions,
      relatedTags
    } = this.state;

    if (!initialDataLoaded) {
      return <Loading />;
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-8">
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

          <div className="col-12 col-sm-4">
            <div className="question-action">
              <Link className="btn btn-primary" to="/questions/ask">
                Ask Question
              </Link>
            </div>
            <div>
              <section className="side-section emphasize">
                <h2>Related tags</h2>
                <ul className="list-unstyled">
                  {relatedTags.map(tag => {
                    return (
                      <li key={tag.uid}>
                        <span className="tag">
                          <Link to={`/tags/${tag.TagName}`}>
                            {tag.TagName}
                          </Link>
                        </span>
                        x {tag.OverlapCount}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Tag);
