import React from "react";

export default class Question extends React.Component {
  render() {
    const { match } = this.props;

    return (
      <div>
        question {match.params.uid}
      </div>
    );
  }
}
