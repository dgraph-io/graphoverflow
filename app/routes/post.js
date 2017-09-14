import express from "express";

import { runQuery } from "../helpers";

const router = express.Router();

function catchAsyncErrors(fn) {
  return (req, res, next) => {
    const routePromise = fn(req, res, next);

    // If promise, pass the error to error handling middleware
    if (routePromise.catch) {
      routePromise.catch(err => next(err));
    }
  };
}

function fetchPost(uid) {
  const query = `
{
  post(func: uid(${uid})) {
    _uid_
    Title {
      Text
    }
    Body {
      Text
    }
    Owner {
      _uid_
    }
    ~Has.Answer {
      _uid_
    }
    ViewCount
    Type
  }
}
`;
  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(({ data }) => {
        // res does not contain `post` if no match
        let result = {};
        if (data.post) {
          result = data.post[0];
        }
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function fetchComment(uid) {
  const query = `{
    comment(func: uid(${uid})) {
      Author {
        _uid_
      }
      ~Comment {
        _uid_
      }
    }
  }`;

  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(({ data }) => {
        // res does not contain `post` if no match
        let result = {};
        if (data.comment) {
          result = data.comment[0];
        }
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function createPost({ title, body, postType, ownerID, parentPostID }) {
  const now = new Date().toISOString();
  const escapedBody = body.replace(/\n/g, "\\n");

  // THOUGHTS: composing RDFs dynamically using string interpolation is kinda
  // painful. But this is a common scenario when making apps.
  // somewhat related: maybe upsert will ease the pain
  let hasAnswerRDF = "";
  if (parentPostID && postType === "Answer") {
    hasAnswerRDF = `<${parentPostID}> <Has.Answer> <_:post> .`;
  }

  let titleVersionRDFs = "";
  if (title) {
    titleVersionRDFs = `
  <_:newTitle> <Timestamp> "${now}" .
  <_:newTitle> <Post> <_:post> .
  <_:newTitle> <Author> <${ownerID}> .
  <_:newTitle> <Text> "${title}" .
  <_:newTitle> <Type> "Title" .
  <_:post> <Title> <_:newTitle> .
`;
  }

  const query = `
mutation {
  set {
    <_:post> <Type> "${postType}" .
    <_:post> <ViewCount> "0" .
    <_:post> <Owner> <${ownerID}> .
    <_:post> <Timestamp> "${now}" .

    # Create versions
    ${titleVersionRDFs}

    <_:newBody> <Timestamp> "${now}" .
    <_:newBody> <Post> <_:post> .
    <_:newBody> <Author> <${ownerID}> .
    <_:newBody> <Text> "${escapedBody}" .
    <_:newBody> <Type> "Body" .
    <_:post> <Body> <_:newBody> .

    ${hasAnswerRDF}
  }
}
`;

  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(({ data }) => {
        resolve(data.uids.post);
      })
      .catch(({ errors }) => {
        console.log(errors);
        reject(errors);
      });
  });
}

function updatePost({ post, title, body, currentUserUID }) {
  const now = new Date().toISOString();
  const escapedBody = body.replace(/\n/g, "\\n");

  let titleSetMutation = "";
  let titleDeleteMutation = "";

  if (post.Type === "Question" && post.Title[0].Text !== title) {
    titleSetMutation = `
  <_:newTitle> <Timestamp> "${now}" .
  <_:newTitle> <Post> <${post._uid_}> .
  <_:newTitle> <Author> <${currentUserUID}> .
  <_:newTitle> <Text> "${title}" .
  <_:newTitle> <Type> "Title" .
  <${post._uid_}> <Title> <_:newTitle> .
`;
    titleDeleteMutation = `
  <${post._uid_}> <Title> * .
`;
  }

  let bodySetMutation = "";
  let bodyDeleteMutation = "";
  if (post.Body[0].Text !== body) {
    bodySetMutation = `
  <_:newBody> <Timestamp> "${now}" .
  <_:newBody> <Post> <${post._uid_}> .
  <_:newBody> <Author> <${currentUserUID}> .
  <_:newBody> <Text> "${escapedBody}" .
  <_:newBody> <Type> "Body" .
  <${post._uid_}> <Body> <_:newBody> .
`;
    bodyDeleteMutation = `
  <${post._uid_}> <Body> * .
`;
  }

  return new Promise((resolve, reject) => {
    if (!titleSetMutation && !bodySetMutation) {
      resolve();
      return;
    }

    const deleteMutation = `
mutation {
  delete {
    ${titleDeleteMutation}
    ${bodyDeleteMutation}
  }
}
`;
    const setMutation = `
  mutation {
    set {
      ${titleSetMutation}
      ${bodySetMutation}
    }
  }
  `;
    runQuery(deleteMutation)
      .then(() => {
        return runQuery(setMutation).then(resolve);
      })
      .catch(reject);
  });
}

async function handleUpdatePost(req, res, next) {
  console.log("req", req);
  console.log("req.params", req.params);
  const { title, body } = req.body;
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;

  const post = await fetchPost(postUID);
  if (post.Owner[0]._uid_ !== currentUserUID) {
    res.status(403).send("Only the owner can update the post");
    return;
  }
  await updatePost({ post, title, body, currentUserUID });

  let payload = {
    postUID
  };

  if (post["~Has.Answer"]) {
    payload = Object.assign({}, payload, {
      parentUID: post["~Has.Answer"][0]._uid_
    });
  }

  res.json(payload);
}

async function handleCreateQuestion(req, res, next) {
  const { title, body, postType } = req.body;
  const currentUserUID = req.user._uid_;

  const postUID = await createPost({
    title,
    body,
    postType,
    ownerID: currentUserUID
  });

  res.json({ postUID });
}

async function handleDeletePost(req, res, next) {
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;

  const post = await fetchPost(postUID);
  if (post.Owner[0]._uid_ !== currentUserUID) {
    console.log("post owner", post.Owner[0]._uid_);
    console.log("currentUser", currentUserUID);
    res.status(403).send("Only the owner can delete the post");
    return;
  }

  // following is necessary due to https://github.com/dgraph-io/dgraph/issues/1008
  const parentPostUID = post["~Has.Answer"] && post["~Has.Answer"][0]._uid_;
  let hasAnswerRDF = "";
  if (parentPostUID) {
    hasAnswerRDF = `<${parentPostUID}> <Has.Answer> <${postUID}> .`;
  } else {
    // find all the answers and remove them as well
    const { data } = await runQuery(`
{
  question(func: uid(${postUID})) {
    Has.Answer {
      _uid_
    }
  }
}
`);

    let answerUIDs = [];
    if (data.question && data.question[0]["Has.Answer"]) {
      answerUIDs = data.question[0]["Has.Answer"].map(ans => ans._uid_);
    }

    hasAnswerRDF = answerUIDs.map(uid => `<${uid}> * * .`).join("\n");
  }

  const query = `
  mutation {
    delete {
      <${postUID}> * * .
      ${hasAnswerRDF}
    }
  }
`;
  runQuery(query)
    .then(() => {
      res.end();
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
}

async function handleCreateAnswer(req, res, next) {
  const parentPostID = req.params.uid;
  const { body, postType } = req.body;
  const currentUserUID = req.user && req.user._uid_;

  const postUID = await createPost({
    body,
    postType,
    ownerID: currentUserUID,
    parentPostID
  });

  res.json(postUID);
}

function handleCreateComment(req, res, next) {
  const parentPostUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;
  const { body } = req.body;
  const now = new Date().toISOString();

  const query = `
mutation {
  set {
    <_:comment> <Author> <${currentUserUID}> .
    <${parentPostUID}> <Comment> <_:comment> .
    <_:comment> <Score> \"0\" .
    <_:comment> <Text> \"${body}\" .
    <_:comment> <Timestamp> \"${now}\" .
    <_:comment> <Type> \"Comment\" .
  }
}
`;

  runQuery(query)
    .then(({ data }) => {
      res.json({ commentUID: data.uids.comment });
    })
    .catch(error => {
      console.log(err);
    });
}

async function handleDeleteComment(req, res, next) {
  const commentUID = req.params.commentUID;
  const currentUserUID = req.user && req.user._uid_;

  const comment = await fetchComment(commentUID);
  if (comment.Author[0]._uid_ !== currentUserUID) {
    res.status(403).send("Only the owner can delete the post");
    return;
  }
  const parentPostUID = comment["~Comment"][0]._uid_;

  const query = `
  mutation {
    delete {
      <${commentUID}> * * .
      <${parentPostUID}> <Comment> <${commentUID}> .
    }
  }
`;
  runQuery(query)
    .then(() => {
      res.end();
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
}

async function handleCreateVote(req, res, next) {
  const { type } = req.body;
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;
  const now = new Date().toISOString();

  const query = `
  mutation {
    set {
      <${postUID}> <${type}> <_:v> .
      <_:v> <Author> <${currentUserUID}> .
      <_:v> <Timestamp> \"${now}\" .
    }
  }
`;

  let oppositeVoteType;
  if (type === "Upvote") {
    oppositeVoteType = "Downvote";
  } else if (type === "Downvote") {
    oppositeVoteType = "Upvote";
  }

  await cancelVote({
    postUID,
    type: oppositeVoteType,
    authorUID: currentUserUID
  });

  runQuery(query)
    .then(() => {
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
}

// fetchVote returns a promise that resolves with a vote
// voteType is either `Upvote` or `Downvote`
function fetchVote({ postUID, authorUID, voteType }) {
  const query = `
  {
    postId as var(func: uid(${postUID}))

    currentUser(func: uid(${authorUID})) @cascade {
      ~Author {
         _uid_
         ~${voteType} @filter(uid(postId))
      }
    }
  }
`;

  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(({ data }) => {
        if (!data || !data.currentUser || !data.currentUser[0]["~Author"]) {
          resolve({});
          return;
        }

        const vote = data.currentUser[0]["~Author"][0];
        resolve(vote);
      })
      .catch(reject);
  });
}

// cancelVote returns a promise that resolves when the query for cancelling vote
// is complete
async function cancelVote({ postUID, type, authorUID }) {
  const vote = await fetchVote({
    postUID,
    voteType: type,
    authorUID
  });

  const query = `
  mutation {
    delete {
      <${postUID}> <${type}> <${vote._uid_}> .
      <${vote._uid_}> * * .
    }
  }
`;

  return runQuery(query);
}

// handleCancelVote cancels the current user's vote for the post
async function handleCancelVote(req, res, next) {
  const { type } = req.body;
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;
  const now = new Date().toISOString();

  cancelVote({ postUID, type, authorUID: currentUserUID })
    .then(() => {
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
}

async function handleIncrementViewCount(req, res, next) {
  const postUID = req.params.uid;

  const post = await fetchPost(postUID);
  const viewCount = post.ViewCount;
  const nextViewCount = viewCount + 1;

  const query = `
  mutation {
    set {
      <${postUID}> <ViewCount> \"${nextViewCount}\" .
    }
  }
`;

  runQuery(query)
    .then(() => {
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
}

/*************** route definitions **/
router.post("/", catchAsyncErrors(handleCreateQuestion));
router.put("/:uid", catchAsyncErrors(handleUpdatePost));
router.delete("/:uid", catchAsyncErrors(handleDeletePost));
router.post("/:uid/answers", catchAsyncErrors(handleCreateAnswer));
router.post("/:uid/comments", handleCreateComment);
router.delete(
  "/:uid/comments/:commentUID",
  catchAsyncErrors(handleDeleteComment)
);
router.post("/:uid/viewCount", catchAsyncErrors(handleIncrementViewCount));

router.post("/:uid/vote", catchAsyncErrors(handleCreateVote));
router.delete("/:uid/vote", catchAsyncErrors(handleCancelVote));

export default router;
