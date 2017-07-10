// questionFragment represents the fields that needs to be fetched to render
// the question
export const questionFragment = `
_uid_

Title {
  Text
}

Owner {
  DisplayName
  Reputation
  _uid_
}

Tag {
  TagName: Tag.Text
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
UpvoteCount: count(Upvote)
DownvoteCount: count(Downvote)
AnswerCount: count(Has.Answer)
ViewCount
Timestamp
`;

export const recentQuestionsQuery = `
questions(func: eq(Type, "Question"), orderdesc: Timestamp, first: 100) {
  ${questionFragment}
}
`;

export function getHotQuestionsQuery(keyName = "questions") {
  return `
  var(func: eq(Type, "Question"), orderdesc: Timestamp, first: 1000) {
    Has.Answer {
      uv as count(Upvote)
      dv as count(Downvote)
    }
    ac as count(Has.Answer)
    cc as count(Comment)

    uv1 as sum(var(uv))
    dv1 as sum(var(dv))

    score as math(0.7 + ac * 0.2  + (uv1 - dv1) * 0.4 + (cc) * 0.4)
  }

  ${keyName}(id: var(score), orderdesc: var(score), first: 100) {
    ${questionFragment}
  }
`;
}

export function getRecommendedQuestionsQuery(userUID) {
  return `
  {
    user as var(id: ${userUID}) {
      a as math(1)
      ~Owner @filter(eq(Type, "Answer")) {
        ~Has.Answer {
          Tags {
            sc1 as math(a)
            Tag.Text
          }
        }
      }
    }

    mytoptags as var(id: var(sc1), orderdesc: var(sc1), first: 5) {
      Tag.Text
      var(sc1)
    }

    var(id: var(user)) {
      const as math(1)
      ~Owner @filter(eq(Type, "Answer")) {
        ~Has.Answer {
          Has.Answer {
            Owner {
              sc as math(const)
            }
          }
        }
      }
    }

    var(id: var(sc), orderdesc: var(sc), first: 10) {
      DisplayName
      var(sc)
      ~Owner @filter(eq(Type, "Answer")) {
        ~Has.Answer { # @filter(not var(answered)) {
          fscore as count(Tags @filter(var(mytoptags)))
        }
      }
    }

    questions(id: var(fscore), orderdesc: var(fscore), first: 5)  {
      ${questionFragment}
    }
  }`;
}

export const topTagsQuery = `
t as var(func: eq(Type, "Tag")) {
  c as count(~Tag)
}

topTags(id: var(t), orderdesc: var(c), first: 10) {
  _uid_
  TagName: Tag.Text
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
