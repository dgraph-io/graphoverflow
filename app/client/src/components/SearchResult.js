import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import request from "superagent";

import Loading from "./Loading";
import QuestionList from "./QuestionList";

import { getSearchResultQuery } from "../queries/SearchResult";
import { runQuery } from "../lib/helpers";

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
      questionsLoaded: false
    };
  }

  componentDidMount() {
    const searchTerm = getSearchTerm(this.props);

    this.fetchSearchResult(searchTerm);
  }

  componentWillUnmount() {
    const { onChangeSearchTerm } = this.props;
    this.props.location.search = "";
    onChangeSearchTerm("");
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.search !== nextProps.location.search) {
      const searchTerm = getSearchTerm(nextProps);

      this.fetchSearchResult(searchTerm);
    }
  }

  fetchSearchResult = searchTerm => {
    this.setState({ questionsLoaded: false }, () => {
      const query = getSearchResultQuery(searchTerm);

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
    const { questions, questionsLoaded } = this.state;
    const searchTerm = getSearchTerm(this.props);

    if (!questionsLoaded) {
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
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchResult)
);
