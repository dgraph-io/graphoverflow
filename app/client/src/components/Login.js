import React from "react";

import avatar from "../assets/images/diggy-face.png";

import "../assets/styles/Login.css";

const Login = ({}) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <section className="login-container">
            <img src={avatar} alt="diggy" className="diggy" />
            <h1>Please login to continue</h1>

            <a href="/api/auth" className="btn btn-primary">
              <i className="fa fa-github" /> Sign in
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};
export default Login;
