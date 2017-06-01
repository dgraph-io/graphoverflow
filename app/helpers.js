import request from "superagent";

// runQuery runs the query against dgraph endpoint
// Same helper exists in client; we duplicate it on the server side rather than
// sharing code between client and server for separation of concern
export function runQuery(queryText) {
  return request
    .post("http://localhost:8080/query")
    .send(queryText)
    .then(res => {
      return JSON.parse(res.text);
    });
}
