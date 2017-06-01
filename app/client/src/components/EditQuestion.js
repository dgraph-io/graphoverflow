import React from "react";
import request from "superagent";
import { withRouter } from "react-router";

import { runQuery } from "../lib/helpers";
import { getQuestionQuery } from "../queries/EditQuestion";
import PostForm from "./PostForm";
import "../assets/styles/NewQuestion.css";

class EditQuestion extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "",
      body: ""
    };
  }

  componentDidMount() {
    const { match: { params } } = this.props;

    const query = getQuestionQuery(params.uid);
    runQuery(query)
      .then(res => {
        const { question } = res;
        this.setState({
          title: question[0].Title[0].Text,
          body: question[0].Body[0].Text
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleUpdateTitle = val => {
    this.setState({ title: val });
  };

  handleUpdateBody = val => {
    this.setState({ body: val });
  };

  handleSubmitQuestion = () => {
    const { history, match: { params } } = this.props;
    const { title, body } = this.state;
    request
      .put(`/api/posts/${params.uid}`)
      .send({ title, body })
      .then(res => {
        // On create, redirect to the question
        const uid = res.body;
        const questionLink = `/questions/${uid}`;
        history.push(questionLink);
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const { title, body } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-8">
            <PostForm
              postType="Question"
              title={title}
              body={body}
              onUpdateTitle={this.handleUpdateTitle}
              onUpdateBody={this.handleUpdateBody}
              onSubmitPost={this.handleSubmitQuestion}
              isEditing
            />
          </div>

          <div className="col-12 col-sm-4">
            <section className="side-section emphasize">
              <h2>Did You Know?</h2>

              <p>
                You can use markdown to format your content.
              </p>

              <a
                href="https://daringfireball.net/projects/markdown/syntax"
                target="_blank"
              >
                Get markdown help
              </a>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(EditQuestion);
