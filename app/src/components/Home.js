import React from "react";
import QuestionList from "./QuestionList";
import HomeTabNavigation from "./HomeTabNavigation";

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
      currentTab: ALL_TABS.TAB_RECENT
    };
  }

  componentDidMount() {
    const query = `
{
  questions(func: eq(Type, "Question"), orderdesc: Timestamp, first: 10) {
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
}
`;
    runQuery(query).then(res => {
      const { questions } = res;

      this.setState({ questions, dataLoaded: true });
    });
  }

  handleChangeTab = newTab => {
    this.setState({ currentTab: newTab });
  };

  render() {
    const { questions, currentTab } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <section className="questions">
              <div className="heading">
                <h2>Top Questions</h2>

                <HomeTabNavigation
                  currentTab={currentTab}
                  onChangeTab={this.handleChangeTab}
                  allTabs={ALL_TABS}
                />
              </div>

              <QuestionList questions={questions} />
            </section>
          </div>
        </div>
      </div>
    );
  }
}
