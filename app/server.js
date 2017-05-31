import express from "express";

const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.get("/api/auth", (req, res) => {
  console.log("what");
  res.end();
});

app.listen(app.get("port"), () => {
  console.log(`Server running on: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
