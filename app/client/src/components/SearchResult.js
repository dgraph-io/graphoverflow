import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import request from "superagent";
import { Link } from "react-router-dom";

import Loading from "./Loading";
import SearchResultList from "./SearchResultList";
import RelatedQuestionList from "./RelatedQuestionList";

import { updateSearchTerm } from "../actions/search";
import { getSearchResultQuery } from "../queries/SearchResult";
import { runQuery } from "../lib/helpers";
import { getHotQuestionsQuery } from "../queries/Home";

import "../assets/styles/SearchResult.css";

function getSearchTerm(props) {
  const search = props.location.search;
  const queryParams = new URLSearchParams(search);
  return queryParams.get("q");
}

class SearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      posts: [],
      postsLoaded: false,
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

    runQuery(query).then(({ data }) => {
      const posts = data.posts || [];
      const hotQuestions = data.hotQuestions || [];

      this.setState({
        posts,
        hotQuestions,
        postsLoaded: true,
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
    if (!searchTerm) {
      return;
    }

    this.setState({ postsLoaded: false }, () => {
      const query = `{ ${getSearchResultQuery(searchTerm)} }`;

      runQuery(query).then(res => {
        const posts = res.posts || [];

        this.setState({
          posts,
          postsLoaded: true
        });
      });
    });
  };

  render() {
    const { posts, hotQuestions, postsLoaded, initialDataLoaded } = this.state;
    const searchTerm = getSearchTerm(this.props);
    const searchTermWords = searchTerm.split(" ");

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

              {postsLoaded
                ? <SearchResultList
                    posts={posts}
                    searchTerm={searchTerm}
                    searchTermWords={searchTermWords}
                  />
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

const mapStateToProps = state => ({
  searchTerm: state.search.searchTerm
});
const mapDispatchToProps = dispatch => ({
  handleChangeSearchTerm(searchTerm) {
    dispatch(updateSearchTerm(searchTerm));
  }
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchResult)
);
