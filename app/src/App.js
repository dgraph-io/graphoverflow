import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Question from "./components/Question";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Header />

          <hr />

          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/questions/:uid" component={Question} />
        </div>
      </Router>
    );
  }
}

export default App;
