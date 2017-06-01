export function getNewQuestionQuery(title, body, ownerUID) {
  return `
  mutation {
    set {
      <_:question> <Owner> <
    }
  }
`;
}
