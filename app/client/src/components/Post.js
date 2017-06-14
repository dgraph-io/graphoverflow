import React from "react";
import marked from "marked";
import request from "superagent";
import classnames from "classnames";

import PostHistory from "./PostHistory";
import PostActions from "./PostActions";
import CommentList from "./CommentList";
import CommentComposer from "./CommentComposer";
import TagList from "./TagList";
import PostVote from "./PostVote";
import { getCommentQuery } from "../queries/Question";
import { runQuery } from "../lib/helpers";

class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: props.post.Comment || [],
      userUpvoted: false,
      userDownvoted: false
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

  handleDeleteComment = commentUID => {
    const { post } = this.props;
    const { comments } = this.state;

    request
      .delete(`/api/posts/${post._uid_}/comments/${commentUID}`)
      .then(() => {
        const newComments = comments.filter(comment => {
          return comment._uid_ !== commentUID;
        });
        this.setState({
          comments: newComments
        });
      });
  };

  handleVote = ({ type }) => {
    const { post } = this.props;

    request.post(`/api/posts/${post._uid_}/vote`).send({ type }).then(() => {
      this.setState({
        userUpvoted: type === "Upvote",
        userDownvoted: type === "Downvote"
      });
    });
  };

  handleCancelVote = ({ type }) => {
    const { post } = this.props;

    request.delete(`/api/posts/${post._uid_}/vote`).send({ type }).then(() => {
      this.setState({
        userUpvoted: false,
        userDownvoted: false
      });
    });
  };

  render() {
    const { post, currentUser, onDeletePost } = this.props;
    const { comments, userUpvoted, userDownvoted } = this.state;

    return (
      <div
        className={classnames("post", {
          question: post.Type === "Question",
          answer: post.Type === "Answer"
        })}
      >
        {/* questions have title and answers don't */}
        {post.Title
          ? <h1 className="post-title">{post.Title[0].Text}</h1>
          : null}

        <div className="post-content">
          <PostVote
            post={post}
            onVote={this.handleVote}
            onCancelVote={this.handleCancelVote}
            userUpvoted={userUpvoted}
            userDownvoted={userDownvoted}
          />
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

            {comments
              ? <CommentList
                  currentUser={currentUser}
                  comments={comments}
                  onDeleteComment={this.handleDeleteComment}
                />
              : null}
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
