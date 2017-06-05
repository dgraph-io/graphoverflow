import React from "react";
import marked from "marked";
import request from "superagent";

import PostHistory from "./PostHistory";
import PostActions from "./PostActions";
import CommentList from "./CommentList";
import CommentComposer from "./CommentComposer";
import TagList from "./TagList";
import { getCommentQuery } from "../queries/Question";
import { runQuery } from "../lib/helpers";

class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: props.post.Comment
    };
  }

  handleSubmitComment = body => {
    const { post } = this.props;

    request
      .post(`/api/posts/${post._uid_}/comments`)
      .send({ body })
      .then(res => {
        const { commentUID } = res.body;
        const commentQuery = getCommentQuery(commentUID);

        return runQuery(commentQuery).then(res => {
          const comment = res.comment[0];

          this.setState({
            comments: [...this.state.comments, comment]
          });
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const { post, currentUser, onDeletePost } = this.props;
    const { comments } = this.state;

    const postScore = post.UpvoteCount - post.DownvoteCount;

    return (
      <div className="post">
        {/* questions have title and answers don't */}
        {post.Title
          ? <h1 className="post-title">{post.Title[0].Text}</h1>
          : null}

        <div className="post-content">
          <div className="vote-count-container">
            <div className="vote-count">
              {postScore}
            </div>
          </div>
          <div className="post-body-container">
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: marked(post.Body[0].Text) }}
            />
            {post.Tags ? <TagList tags={post.Tags} /> : null}
            <PostActions
              post={post}
              currentUser={currentUser}
              onDeletePost={onDeletePost}
            />
            <PostHistory post={post} />

            {comments ? <CommentList comments={comments} /> : null}
            {currentUser
              ? <CommentComposer onSubmitComment={this.handleSubmitComment} />
              : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Post;
