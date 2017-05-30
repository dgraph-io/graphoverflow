export const recentQuestionsQuery = `
questions(func: eq(Type, "Question"), orderdesc: Timestamp, first: 100) {
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

  VoteCount: count(Vote)
  AnswerCount: count(Has.Answer)
  ViewCount
  Timestamp
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
