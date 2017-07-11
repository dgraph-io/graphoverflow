import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import request from "superagent";
import { Link } from "react-router-dom";

import Loading from "./Loading";
import QuestionList from "./QuestionList";
import RelatedQuestionList from "./RelatedQuestionList";

import { updateSearchTerm } from "../actions/search";
import { getSearchResultQuery } from "../queries/SearchResult";
import { runQuery } from "../lib/helpers";
import { getHotQuestionsQuery } from "../queries/Home";

function getSearchTerm(props) {
  const search = props.location.search;
  const queryParams = new URLSearchParams(search);
  return queryParams.get("q");
}

class SearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questions: [],
      questionsLoaded: false,
      initialDataLoaded: false
    };
  }

  componentDidMount() {
    const searchTerm = getSearchTerm(this.props);
    const searchResultQuery = getSearchResultQuery(searchTerm);

    const query = `
{
  ${searchResultQuery}
  ${getHotQuestionsQuery("hotQuestions")}
}
`;

    runQuery(query).then(res => {
      const questions = res.questions || [];
      const hotQuestions = res.hotQuestions || [];

      this.setState({
        questions,
        hotQuestions,
        questionsLoaded: true,
        initialDataLoaded: true
      });
    });

    this.refreshSearchResult(searchTerm);
  }

  componentWillUnmount() {
    const { handleChangeSearchTerm } = this.props;
    this.props.location.search = "";
    handleChangeSearchTerm("");
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.search !== nextProps.location.search) {
      const searchTerm = getSearchTerm(nextProps);

      this.refreshSearchResult(searchTerm);
    }
  }

  refreshSearchResult = searchTerm => {
    this.setState({ questionsLoaded: false }, () => {
      const query = `{ ${getSearchResultQuery(searchTerm)} }`;

      runQuery(query).then(res => {
        const questions = res.questions || [];

        this.setState({
          questions,
          questionsLoaded: true
        });
      });
    });
  };

  render() {
    const {
      questions,
      hotQuestions,
      questionsLoaded,
      initialDataLoaded
    } = this.state;
    const searchTerm = getSearchTerm(this.props);

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
                  Search results for "{searchTerm}"
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

            <section className="section side-section emphasize">
              <h2>Hot questions</h2>

              <RelatedQuestionList questions={hotQuestions} />
            </section>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  handleChangeSearchTerm(searchTerm) {
    dispatch(updateSearchTerm(searchTerm));
  }
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchResult)
);
