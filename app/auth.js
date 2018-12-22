import { Strategy as GitHubStrategy } from "passport-github";
import { runQuery, runMutation } from "./helpers";

// createUser persists a new user node
function createUser(accessToken, displayName, GitHubID) {
  console.log("creating user...", accessToken);
  const Nquads = `
    <_:user> <DisplayName> "${displayName}" .
    <_:user> <GitHubAccessToken> "${accessToken}" .
    <_:user> <GitHubID> "${GitHubID}" .
    <_:user> <Reputation> "0" .
    <_:user> <CreationDate> "0" .
    <_:user> <LastAccessDate> "0" .
    <_:user> <Location> "Earth" .
    <_:user> <Type> "User" .
`;

  return runMutation(Nquads,"blank", "user")
    .then(({ data }) => {
      const userUID = data.uids.user;

      return findUserByUID(userUID);
    })
    .catch(err => {
      console.log(err.stack);
    });
}

// findUserByUID queries a user node with a given uid
export function findUserByUID(uid) {
  const query = `
{
  user(func: uid(${uid})) {
    uid
    Reputation
    DisplayName
    CreationDate
    LastAccessDate
    Location
    AboutMe
    Type
  }
}
`;

  return runQuery(query).then(({ data }) => {
    return data.user[0];
  });
}

// configPassport configures passport using GitHub strategy
export function configPassport(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.uid);
  });

  passport.deserializeUser(function(id, done) {
    const query = `
  {
    user(func: uid(${id})) {
      uid
      Reputation
      CreationDate
      LastAccessDate
      Location
      AboutMe
      Type
    }
  }
  `;

    runQuery(query)
      .then(({ data }) => {
        const user = data.user[0];

        done(null, user);
      })
      .catch(err => {
        done(err, null);
      });
  });

  let callbackURL;

  if (process.env.NODE_ENV === "prod") {
    callbackURL = "https://graphoverflow.dgraph.io";
  } else {
    callbackURL = "http://127.0.0.1:3000";
  }

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GitHubClientID,
        clientSecret: process.env.GitHubClientSecret,
        callbackURL: `${callbackURL}/api/auth/github/callback`
      },
      (accessToken, refreshToken, profile, cb) => {
       // console.log(profile);
        const query = `
  {
    user(func: eq(GitHubID, ${profile.id})) {
      uid
      Reputation
      DisplayName
      CreationDate
      LastAccessDate
      Location
      AboutMe
      Type
    }
  }
  `;
        runQuery(query)
          .then(({ data }) => {
            // FIXME
            if (!data.user.length) {
              console.log("No user with this ID");
              createUser(
                accessToken,
                profile.username,
                profile.id
              ).then(user => {
                cb(null, user);
              });
              return;
            }
            const user = data.user[0];
            cb(null, user);
          })
          .catch(err => {
            console.log(err.stack);
          });
      }
    )
  );
}
