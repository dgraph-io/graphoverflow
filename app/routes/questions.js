import express from "express";

import { runQuery } from "../helpers";

const router = express.Router();

router.post("/", (req, res, next) => {
  const { title, body } = req.body;
  const now = new Date().toISOString();
  const currentUserUID = req.user._uid_;

  const query = `
mutation {
  set {
    <_:question> <Type> "Question" .
    <_:question> <ViewCount> "0" .
    <_:question> <Owner> <${currentUserUID}> .
    <_:question> <Timestamp> "${now}" .

    # Create versions
    <_:newTitle> <Timestamp> "${now}" .
    <_:newTitle> <Post> <_:question> .
    <_:newTitle> <Author> <${currentUserUID}> .
    <_:newTitle> <Text> "${title}" .
    <_:newTitle> <Type> "Title" .
    <_:question> <Title> <_:newTitle> .

    <_:newBody> <Timestamp> "${now}" .
    <_:newBody> <Post> <_:question> .
    <_:newBody> <Author> <${currentUserUID}> .
    <_:newBody> <Text> "${body}" .
    <_:newBody> <Type> "Body" .
    <_:question> <Body> <_:newBody> .
  }
}
`;

  console.log(query);

  runQuery(query)
    .then(result => {
      // Respond with the _uid_ of the question we created
      res.json(result.uids.question);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
});

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
  post(id: ${uid}) {
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
  }
}
`;
  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(res => {
        // res does not contain `post` if no match
        let result = {};
        if (res.post) {
          result = res.post[0];
        }
        resolve(result);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function updatePost({ post, title, body, currentUserUID }) {
  const now = new Date().toISOString();

  let titleMutation = "";
  if (post.Title[0].Text !== title) {
    titleMutation = `
  <_:newTitle> <Timestamp> "${now}" .
  <_:newTitle> <Post> <_:question> .
  <_:newTitle> <Author> <${currentUserUID}> .
  <_:newTitle> <Text> "${title}" .
  <_:newTitle> <Type> "Title" .
  <${post._uid_}> <Title> <_:newTitle> .
`;
  }
  let bodyMutation = "";
  if (post.Body[0].Text !== body) {
    titleMutation = `
  <_:newBody> <Timestamp> "${now}" .
  <_:newBody> <Post> <_:question> .
  <_:newBody> <Author> <${currentUserUID}> .
  <_:newBody> <Text> "${body}" .
  <_:newBody> <Type> "Body" .
  <${post._uid_}> <Body> <_:newBody> .
`;
  }

  return new Promise((resolve, reject) => {
    if (!titleMutation && !bodyMutation) {
      resolve();
      return;
    }

    const query = `
  mutation {
    set {
      ${titleMutation}
      ${bodyMutation}
    }
  }
  `;
    runQuery(query).then(resolve).catch(reject);
  });
}

async function updateQuestion(req, res, next) {
  const { title, body } = req.body;
  const questionUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;

  const post = await fetchPost(questionUID);
  if (post.Owner[0]._uid_ !== currentUserUID) {
    res.status(403).send("Only the owner can update the question");
    return;
  }
  await updatePost({ post, title, body, currentUserUID });
}

router.put("/:uid", catchAsyncErrors(updateQuestion));

export default router;
