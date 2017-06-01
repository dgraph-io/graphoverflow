import React from "react";
import { Link } from "react-router-dom";

import QuestionList from "./QuestionList";
import HomeTabNavigation from "./HomeTabNavigation";
import TopTagList from "./TopTagList";
import TopUserList from "./TopUserList";
import { runQuery } from "../lib/helpers";
import {
  recentQuestionsQuery,
  hotQuestionsQuery,
  topTagsQuery,
  topUsersQuery
} from "../queries/Home";
import "../assets/styles/Home.css";

// enum for tabs
const ALL_TABS = {
  TAB_RECENT: "tab/recent",
  TAB_HOT: "tab/hot",
  TAB_INTERESTING: "tab/interesting"
};

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    runQuery(query).then(res => {
      const { questions, topTags, topUsers } = res;

      this.setState({ questions, topTags, topUsers, questionsLoaded: true });
    });
  }

  // refreshQuestions fetches the questions again
  refreshQuestions = () => {
    const { currentTab } = this.state;

    let query = "";
    if (currentTab === ALL_TABS.TAB_HOT) {
      query = `{ ${hotQuestionsQuery} }`;
    } else if (currentTab) {
      query = `{ ${recentQuestionsQuery} }`;
    }

    this.setState({ questionsLoaded: false }, () => {
      runQuery(query).then(res => {
        const { questions } = res;
        this.setState({ questions, questionsLoaded: true });
      });
    });
  };

  handleChangeTab = newTab => {
    this.setState({ currentTab: newTab }, this.refreshQuestions);
  };

  render() {
    const {
      questions,
      topTags,
      topUsers,
      currentTab,
      questionsLoaded
    } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-8">
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
                : <div>Loading...</div>}

              <div>
                Looking for more? Try to search for a question.
              </div>
            </section>
          </div>

          <div className="col-12 col-sm-4">
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
