import React from "react";
import QuestionList from "./QuestionList";
import HomeTabNavigation from "./HomeTabNavigation";
import TopTagList from "./TopTagList";

import { runQuery } from "../lib/helpers";
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
      dataLoaded: false,
      questions: [],
      topTags: [],
      currentTab: ALL_TABS.TAB_RECENT
    };
  }

  componentDidMount() {
    const query = `
{
  questions(func: eq(Type, "Question"), orderdesc: Timestamp, first: 100) {
    _uid_

  	Title {
      Text
    }

    Owner {
      DisplayName
      Reputation
      _uid_
    }

    Tags {
      Text
    }

    Has.Answer(orderdesc: Timestamp, first: 1) {
      Owner {
        DisplayName
        Reputation
        _uid_
      }
      Timestamp
    }

    VoteCount: count(Vote)
    AnswerCount: count(Has.Answer)
    ViewCount
    Timestamp
  }

  topTags(func: gt(count(PostCount), 0), orderdesc: PostCount, first: 10) {
    PostCount
    TagName
    _uid_
  }
}
`;
    runQuery(query).then(res => {
      const { questions, topTags } = res;

      this.setState({ questions, topTags, dataLoaded: true });
    });
  }

  handleChangeTab = newTab => {
    this.setState({ currentTab: newTab });
  };

  render() {
    const { questions, topTags, currentTab } = this.state;

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

              <QuestionList questions={questions} />

              <div>
                Looking for more? Try to search for a question.
              </div>
            </section>
          </div>

          <div className="col-12 col-sm-4">
            <TopTagList tags={topTags} />
          </div>
        </div>
      </div>
    );
  }
}
