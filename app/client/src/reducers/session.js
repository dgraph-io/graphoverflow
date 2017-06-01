import { LOGIN, LOGOUT } from "../actions/session";

const defaultState = {
  user: null
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: action.user
      };
    case LOGOUT:
      return {
        ...state,
        user: defaultState.user
      };
    default:
      return state;
  }
};
