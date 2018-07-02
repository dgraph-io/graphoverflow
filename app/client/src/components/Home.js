import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import QuestionList from "./QuestionList";
import HomeTabNavigation from "./HomeTabNavigation";
import TopTagList from "./TopTagList";
import TopUserList from "./TopUserList";
import Loading from "./Loading";

import { runQuery } from "../lib/helpers";
import {
  recentQuestionsQuery,
  getHotQuestionsQuery,
  topTagsQuery,
  topUsersQuery,
  getRecommendedQuestionsQuery
} from "../queries/Home";
import "../assets/styles/Home.css";

// enum for tabs
const ALL_TABS = {
  TAB_RECENT: "tab/recent",
  TAB_HOT: "tab/hot",
  TAB_RECOMMENDED: "tab/recommended"
};

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initialDataLoaded: false,
      questionsLoaded: false,
      questions: [],
      topTags: [],
      topUsers: [],
      currentTab: ALL_TABS.TAB_RECENT
    };
  }

  componentDidMount() {
    const query = `
{
  ${recentQuestionsQuery}
  ${topTagsQuery}
  ${topUsersQuery}
}
`;
    runQuery(query).then(({ data }) => {
      const { questions, topTags, topUsers } = data;

      this.setState({
        questions,
        topTags,
        topUsers,
        initialDataLoaded: true,
        questionsLoaded: true
      });
    });
  }

  // refreshQuestions fetches the questions again
  refreshQuestions = () => {
    const { user } = this.props;
    const { currentTab } = this.state;

    let query = "";
    if (currentTab === ALL_TABS.TAB_HOT) {
      query = `{ ${getHotQuestionsQuery()} }`;
    } else if (currentTab === ALL_TABS.TAB_RECOMMENDED) {
      if (!user) {
        this.setState({ questions: [] });
        return;
      }
      query = getRecommendedQuestionsQuery(user.uid);
    } else if (currentTab === ALL_TABS.TAB_RECENT) {
      query = `{ ${recentQuestionsQuery} }`;
    }

    this.setState({ questionsLoaded: false }, () => {
      runQuery(query)
        .then(({ data }) => {
          const { questions } = data;
          this.setState({ questions, questionsLoaded: true });
        })
        // an error can occur due to https://github.com/dgraph-io/dgraph/issues/1057
        .catch(err => {
          console.log(err);
          this.setState({ questions: [], questionsLoaded: true });
        });
    });
  };

  handleChangeTab = newTab => {
    this.setState({ currentTab: newTab }, this.refreshQuestions);
  };

  render() {
    const { user } = this.props;
    const {
      questions,
      topTags,
      topUsers,
      currentTab,
      questionsLoaded,
      initialDataLoaded
    } = this.state;

    if (!initialDataLoaded) {
      return <Loading />;
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-8">
            <section className="section">
              <div className="heading">
                <h2>Top Questions</h2>

                <HomeTabNavigation
                  currentTab={currentTab}
                  onChangeTab={this.handleChangeTab}
                  allTabs={ALL_TABS}
                />
              </div>

              {questionsLoaded
                ? <QuestionList questions={questions} />
                : <Loading />}

              {currentTab === ALL_TABS.TAB_RECOMMENDED && !user
                ? <div className="login-needed-alert">
                    You need to <a href="/api/auth">login</a> to view custom
                    recommendation.
                  </div>
                : null}
              {currentTab === ALL_TABS.TAB_RECOMMENDED && user
                ? <div>Recommended based on your upvote and answers</div>
                : null}
              {user &&
              currentTab === ALL_TABS.TAB_RECOMMENDED &&
              questions.length === 0
                ? <p>Upvote or answer questions to get recommendation</p>
                : null}

              <div>Looking for more? Try to search for a question.</div>
            </section>
          </div>

          <div className="col-12 col-sm-12 col-md-12 col-lg-4">
            <div className="question-action">
              <Link className="btn btn-primary" to="/questions/ask">
                Ask Question
              </Link>
            </div>
            <TopTagList tags={topTags} />
            <TopUserList users={topUsers} />
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
