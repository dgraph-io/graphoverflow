// getQuestionQuery generates a query to fetch the question with the given UID
export function getQuestionQuery(questionUID) {
  return `{
    post(func: uid(${questionUID})) {
      Title {
        Text
      }
      Body {
        Text
      }
      Tags {
        TagName: Tag.Text
      }
      Type
      Timestamp
    }
  }`;
}
