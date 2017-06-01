import React from "react";
import marked from "marked";

const QuestionForm = ({
  title,
  body,
  onUpdateTitle,
  onUpdateBody,
  onSubmitQuestion,
  isEditing
}) => {
  return (
    <form
      className="question-form"
      onSubmit={e => {
        e.preventDefault();
        onSubmitQuestion();
      }}
    >
      <div className="question-form-content">
        <div>
          Title
          <input
            type="text"
            value={title}
            onChange={e => {
              onUpdateTitle(e.target.value);
            }}
            className="form-control"
          />
        </div>

        <div>
          Body
          <textarea
            className="form-control question-body-input"
            value={body}
            onChange={e => {
              onUpdateBody(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="preview-container">
        <div
          className="preview"
          dangerouslySetInnerHTML={{ __html: marked(body) }}
        />
      </div>

      <div>
        <input
          type="submit"
          value={isEditing ? "Edit Your Question" : "Post Your Question"}
          className="btn btn-primary"
        />
      </div>
    </form>
  );
};
export default QuestionForm;
