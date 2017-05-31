import { LOGIN } from "../actions/user";

export default (state = {}, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: action.user
      };
    default:
      return state;
  }
};
