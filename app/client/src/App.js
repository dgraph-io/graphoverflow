import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import request from "superagent";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

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
import Tag from "./components/Tag";
import Login from "./components/Login";
import Loading from "./components/Loading";

import { login, logout } from "./actions/session";

import "./assets/styles/App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authChecked: false
    };
  }

  componentDidMount() {
    const { handleLogin, history } = this.props;

    // fetch current user
    request("/api/current_user")
      .then(res => {
        const user = res.body;

        if (user) {
          handleLogin(user);
        }

        this.setState({ authChecked: true });
      })
      .catch(err => {
        console.log("Error while fetching current user", err);
      });

    // browserHistory returns a function to unlisten
    this.unlisten = history.listen(state => {
      this.hashLinkScroll();
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  hashLinkScroll = () => {
    const { hash } = window.location;
    if (hash !== "") {
      // Push onto callback queue so it runs after the DOM is updated,
      // this is required when navigating from a different page so that
      // the element is rendered on the page before trying to getElementById.
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) element.scrollIntoView();
      }, 800);
    }
  };

  handleLogout = () => {
    const { _handleLogout } = this.props;
    _handleLogout();
  };

  render() {
    const { user } = this.props;
    const { authChecked } = this.state;

    if (!authChecked) {
      return <Loading />;
    }

    return (
      <div>
        <Header user={user} onLogout={this.handleLogout} />

        <main className="main-content">
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/search" component={SearchResult} />
          <Route path="/users/:uid" component={User} />
          <Route path="/tags/:tagName" component={Tag} />
          <Route path="/login" component={Login} />

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
