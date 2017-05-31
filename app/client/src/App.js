import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Question from "./components/Question";

import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Header />

          <main className="main-content">
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/questions/:uid" component={Question} />
          </main>

          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
