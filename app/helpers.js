import request from "superagent";

export function getEndpointBaseURL() {
  let endpointBaseURL;
  if (process.env.NODE_ENV === "production") {
    endpointBaseURL = "http://54.215.210.242";
  } else {
    endpointBaseURL = "http://127.0.0.1";
  }

  return endpointBaseURL;
}

// runQuery runs the query against dgraph endpoint
// Same helper exists in client; we duplicate it on the server side rather than
// sharing code between client and server for separation of concern
export function runQuery(queryText) {
  if (process.env.NODE_ENV === "dev") {
    console.log("Running query:");
    console.log(queryText);
  }

  const endpointBaseURL = getEndpointBaseURL();

  return request
    .post(`${endpointBaseURL}:8080/query`)
    .send(queryText)
    .then(res => {
      return JSON.parse(res.text);
    });
}
