import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import { runQuery } from "./helpers";

var GitHubStrategy = require("passport-github").Strategy;

passport.serializeUser(function(user, done) {
  done(null, user._uid_);
});

passport.deserializeUser(function(id, done) {
  console.log("id is", id);
  const query = `
{
  user(id: ${id}) {
    _uid_
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
    .then(res => {
      const user = res.user[0];

      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

function createUser(accessToken, displayName, GitHubID) {
  console.log("creating user...", accessToken);
  const query = `
mutation {
  set {
    <_:user> <DisplayName> "${displayName}" .
    <_:user> <GitHubAccessToken> "${accessToken}" .
    <_:user> <GitHubID> "${GitHubID}" .
    <_:user> <Reputation> "0" .
    <_:user> <CreationDate> "0" .
    <_:user> <LastAccessDate> "0" .
    <_:user> <Location> "Earth" .
    <_:user> <Type> "User" .
  }
}
`;

  return runQuery(query)
    .then(res => {
      const userUID = res.uids.user;

      return findUserByUID(userUID);
    })
    .catch(err => {
      console.log(err.stack);
    });
}

function findUserByUID(uid) {
  console.log("finding user", uid);
  const query = `
{
  user(id: ${uid}) {
    _uid_
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

  return runQuery(query).then(res => {
    const user = res.user[0];
    return user;
  });
}

// Configure passport
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GitHubClientID,
      clientSecret: process.env.GitHubClientSecret,
      callbackURL: "http://127.0.0.1:3000/api/auth/github/callback"
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(profile);
      const query = `
{
  user(func: eq(GitHubID, ${profile.id})) {
    _uid_
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
        .then(res => {
          console.log("res.user", res.user);
          if (!res.user) {
            createUser(accessToken, profile.username, profile.id).then(user => {
              cb(null, user);
            });
            return;
          }

          const user = res.user[0];
          cb(null, user);
        })
        .catch(err => {
          console.log(err.stack);
        });
    }
  )
);

const app = express();
app.use(cookieParser("keyboard cat"));
app.use(bodyParser());
app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.get("/api/current_user", (req, res) => {
  console.log(req.user);
  findUserByUID(req.user._uid_)
    .then(user => {
      console.log("user found", user);
      res.json(user);
    })
    .catch(err => {
      res.status(500).send(err.message);
    });
});

app.get("/api/auth", passport.authenticate("github"));

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.listen(app.get("port"), () => {
  console.log(`Server running on: http://127.0.0.1:${app.get("port")}/`); // eslint-disable-line no-console
});
