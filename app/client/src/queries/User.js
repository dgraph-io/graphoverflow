const questionFragment = `
uid
Title {
  Text
}
upvoteCount: count(Upvote)
downvoteCount: count(Downvote)
`;

export function getUserQuery(userUID) {
  return `
    {
      var(func: uid(${userUID})) {
        authored as ~Owner(first: 5, orderdesc: Timestamp) @filter(eq(Type, "Question"))

        answers: ~Owner(first: 5, orderdesc: Timestamp) @filter(eq(Type, "Answer")) {
          answered as ~Has.Answer {
            Title {
              Text
            }
          }
        }
      }

      user(func: uid(${userUID})) {
        uid
        Id
        Reputation
        DisplayName
        AboutMe
      }

      authoredQuestions(func: uid(authored)) {
        ${questionFragment}
      }

      answeredQuestions(func: uid(answered)) {
        ${questionFragment}
      }
    }
  `;
}
