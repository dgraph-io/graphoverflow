import React from "react";
import loader from "../assets/images/loader.svg";

import "../assets/styles/Loader.css";

const Loading = ({}) => {
  return (
    <div className="loader-container">
      <img src={loader} alt="loader" className="loader" />
    </div>
  );
};
export default Loading;
