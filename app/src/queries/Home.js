// questionFragment represents the fields that needs to be fetched to render
// the question
const questionFragment = `
_uid_

Title {
  Text
}

Owner {
  DisplayName
  Reputation
  _uid_
}

Tags {
  TagName: Text
}

Has.Answer(orderdesc: Timestamp, first: 1) {
  Owner {
    DisplayName
    Reputation
    _uid_
  }
  Timestamp
}

ChosenAnswerCount: count(Chosen.Answer)
UpvoteCount: count(Vote) @filter(eq(Type, "Upvote"))
DownvoteCount: count(Vote) @filter(eq(Type, "Downvote"))
AnswerCount: count(Has.Answer)
ViewCount
Timestamp
`;

export const recentQuestionsQuery = `
questions(func: eq(Type, "Question"), orderdesc: Timestamp, first: 100) {
  ${questionFragment}
}
`;

export const hotQuestionsQuery = `
var(func: eq(Type, "Question"), orderdesc: Timestamp, first: 1000) {
  Has.Answer {
    uv as count(Upvote)
    dv as count(Downvote)
  }
	ac as count(Has.Answer)

  uv1 as sum(var(uv))
  dv1 as sum(var(dv))

  score as math(0.7 + ac * 0.2  + (uv1 - dv1) * 0.4)
}

questions(id: var(score), orderdesc: var(score), first: 100) {
	${questionFragment}
}
`;

export const topTagsQuery = `
t as var(func: eq(Type, "Tag")) {
  c as count(~Tags)
}

topTags(id: var(t), orderdesc: var(c), first: 10) {
  _uid_
  TagName: Text
  QuestionCount: var(c)
}
`;

export const topUsersQuery = `
var(func: eq(Type, "Question"), orderdesc: Timestamp, first: 100) {
  ca as Chosen.Answer
}

var(id: var(ca)) @groupby(Owner) {
  a as count(_uid_)
}

topUsers(id: var(a), orderdesc: var(a)) {
  _uid_
  AboutMe
  DisplayName
  Reputation
  NumAcceptedAnswers: var(a)
}
`;
