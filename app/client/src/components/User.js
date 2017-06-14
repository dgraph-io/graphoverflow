import React from "react";
import cloneDeep from "lodash/cloneDeep";

import { getUserQuery } from "../queries/User";
import { runQuery } from "../lib/helpers";
import UserPostList from "./UserPostList";
import "../assets/styles/User.css";

export default class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      authoredQuestions: [],
      answeredQuestions: [],
      userLoaded: false
    };
  }

  componentDidMount() {
    const userUID = this.props.match.params.uid;

    const query = getUserQuery(userUID);
    runQuery(query)
      .then(res => {
        const user = res.user[0];
        const { answeredQuestions, authoredQuestions } = res;

        this.setState({
          user,
          answeredQuestions: cloneDeep(answeredQuestions) || [],
          authoredQuestions: cloneDeep(authoredQuestions) || [],
          userLoaded: true
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const {
      user,
      authoredQuestions,
      answeredQuestions,
      userLoaded
    } = this.state;

    if (!userLoaded) {
      return (
        <div>
          Loading
        </div>
      );
    }

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>{user.DisplayName}</h1>
            <p>
              Reputation: {user.Reputation}
            </p>
            <section className="user-section">
              <h2>About Me</h2>
              <div dangerouslySetInnerHTML={{ __html: user.AboutMe }} />

            </section>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-sm-6">
            <div className="user-section">
              <h2>Recent Questions</h2>

              <UserPostList posts={authoredQuestions} />
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="user-section">
              <h2>Recent Answers</h2>

              <UserPostList posts={answeredQuestions} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
