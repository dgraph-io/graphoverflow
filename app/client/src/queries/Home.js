// questionFragment represents the fields that needs to be fetched to render
// the question
export const questionFragment = `
uid
Id

Title {
  Text
}

Owner {
  DisplayName
  Reputation
  uid
}

Tag {
  TagName: Tag.Text
}

Has.Answer(orderdesc: Timestamp, first: 1) {
  Owner {
    DisplayName
    Reputation
    uid
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

    uv1 as sum(val(uv))
    dv1 as sum(val(dv))

    score as math(0.7 + ac * 0.2  + (uv1 - dv1) * 0.4 + (cc) * 0.4)
  }

  ${keyName}(func: uid(score), orderdesc: val(score), first: 100) {
    ${questionFragment}
  }
`;
}

export function getRecommendedQuestionsQuery(userUID) {
  // READ MORE AT: https://open.dgraph.io/post/recommendation2/
  return `
  {
    user as var(func: uid(${userUID})) {
      a as math(1)
      ~Owner @filter(eq(Type, "Answer")) {
        ~Has.Answer {
          Tag {
            sc1 as math(a)
            Tag.Text
          }
        }
      }

      ~Author {
        seen as ~Upvote {
          Upvote {
            Author {
              sc2 as math(a)
            }
          }
        }
      }
    }

    mytoptags as var(func: uid(sc1), orderdesc: val(sc1), first: 5) {
      Tag.Text
      val(sc1)
    }

    var(func: uid(user)) {
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

    var(func: uid(sc), orderdesc: val(sc), first: 10) {
      c as math(0)

      ~Owner @filter(eq(Type, "Answer")) {
        ~Has.Answer { # @filter(not val(answered)) {
          c1 as count(Tag @filter(uid(mytoptags)))
          fscore1 as math(max(c1, c))
        }
      }
    }

    var(func: uid(sc2), orderdesc: val(sc2), first: 10) @filter(not uid(user)) {
      b as math(1)
      ~Author {
        ~Upvote @filter(not uid(seen) and eq(Type, "Question")) {
          fscore2 as math(b)
          fscore3 as math(fscore1 + fscore2)
        }
      }
    }

    questions(func: uid(fscore3), orderdesc: val(fscore3), first: 25)  {
      ${questionFragment}
    }
  }`;
}

export const topTagsQuery = `
t as var(func: eq(Type, "Tag")) {
  c as count(~Tag)
}

topTags(func: uid(t), orderdesc: val(c), first: 10) {
  uid
  TagName: Tag.Text
  QuestionCount: val(c)
}
`;

export const topUsersQuery = `
var(func: eq(Type, "Question"), orderdesc: Timestamp, first: 50)  @filter(has(Chosen.Answer)) {
  ca as Chosen.Answer
}

var(func: uid(ca)) @groupby(Owner) {
  a as count(uid)
}

topUsers(func: uid(a), orderdesc: val(a)) {
  uid
  AboutMe
  DisplayName
  Reputation
  NumAcceptedAnswers: val(a)
}
`;
