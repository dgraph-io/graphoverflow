import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import request from "superagent";
import { connect } from "react-redux";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Question from "./components/Question";
import NewQuestion from "./components/NewQuestion";
import EditPost from "./components/EditPost";
import { login, logout } from "./actions/session";
import LoggedInRoute from "./components/hocs/LoggedInRoute";

import "./assets/styles/App.css";

class App extends Component {
  componentDidMount() {
    const { handleLogin } = this.props;

    // fetch current user
    request("/api/current_user")
      .then(res => {
        const user = res.body;
        if (user) {
          handleLogin(user);
        }
      })
      .catch(err => {
        console.log("Error while fetching current user", err);
      });
  }

  handleLogout = () => {
    const { _handleLogout } = this.props;
    _handleLogout();
  };

  render() {
    const { user } = this.props;

    return (
      <Router>
        <div>
          <Header user={user} onLogout={this.handleLogout} />

          <main className="main-content">
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />

            <Switch>
              <LoggedInRoute
                path="/questions/ask"
                component={NewQuestion}
                authenticated={Boolean(user)}
              />
              <Route path="/posts/:uid/edit" component={EditPost} />
              <Route path="/questions/:uid" component={Question} />
            </Switch>
          </main>

          <Footer />
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  user: state.session.user
});

const mapDispatchToProps = dispatch => ({
  handleLogin(user) {
    dispatch(login(user));
  },
  _handleLogout() {
    dispatch(logout());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
