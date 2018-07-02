import { ALL_ANSWER_TABS } from "../lib/const";

const HistoryFragment = `
Author {
  DisplayName
  Reputation
  uid
}
Type
Text
Timestamp
`;

const CommentFragment = `
uid
Author {
  uid
  DisplayName
}
Text
Score
Timestamp
`;

const AnswerFragment = `
uid
Body {
  Text
}
Owner {
  DisplayName
  Reputation
  uid
}
Timestamp
Type
UpvoteCount: count(Upvote)
DownvoteCount: count(Downvote)
History: ~Post(orderdesc: Timestamp, first: 1) {
  ${HistoryFragment}
}
Comment {
  ${CommentFragment}
}
`;

function getUserVoteCountFragment(userUID) {
  if (userUID) {
    // parseInt necessary for https://github.com/dgraph-io/dgraph/issues/1204
    const userUIDInDec = parseInt(userUID);
    return `
      UserUpvoteCount: count(Upvote @filter(uid_in(Author, ${userUIDInDec})))
      UserDownvoteCount: count(Downvote @filter(uid_in(Author, ${userUIDInDec})))
    `;
  }

  return "";
}

export function getCommentQuery(commentID) {
  return `{
    comment(func: uid(${commentID})) {
      ${CommentFragment}
    }
  }`;
}

export function getAnswerQuery(answerUID) {
  return `{
    answer(func: uid(${answerUID})) {
      ${AnswerFragment}
    }
  }`;
}

export function getAnswersQuery(
  questionUID,
  sortBy = ALL_ANSWER_TABS.TAB_VOTE
) {
  if (sortBy === ALL_ANSWER_TABS.TAB_ACTIVE) {
    return `{
      var (func: uid(${questionUID})) {
        Has.Answer {
          answerTs as Timestamp
          ~Post {
            historyTs as Timestamp
          }
          Comment {
            commentTs as Timestamp
          }
          commentTsMax as max(val(commentTs))
          historyTsMax as max(val(historyTs))
          lastActive as math(max(max(answerTs, commentTsMax), historyTsMax))
        }
      }

      question(func: uid(${questionUID})) {
        Has.Answer(orderdesc: val(lastActive)) {
          ${AnswerFragment}
        }
      }
    }`;
  } else if (sortBy === ALL_ANSWER_TABS.TAB_OLDEST) {
    return `{
      question(func: uid(${questionUID})) {
        Has.Answer(orderasc: Timestamp) {
          ${AnswerFragment}
        }
      }
    }`;
  }

  return `{
    var (func: uid(${questionUID})) {
      Has.Answer {
        uv as count(Upvote)
        dv as count(Downvote)
        answer_score as math(uv - dv)
      }
    }

    question(func: uid(${questionUID})) {
      Has.Answer(orderdesc: val(answer_score)) {
        ${AnswerFragment}
      }
    }
  }`;
}

// getQuestionQuery generates a query to fetch the question with the given UID
export function getQuestionQuery(questionUID, currentUserUID) {
  return `{
    var (func: uid(${questionUID})) {
      Has.Answer {
        uv as count(Upvote)
        dv as count(Downvote)
        answer_score as math(uv - dv)
      }
    }

    question(func: uid(${questionUID})) {
      uid
      Id # id from Stack Exchange
      Title {
        Text
      }
      Body {
        Text
      }
      Owner {
        DisplayName
        Reputation
        uid
      }
      ViewCount
      Timestamp
      Type
      UpvoteCount: count(Upvote)
      DownvoteCount: count(Downvote)

      questionTags as Tag {
        TagName: Tag.Text
      }

      AnswerCount: count(Has.Answer)

      Has.Answer(orderdesc: val(answer_score)) {
        ${AnswerFragment}
        ${getUserVoteCountFragment(currentUserUID)}
      }

      Comment {
        ${CommentFragment}
      }

      History: ~Post(orderdesc: Timestamp, first: 1) {
        ${HistoryFragment}
      }

      ${getUserVoteCountFragment(currentUserUID)}
    }

    tags(func: uid(questionTags)) {
      relatedQuestions: ~Tag(first: 10) {
        uid
        Title {
          Text
        }
        UpvoteCount: count(Upvote)
        DownvoteCount: count(Downvote)
      }
    }
  }`;
}
