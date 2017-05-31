import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import request from "superagent";
import { connect } from "react-redux";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Question from "./components/Question";
import { login } from "./actions/user";

import "./App.css";

class App extends Component {
  componentDidMount() {
    const { handleLogin } = this.props;

    // fetch current user
    request("/api/current_user").then(res => {
      const user = res.body;
      handleLogin(user);
    });
  }

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

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  handleLogin(user) {
    dispatch(login(user));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
