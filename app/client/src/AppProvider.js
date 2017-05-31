import React from "react";
import { Provider } from "react-redux";
import App from "./App";

import createStore from "./lib/createStore";

const store = createStore();

export default class AppProvider extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
