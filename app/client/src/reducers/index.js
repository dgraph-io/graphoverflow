import { combineReducers } from "redux";

import session from "./session";
import search from "./search";

const rootReducer = combineReducers({
  session,
  search
});

export default rootReducer;
