import React from "react";
import QuestionList from "./QuestionList";

import { runQuery } from "../lib/helpers";

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataLoaded: false,
      questions: []
    };
  }

  componentDidMount() {
    const query = `
{
  questions(func: eq(Type, "Question"), first: 10) {
    _uid_

  	Title {
      Text
    }

    Author {
      DisplayName
      Reputation
      _uid_
    }

    Tags {
      Text
    }

    VoteCount: count(Vote)
    AnswerCount: count(Has.Answer)
    ViewCount
  }
}
`;
    runQuery(query).then(res => {
      const { questions } = res;

      this.setState({ questions, dataLoaded: true });
    });
  }

  render() {
    const { questions } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <section className="questions">
              <h2>Top Questions</h2>

              <QuestionList questions={questions} />
            </section>
          </div>
        </div>
      </div>
    );
  }
}
