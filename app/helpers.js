import request from "superagent";
const dgraph = require("dgraph-js");
const grpc = require("grpc");


export function getEndpointBaseURL() {
  let endpointBaseURL;
  if (process.env.NODE_ENV === "prod") {
    endpointBaseURL = "https://graphoverflow.dgraph.io";
  } else {
    endpointBaseURL = "http://127.0.0.1:8080";
  }

  return endpointBaseURL;
}


// Create a client stub.
function newClientStub() {
    return new dgraph.DgraphClientStub("localhost:9080", grpc.credentials.createInsecure());
}

// Create a client.
function newClient(clientStub) {
    return new dgraph.DgraphClient(clientStub);
}
const dgraphClientStub = newClientStub();
const dgraphClient = newClient(dgraphClientStub);

// runQuery runs the query against dgraph endpoint <={old comment}
// Same helper exists in client; we duplicate it on the server side rather than <={old comment}
// sharing code between client and server for separation of concern <={old comment}
export async function runQuery(queryText) {
  let ppl;

  if (process.env.NODE_ENV === "dev") {
    console.log("Running query:");
    console.log(queryText);
  }
    try {
      const query = `${queryText}`;
      const res = await dgraphClient.newTxn().query(query);
      ppl = res.getJson();
    } catch (e) {
      if (e === dgraph.ERR_ABORTED) {
        console.log("error:", e);
      } else {
        throw e;
      }
    } 
    console.log("Rodou query", ppl)
    return { data: ppl };
}


export async function runMutation(Nquads) {
  let mutation= "done";
  let uid;
  console.log("Running mutation")

  if (process.env.NODE_ENV === "dev") {
    console.log("Running Mutation:");
    console.log(Nquads);
  }
  console.log(Nquads);
  // const endpointBaseURL = getEndpointBaseURL();

  const txn = dgraphClient.newTxn();
    try {
      const mu = new dgraph.Mutation();
      mu.setSetNquads(`${Nquads}`);
      const assigned = await txn.mutate(mu);
      uid = assigned.getUidsMap();
     // const uidMap = await assigned.getUidsMap();
     // Commit transaction.
      //const uid = uids.get('user');
      await txn.commit();
       // console.log(`*** New item uid: ${uid} ***`);
      // return uid;
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
      // clientStub.close();
    }
    console.log("Rodou mutation Server")
    return uid;
}

export async function runDelation(Nquads) {
  let mutation= "done";
  let uid;
  console.log("Running mutation")

  if (process.env.NODE_ENV === "dev") {
    console.log("Running Mutation:");
    console.log(Nquads);
  }
  console.log(Nquads);
  // const endpointBaseURL = getEndpointBaseURL();

  const txn = dgraphClient.newTxn();
    try {
      const mu = new dgraph.Mutation();
      mu.setDelNquads(`${Nquads}`);
      const assigned = await txn.mutate(mu);
      await txn.commit();
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
      // clientStub.close();
    }
    console.log("Rodou Delation Server")
    return uid;
}