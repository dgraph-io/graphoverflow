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
  DisplayName
}
Text
Score
Timestamp
`;

const AnswerFragment = `
Body {
  Text
}
Owner {
  DisplayName
  Reputation
  _uid_
}
Timestamp
UpvoteCount: count(Upvote)
DownvoteCount: count(Downvote)
History: ~Post(orderdesc: Timestamp) {
  ${HistoryFragment}
}
Comment {
  ${CommentFragment}
}
`;

export function getAnswerQuery(answerUID) {
  return `{
    answer(id: ${answerUID}) {
      ${AnswerFragment}
    }
  }`;
}

// getQuestionQuery generates a query to fetch the question with the given UID
export function getQuestionQuery(questionUID) {
  return `{
    question(id: ${questionUID}) {
      _uid_
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
      UpvoteCount: count(Upvote)
      DownvoteCount: count(Downvote)

      Tags {
        TagName: Text
      }

      Has.Answer {
        ${AnswerFragment}
      }

      Comment {
        ${CommentFragment}
      }

      History: ~Post(orderdesc: Timestamp) {
        ${HistoryFragment}
      }
    }
  }`;
}
