import request from "superagent";

// runQuery makes a post request to the server to run query and returns a
// promise that resolves with a response
export function runQuery(queryText) {
  return request
    .post("http://localhost:8080/query")
    .send(queryText)
    .then(res => {
      return JSON.parse(res.text);
    });
}
