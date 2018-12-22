// import request from "superagent";
const dgraph = require("dgraph-js");
const grpc = require("grpc");


// export function getEndpointBaseURL() {
//   let endpointBaseURL;
//   if (process.env.NODE_ENV === "prod") {
//     endpointBaseURL = "https://graphoverflow.dgraph.io";
//   } else {
//     endpointBaseURL = "http://127.0.0.1:8080";
//   }

//   return endpointBaseURL;
// }

//  const endpointBaseURL = getEndpointBaseURL();

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

export async function runMutation(Nquads, type, uidmap) {
  let uid;
  if (process.env.NODE_ENV === "dev") {
    console.log("Running Mutation:");
    console.log("start Nquads", Nquads, "Nquads");
  }
  console.log("start Nquads", Nquads, "Nquads");
  const txn = dgraphClient.newTxn();
    try {
      const mu = new dgraph.Mutation();
      mu.setSetNquads(`${Nquads}`);
      mu.setCommitNow(true);
      const assigned = await txn.mutate(mu);
      if (type !== "uid") {
        uid = assigned.getUidsMap().get(`${uidmap}`);
      } else {
        uid = uidmap;
      }

      if (process.env.NODE_ENV === "dev") {
        console.log(`*** commit just now ***`);
        console.log(`*** uidmap => "${uidmap}" ***`);
        console.log("All created nodes (map from blank node names to uids):");
        assigned.getUidsMap().forEach((uid2, key) => console.log(`${key} => ${uid2}`));
        console.log();
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
      // dgraphClientStub.close();
    }
    console.log({ data: uid }, "data")
    return { data: uid };
}

export async function runDelation(Nquads) {
  let uid;

  if (process.env.NODE_ENV === "dev") {
    console.log("Running a Delation:");
    console.log(Nquads);
  }

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
    return true;
}