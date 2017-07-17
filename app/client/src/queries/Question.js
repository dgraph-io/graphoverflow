import { ALL_ANSWER_TABS } from "../lib/const";

const HistoryFragment = `
Author {
  DisplayName
  Reputation
  _uid_
}
Type
Text
Timestamp
`;

const CommentFragment = `
_uid_
Author {
  _uid_
  DisplayName
}
Text
Score
Timestamp
`;

const AnswerFragment = `
_uid_
Body {
  Text
}
Owner {
  DisplayName
  Reputation
  _uid_
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

export function getCommentQuery(commentID) {
  return `{
    comment(id: ${commentID}) {
      ${CommentFragment}
    }
  }`;
}

export function getAnswerQuery(answerUID) {
  return `{
    answer(id: ${answerUID}) {
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
      var (id: ${questionUID}) {
        Has.Answer {
          answerTs as Timestamp
          ~Post {
            historyTs as Timestamp
          }
          Comment {
            commentTs as Timestamp
          }
          commentTsMax as max(var(commentTs))
          historyTsMax as max(var(historyTs))
          lastActive as math(max(max(answerTs, commentTsMax), historyTsMax))
        }
      }

      question(id: ${questionUID}) {
        Has.Answer(orderdesc: var(lastActive)) {
          ${AnswerFragment}
        }
      }
    }`;
  } else if (sortBy === ALL_ANSWER_TABS.TAB_OLDEST) {
    return `{
      question(id: ${questionUID}) {
        Has.Answer(orderasc: Timestamp) {
          ${AnswerFragment}
        }
      }
    }`;
  }

  return `{
    var (id: ${questionUID}) {
      Has.Answer {
        uv as count(Upvote)
        dv as count(Downvote)
        answer_score as math(uv - dv)
      }
    }

    question(id: ${questionUID}) {
      Has.Answer(orderdesc: var(answer_score)) {
        ${AnswerFragment}
      }
    }
  }`;
}

// getQuestionQuery generates a query to fetch the question with the given UID
export function getQuestionQuery(questionUID) {
  return `{
    var (id: ${questionUID}) {
      Has.Answer {
        uv as count(Upvote)
        dv as count(Downvote)
        answer_score as math(uv - dv)
      }
    }

    question(id: ${questionUID}) {
      _uid_
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
        _uid_
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

      Has.Answer(orderdesc: var(answer_score)) {
        ${AnswerFragment}
      }

      Comment {
        ${CommentFragment}
      }

      History: ~Post(orderdesc: Timestamp, first: 1) {
        ${HistoryFragment}
      }
    }

    tags(id: var(questionTags)) {
      relatedQuestions: ~Tag(first: 10) {
        _uid_
        Title {
          Text
        }
        UpvoteCount: count(Upvote)
        DownvoteCount: count(Downvote)
      }
    }
  }`;
}
