const questionFragment = `
_uid_
Title {
  Text
}
upvoteCount: count(Upvote)
downvoteCount: count(Downvote)
`;

export function getUserQuery(userUID) {
  return `
    {
      var(id: ${userUID}) {
        authored as ~Owner(first: 5, orderdesc: Timestamp) @filter(eq(Type, "Question"))

        answers: ~Owner(first: 5, orderdesc: Timestamp) @filter(eq(Type, "Answer")) {
          answered as ~Has.Answer {
            Title {
              Text
            }
          }
        }
      }

      user(id: ${userUID}) {
        _uid_
        Id
        Reputation
        DisplayName
        AboutMe
      }

      authoredQuestions(id: var(authored)) {
        ${questionFragment}
      }

      answeredQuestions(id: var(answered)) {
        ${questionFragment}
      }
    }
  `;
}
