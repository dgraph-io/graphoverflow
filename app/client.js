const express = require("express");
const httpProxy = require("http-proxy");

var app = express();
var apiEndpoint = "http://127.0.0.1:3001/api";
var proxy = httpProxy.createProxyServer({
  target: apiEndpoint
});

app.use("/", express.static("client/build"));
app.use("/api", (req, res) => {
  proxy.web(req, res, { target: apiEndpoint });
});

app.listen(3000, () => {
  console.log(`Server running on: http://127.0.0.1:3000/`); // eslint-disable-line no-console
});
