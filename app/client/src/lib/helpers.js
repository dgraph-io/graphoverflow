//import request from "superagent";

const dgraph = require("dgraph-js-http");

export function getEndpointBaseURL() {
  let endpointBaseURL;
  if (process.env.NODE_ENV === "production") {
    endpointBaseURL = "https://graphoverflow.dgraph.io";
  } else {
    endpointBaseURL = "http://localhost:8080";
  }

  return endpointBaseURL;
}

const endpointBaseURL = getEndpointBaseURL();

const clientStub = new dgraph.DgraphClientStub(
  // addr: optional, default: "http://localhost:8080"
  endpointBaseURL,
);
const dgraphC = new dgraph.DgraphClient(clientStub);

// runQuery makes a post request to the server to run query and returns a
// promise that resolves with a response
export async function runQuery(queryText) {
  let ppl;

  if (process.env.NODE_ENV === "dev") {
    console.log("Running query:");
    console.log(queryText, "queryText");
  }

    try {
      const query = `${queryText}`;
      const res = await dgraphC.newTxn().query(query);

      if (process.env.NODE_ENV === "dev") {
        console.log("Get latency:");
        console.log("|:||", res.extensions.server_latency, "||:|");
      }
    
      ppl = res.data;
    } catch (e) {
      if (e === dgraph.ERR_ABORTED) {
        console.log("error:", e);
      } else {
        throw e;
      }
    } 
    return { data: ppl };
}


export async function runMutation(Nquads, uidmap) {
  let uid;

  if (process.env.NODE_ENV === "dev") {
    console.log("Running Mutation:");
    console.log(Nquads, "Nquads");
  }

  const txn = dgraphC.newTxn();
    try {
      const mu = new dgraph.Mutation();
      mu.setSetNquads(`${Nquads}`);
      const assigned = await txn.mutate(mu);
      await txn.commit();
      uid = await assigned.getUidsMap().get(`${uidmap}`);

      if (process.env.NODE_ENV === "dev") {
        console.log(`*** commit just now ***`);
        console.log(`*** uidmap => "${uidmap}" ***`);
        console.log("All created nodes (map from blank node names to uids):");
        assigned.getUidsMap().forEach((uid2, key) => console.log(`${key} => ${uid2}`));
        console.log();
        console.log("Get latency:");
        console.log("|:||", assigned.extensions.server_latency, "||:|");
         }
    } catch (e) {
      if (e === dgraph.ERR_ABORTED) {
        // Retry or handle exception.
      } else {
        throw e;
      }
    } finally {
      // Clean up. Calling this after txn.commit() is a no-op
      // and hence safe.
      await txn.discard();
      clientStub.close();
    }
    return uid;
}
export async function runDelation(Nquads) {
  let uid;

  if (process.env.NODE_ENV === "dev") {
    console.log("Running Delation:");
    console.log(Nquads, "Nquads");
  }

  const txn = dgraphC.newTxn();
    try {
      const mu = new dgraph.Mutation();
      mu.setDelNquads(`${Nquads}`);
      const assigned = await txn.mutate(mu);
      await txn.commit();
      if (process.env.NODE_ENV === "dev") {
        console.log();
        console.log("Get latency:");
        console.log("|:||", assigned.extensions.server_latency, "||:|");
         }
    } catch (e) {
      if (e === dgraph.ERR_ABORTED) {
        // Retry or handle exception.
      } else {
        throw e;
      }
    } finally {
      // Clean up. Calling this after txn.commit() is a no-op
      // and hence safe.
      await txn.discard();
      clientStub.close();
    }
    return uid;
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