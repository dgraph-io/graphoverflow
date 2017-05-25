import React from "react";
import { Link } from "react-router-dom";

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
      <div>
        <ul className="list-unstyled">
          {questions.map(question => {
            return (
              <li>
                <Link to={`/questions/${question._uid_}`}>
                  {JSON.stringify(question.Title[0].Text)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
