import express from "express";

import { runQuery } from "../helpers";

const router = express.Router();

router.post("/", function(req, res, next) {
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

export default router;
