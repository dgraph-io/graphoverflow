import React from "react";
import "../assets/styles/Footer.css";

const Footer = ({}) => {
  return (
    <div className="footer">
      Powered by
      {" "}
      <a href="https://dgraph.io" target="_blank">Dgraph</a>
      {" "}
      <i className="fa fa-bolt" />

      <div>
        <a href="https://github.com/dgraph-io/graphoverflow" target="_blank">
          See source code
        </a>
      </div>
    </div>
  );
};
export default Footer;
