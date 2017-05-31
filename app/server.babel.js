var path = require("path");
var dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "./.env." + process.env.NODE_ENV)
});

// Load the main file
require("babel-register")({
  presets: ["es2015", "es2017"]
});
require("./server.js");
