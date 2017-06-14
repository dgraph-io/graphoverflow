import request from "superagent";

// runQuery runs the query against dgraph endpoint
// Same helper exists in client; we duplicate it on the server side rather than
// sharing code between client and server for separation of concern
export function runQuery(queryText) {
  if (process.env.NODE_ENV === "dev") {
    console.log("Running query:");
    console.log(queryText);
  }

  let endpointBaseURL;
  if (process.env.NODE_ENV === "prod") {
    endpointBaseURL = "http://54.215.210.242";
  } else {
    endpointBaseURL = "http://127.0.0.1";
  }

  return request
    .post(`${endpointBaseURL}:8080/query`)
    .send(queryText)
    .then(res => {
      return JSON.parse(res.text);
    });
}
