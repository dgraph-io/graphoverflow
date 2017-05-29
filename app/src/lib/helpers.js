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

// parseTagString parses the string denoting a list of tags and returns an array
// of tags. tagString is of format: `<tag1><tag2>...<tagn>`
export function parseTagString(tagString) {
  let ret = [];
  let currentTag = "";
  let reading = false;

  for (let i = 0; i < tagString.length; i++) {
    const char = tagString[i];

    if (char === "<") {
      reading = true;
      continue;
    } else if (char === ">") {
      reading = false;
    }

    if (!reading && currentTag !== "") {
      ret.push(currentTag);
      currentTag = "";
    }
    if (reading) {
      currentTag += char;
    }
  }

  return ret;
}
