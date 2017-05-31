import request from "superagent";

export function runQuery(queryText) {
  return request
    .post("http://localhost:8080/query")
    .send(queryText)
    .then(res => {
      return JSON.parse(res.text);
    });
}
