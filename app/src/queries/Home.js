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
    Text
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
topTags(func: gt(count(PostCount), 0), orderdesc: PostCount, first: 10) {
  PostCount
  TagName
  _uid_
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
