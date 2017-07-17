import React from "react";
import "../assets/styles/Footer.css";

const Footer = ({}) => {
  return (
    <div className="footer">
      <div>
        Powered by{" "}
        <a href="https://dgraph.io" target="_blank">
          Dgraph
        </a>{" "}
        <i className="fa fa-bolt" />
      </div>

      <div>
        <a href="https://github.com/dgraph-io/graphoverflow" target="_blank">
          See source code
        </a>
      </div>

      <div className="data-attribution">
        Using{" "}
        <a href="https://archive.org/details/stackexchange">
          Stack Exchange Data Dump
        </a>{" "}
        under{" "}
        <a href="https://creativecommons.org/licenses/by-sa/3.0/">
          cc-by-sa 3.0 license
        </a>
      </div>
    </div>
  );
};
export default Footer;
