import React from "react";
import marked from "marked";

const PostForm = ({
  title,
  body,
  onUpdateTitle,
  onUpdateBody,
  onSubmitPost,
  isEditing,
  postType
}) => {
  return (
    <form
      className="question-form"
      onSubmit={e => {
        e.preventDefault();
        onSubmitPost();
      }}
    >
      <div className="question-form-content">
        {postType === "Question"
          ? <div>
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
          : null}

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
          value={`${isEditing ? "Edit" : "Submit"} Your ${postType}`}
          className="btn btn-primary"
        />
      </div>
    </form>
  );
};
export default PostForm;
