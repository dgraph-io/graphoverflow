import React from "react";
import PostForm from "./PostForm";

export default class AnswerComposer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: ""
    };
  }

  handleUpdateBody = val => {
    this.setState({ body: val });
  };

  render() {
    const { question, onCreateAnswer } = this.props;
    const { body } = this.state;
    return (
      <div>
        <PostForm
          postType="Answer"
          body={body}
          onUpdateBody={this.handleUpdateBody}
          onSubmitPost={() => {
            onCreateAnswer(question.uid, body);
            this.setState({ body: "" });
          }}
        />
      </div>
    );
  }
}
