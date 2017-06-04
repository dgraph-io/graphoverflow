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
    ~Has.Answer {
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

function createPost({ title, body, postType, ownerID, parentPostID }) {
  const now = new Date().toISOString();

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
    <_:newBody> <Text> "${body}" .
    <_:newBody> <Type> "Body" .
    <_:post> <Body> <_:newBody> .

    ${hasAnswerRDF}
  }
}
`;

  return new Promise((resolve, reject) => {
    runQuery(query)
      .then(result => {
        resolve(result.uids.post);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}

function updatePost({ post, title, body, currentUserUID }) {
  const now = new Date().toISOString();

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
  <_:newBody> <Text> "${body}" .
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
    res.status(403).send("Only the owner can update the psot");
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

async function handleCreatePost(req, res, next) {
  const { title, body, postType } = req.body;
  const currentUserUID = req.user._uid_;

  const postUID = await createPost({
    title,
    body,
    postType,
    ownerID: currentUserUID,
    parentPostID
  });

  res.json(postUID);
}

async function handleDeletePost(req, res, next) {
  const postUID = req.params.uid;
  const currentUserUID = req.user && req.user._uid_;

  const post = await fetchPost(postUID);
  if (post.Owner[0]._uid_ !== currentUserUID) {
    res.status(403).send("Only the owner can delete the post");
    return;
  }

  const query = `
  mutation {
    delete {
      <${postUID}> * * .
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

/*************** route definitions **/
router.post("/", catchAsyncErrors(handleCreatePost));
router.put("/:uid", catchAsyncErrors(handleUpdatePost));
router.delete("/:uid", catchAsyncErrors(handleDeletePost));
router.post("/:uid/answers", catchAsyncErrors(handleCreateAnswer));

export default router;
