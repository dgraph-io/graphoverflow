import request from "superagent";

export function getEndpointBaseURL() {
  let endpointBaseURL;
  if (process.env.NODE_ENV === "production") {
    endpointBaseURL = "https://graphoverflow.dgraph.io";
  } else {
    endpointBaseURL = "http://127.0.0.1:8080";
  }

  return endpointBaseURL;
}

// runQuery makes a post request to the server to run query and returns a
// promise that resolves with a response
export function runQuery(queryText) {
  const endpointBaseURL = getEndpointBaseURL();

  return request.post(`${endpointBaseURL}/query`).send(queryText).then(res => {
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

// kFormat formats the number with suffix 'k' if greater than 999
export function kFormat(num) {
  return num > 999 ? (num / 1000).toFixed(1) + "k" : num;
}

export function trimStr(str, maxLen = 100) {
  if (str.length < maxLen) {
    return str;
  }

  return str.substring(0, maxLen - 3) + "...";
}

export function stripTags(str = "") {
  return str.replace(/(<([^>]+)>)/gi, "");
}

export function excerpt(text, phrase, radius = 100, ending = "...") {
  var append, prepend, phraseLen, pos, startPos, endPos, excerpt, textLen;
  if (!text || !phrase) {
    return text;
  }

  append = prepend = ending;
  phraseLen = phrase.length;
  textLen = text.length;

  pos = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (pos === false) {
    return text.substr(0, radius) + ending;
  }

  startPos = pos - radius;
  if (startPos <= 0) {
    startPos = 0;
    prepend = "";
  }

  endPos = pos + phraseLen + radius;
  if (endPos >= textLen) {
    endPos = textLen;
    append = "";
  }

  excerpt = text.substr(startPos, endPos - startPos);
  excerpt = prepend + excerpt + append;

  return excerpt;
}
