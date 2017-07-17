import React from "react";

import avatar from "../assets/images/diggy-face.png";

import "../assets/styles/Login.css";

const Login = ({}) => {
  return (
    <section className="login-container">
      <img src={avatar} alt="diggy" className="diggy" />
      <h1>Please login to continue</h1>

      <a href="/api/auth" className="btn btn-primary">
        <i className="fa fa-github" /> Sign in
      </a>
    </section>
  );
};
export default Login;
