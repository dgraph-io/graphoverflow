import React from "react";

import "../assets/styles/CommentComposer.css";

export default class CommentComposer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      body: ""
    };
  }

  render() {
    const { onSubmitComment } = this.props;
    const { body } = this.state;

    return (
      <div className="comment-composer">
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmitComment(body);
            this.setState({ body: "" });
          }}
        >
          <div className="row">
            <div className="col-12 col-sm-12 col-md-9">
              <textarea
                className="form-control comment-input"
                value={body}
                onChange={e => {
                  this.setState({ body: e.target.value });
                }}
              />
            </div>
            <div className="col-12 col-sm-12 col-md-3">
              <input
                type="submit"
                value="Add Comment"
                className="btn btn-primary"
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}
