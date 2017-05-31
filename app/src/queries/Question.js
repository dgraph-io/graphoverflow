const HistoryFragment = `
History: ~Post(orderdesc: Timestamp) {
  Author {
    DisplayName
    Reputation
    _uid_
  }
  Type
  Text
  Timestamp
}
`;

// getQuestionQuery generates a query to fetch the question with the given UID
export function getQuestionQuery(questionUID) {
  return `{
    question(id: ${questionUID}) {
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

      Has.Answer {
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
        ${HistoryFragment}
      }

      ${HistoryFragment}
    }
  }`;
}
