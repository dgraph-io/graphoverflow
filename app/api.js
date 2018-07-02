import express from "express";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import postRoutes from "./routes/post";
import { runQuery } from "./helpers";
import { configPassport, findUserByUID } from "./auth";

const app = express();

// Configure authentication using pasport.js
configPassport(passport);

app.use(cookieParser(process.env.CookieSecret));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.CookieSecret,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("port", process.env.PORT || 3001);

app.get("/api/current_user", (req, res) => {
  if (!req.user) {
    res.end();
    return;
  }

  findUserByUID(req.user.uid)
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
  passport.authenticate("github", { failureRedirect: "/error" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/api/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.use("/api/posts", postRoutes);

app.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(500).send(err.message);
    return;
  }
  next();
});

app.listen(app.get("port"), () => {
  console.log(`API server running on: http://127.0.0.1:${app.get("port")}/`); // eslint-disable-line no-console
});
