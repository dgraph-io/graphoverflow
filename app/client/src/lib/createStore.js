import thunk from "redux-thunk";
import reducer from "../reducers";
import { compose, createStore, applyMiddleware } from "redux";

const middleware = [thunk];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  return createStore(
    reducer,
    undefined,
    composeEnhancers(applyMiddleware(...middleware))
  );
};
