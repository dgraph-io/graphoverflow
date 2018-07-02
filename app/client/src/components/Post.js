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
      userDownvoted: props.post.UserDownvoteCount === 1,
      postScore: props.post.UpvoteCount - props.post.DownvoteCount
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.post.uid !== nextProps.post.uid) {
      this.setState({
        comments: nextProps.post.Comment,
        userUpvoted: nextProps.post.UserUpvoteCount === 1,
        userDownvoted: nextProps.post.UserDownvoteCount === 1,
        postScore: nextProps.post.UpvoteCount - nextProps.post.DownvoteCount
      });
    }
  }

  handleSubmitComment = body => {
    const { post } = this.props;

    request
      .post(`/api/posts/${post.uid}/comments`)
      .send({ body })
      .then(res => {
        const { commentUID } = res.body;
        const commentQuery = getCommentQuery(commentUID);

        return runQuery(commentQuery).then(({ data }) => {
          const comment = data.comment[0];

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
      .delete(`/api/posts/${post.uid}/comments/${commentUID}`)
      .then(() => {
        const newComments = comments.filter(comment => {
          return comment.uid !== commentUID;
        });
        this.setState({
          comments: newComments
        });
      });
  };

  handleVote = ({ type }) => {
    const { post } = this.props;
    const { userUpvoted, userDownvoted } = this.state;

    request.post(`/api/posts/${post.uid}/vote`).send({ type }).then(() => {
      let scoreDelta = 0;
      if (type === "Upvote") {
        if (userDownvoted) {
          scoreDelta = 2;
        } else {
          scoreDelta = 1;
        }
      } else if (type === "Downvote") {
        if (userUpvoted) {
          scoreDelta = -2;
        } else {
          scoreDelta = -1;
        }
      }

      this.setState(prevState => {
        return {
          userUpvoted: type === "Upvote",
          userDownvoted: type === "Downvote",
          postScore: prevState.postScore + scoreDelta
        };
      });
    });
  };

  handleCancelVote = ({ type }, done) => {
    const { post } = this.props;
    let scoreDelta = 0;
    if (type === "Upvote") {
      scoreDelta = -1;
    } else if (type === "Downvote") {
      scoreDelta = 1;
    }

    request.delete(`/api/posts/${post.uid}/vote`).send({ type }).then(() => {
      this.setState(prevState => {
        return {
          userUpvoted: false,
          userDownvoted: false,
          postScore: prevState.postScore + scoreDelta
        };
      }, done);
    });
  };

  render() {
    const { post, currentUser, onDeletePost } = this.props;
    const { comments, userUpvoted, userDownvoted, postScore } = this.state;

    return (
      <div
        className={classnames("post", {
          question: post.Type === "Question",
          answer: post.Type === "Answer"
        })}
      >
        <div href="#" id={post.uid} />
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
            postScore={postScore}
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
