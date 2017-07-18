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
      userUpvoted: props.post.UserUpvoteCount === 1,
      userDownvoted: props.post.UserDownvoteCount === 1
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.post._uid_ !== nextProps.post._uid_) {
      this.setState({
        comments: nextProps.post.Comment
      });
    }
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
        <div href="#" id={post._uid_} />
        {/* questions have title and answers don't */}
        {post.Title
          ? <div className="post-title-container">
              <h1 className="post-title">{post.Title[0].Text}</h1>{" "}
              <a
                className="attribution-link"
                href={`https://lifehacks.stackexchange.com/questions/${post.Id}`}
                target="_blank"
              >
                <i className="fa fa-external-link" />
              </a>
            </div>
          : null}

        <div className="post-content">
          <PostVote
            post={post}
            onVote={this.handleVote}
            onCancelVote={this.handleCancelVote}
            userUpvoted={userUpvoted}
            userDownvoted={userDownvoted}
            currentUser={currentUser}
          />
          <div className="post-body-container">
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: marked(post.Body[0].Text) }}
            />
            {post.Tag ? <TagList tags={post.Tag} /> : null}
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
