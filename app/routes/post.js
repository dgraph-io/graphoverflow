import express from "express";

import { runQuery, runMutation, runDelation } from "../helpers";

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
    uid
    Title {
      Text
    }
    Body {
      Text
    }
    Owner {
      uid
    }
    ~Has.Answer {
      uid
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
        uid
      }
      ~Comment {
        uid
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
  const uidmap = 'post';
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

  const Nquads = `
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
`;

  return new Promise((resolve, reject) => {
    runMutation(Nquads, "blank", uidmap)
      .then(({ data }) => {
        resolve(data);
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
  <_:newTitle> <Post> <${post.uid}> .
  <_:newTitle> <Author> <${currentUserUID}> .
  <_:newTitle> <Text> "${title}" .
  <_:newTitle> <Type> "Title" .
  <${post.uid}> <Title> <_:newTitle> .
`;
    titleDeleteMutation = `
  <${post.uid}> <Title> * .
`;
  }

  let bodySetMutation = "";
  let bodyDeleteMutation = "";
  if (post.Body[0].Text !== body) {
    bodySetMutation = `
  <_:newBody> <Timestamp> "${now}" .
  <_:newBody> <Post> <${post.uid}> .
  <_:newBody> <Author> <${currentUserUID}> .
  <_:newBody> <Text> "${escapedBody}" .
  <_:newBody> <Type> "Body" .
  <${post.uid}> <Body> <_:newBody> .
`;
    bodyDeleteMutation = `
  <${post.uid}> <Body> * .
`;
  }

  return new Promise((resolve, reject) => {
    if (!titleSetMutation && !bodySetMutation) {
      resolve();
      return;
    }

    const deleteMutation = `
    ${titleDeleteMutation}
    ${bodyDeleteMutation}
`;
    const setMutation = `

      ${titleSetMutation}
      ${bodySetMutation}

  `;
  runDelation(deleteMutation)
      .then(() => {
        return runMutation(setMutation).then(resolve);
      })
      .catch(reject);
  });
}

async function handleUpdatePost(req, res, next) {
  const { title, body } = req.body;
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user.uid;

  const post = await fetchPost(postUID);
  if (post.Owner[0].uid !== currentUserUID) {
    res.status(403).send("Only the owner can update the post");
    return;
  }
  await updatePost({ post, title, body, currentUserUID });

  let payload = {
    postUID
  };

  if (post["~Has.Answer"]) {
    payload = Object.assign({}, payload, {
      parentUID: post["~Has.Answer"][0].uid
    });
  }

  res.json(payload);
}

async function handleCreateQuestion(req, res, next) {
  const { title, body, postType } = req.body;
  const currentUserUID = req.user.uid;
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
  const currentUserUID = req.user && req.user.uid;

  const post = await fetchPost(postUID);
  if (post.Owner[0].uid !== currentUserUID) {
    console.log("post owner", post.Owner[0].uid);
    console.log("currentUser", currentUserUID);
    res.status(403).send("Only the owner can delete the post");
    return;
  }

  // following is necessary due to https://github.com/dgraph-io/dgraph/issues/1008
  const parentPostUID = post["~Has.Answer"] && post["~Has.Answer"][0].uid;
  let hasAnswerRDF = "";
  if (parentPostUID) {
    hasAnswerRDF = `<${parentPostUID}> <Has.Answer> <${postUID}> .`;
  } else {
    // find all the answers and remove them as well
    const { data } = await runQuery(`
{
  question(func: uid(${postUID})) {
    Has.Answer {
      uid
    }
  }
}
`);
      // if (data.question.length > 1) {
      //   newdata = data;
      // }
    let answerUIDs = [];

    if (data.question && data.question.length > 0 && data.question[0]["Has.Answer"]) {
      answerUIDs = data.question[0]["Has.Answer"].map(ans => ans.uid);
    }

    hasAnswerRDF = answerUIDs.map(uid => `<${uid}> * * .`).join("\n");
  }

  const query = `
      <${postUID}> * * .
      ${hasAnswerRDF}
`;

runDelation(query)
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
  const currentUserUID = req.user && req.user.uid;

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
  const currentUserUID = req.user && req.user.uid;
  const { body } = req.body;

  const now = new Date().toISOString();
  const uidmap = 'comment';
  const query = `
    <_:comment> <Author> <${currentUserUID}> .
    <${parentPostUID}> <Comment> <_:comment> .
    <_:comment> <Score> \"0\" .
    <_:comment> <Text> \"${body}\" .
    <_:comment> <Timestamp> \"${now}\" .
    <_:comment> <Type> \"Comment\" .
`;

runMutation(query,"blank", uidmap)
    .then(({ data }) => {
      res.json({ commentUID: data });
    })
    .catch(error => {
      console.log(error);
    });
}

async function handleDeleteComment(req, res, next) {
  const commentUID = req.params.commentUID;
  const currentUserUID = req.user && req.user.uid;

  const comment = await fetchComment(commentUID);
  if (comment.Author[0].uid !== currentUserUID) {
    res.status(403).send("Only the owner can delete the post");
    return;
  }
  const parentPostUID = comment["~Comment"][0].uid;

  const query = `
      <${commentUID}> * * .
      <${parentPostUID}> <Comment> <${commentUID}> .

`;
runDelation(query)
    .then(() => {
      res.end();
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
}

async function handleCreateVote(req, res, next) {
  const { type } = req.body;
  console.log("start =>", req.body, "handleCreateVote")
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user.uid;
  const now = new Date().toISOString();
  const uidmap = 'vote';
  const Nquads = `
      <${postUID}> <${type}> <_:${uidmap}> .
      <_:${uidmap}> <Author> <${currentUserUID}> .
      <_:${uidmap}> <Timestamp> \"${now}\" .
`;

  let oppositeVoteType;
  if (type === "Upvote") {
    oppositeVoteType = "Downvote";
  } else if (type === "Downvote") {
    oppositeVoteType = "Upvote";
  }

 //! TODO: Need to check what is the problem here, avaliate about increasing and decreasing votes.

 const checkVote = await fetchVote({
  postUID,
  voteType: type,
  authorUID: currentUserUID
});
console.log(checkVote, "checkVote")
 if (checkVote){
  console.log(checkVote, "checkVote == true")
  await cancelVote({
    postUID,
    type: oppositeVoteType,
    authorUID: currentUserUID
  });
}

  runMutation(Nquads, "blank", uidmap)
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
         uid
         ~${voteType} @filter(uid(postId)){ uid }
      }
    }
  }
`;

  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(({ data }) => {
        console.log(query, "query in fetchVote", "data =>", data)
        if (!data || !data.currentUser || !data.currentUser[0]) {
          resolve(false);
          return;
        }
        //  if (!data || !data.currentUser || !data.currentUser.length === 0 || !data.currentUser[0]["~Author"]
        //  ) {
        // //if (!data || !data.currentUser || !data.currentUser[0]["~Author"]) {
        //   resolve({});
        //   return;
        // }
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
      <${postUID}> <${type}> <${vote.uid}> .
      <${vote.uid}> * * .
`;

  return runDelation(query);
}

// handleCancelVote cancels the current user's vote for the post
async function handleCancelVote(req, res, next) {
  const { type } = req.body;
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user.uid;
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
      <${postUID}> <ViewCount> \"${nextViewCount}\" .
`;

runMutation(query, "uid", postUID)
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
