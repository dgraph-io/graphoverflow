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
import User from "./components/User";
import LoggedInRoute from "./components/hocs/LoggedInRoute";
import SearchResult from "./components/SearchResult";

import { login, logout } from "./actions/session";

import "./assets/styles/App.css";

class App extends Component {
  constructor(props) {
    super(props);

    // Put searchTerm in Redux to avoid unnecessary rerender
    this.state = {
      searchTerm: ""
    };
  }

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

  handleChangeSearchTerm = val => {
    this.setState({ searchTerm: val });
  };

  render() {
    const { user } = this.props;
    const { searchTerm } = this.state;

    return (
      <Router>
        <div>
          <Header
            user={user}
            onLogout={this.handleLogout}
            searchTerm={searchTerm}
            onChangeSearchTerm={this.handleChangeSearchTerm}
          />

          <main className="main-content">
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route
              path="/search"
              render={() =>
                <SearchResult
                  onChangeSearchTerm={this.handleChangeSearchTerm}
                />}
            />
            <Route path="/users/:uid" component={User} />

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
