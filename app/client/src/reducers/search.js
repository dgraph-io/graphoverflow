import { UPDATE_SEARCH_TERM } from "../actions/search";

const defaultState = {
  searchTerm: ""
};

export default (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.searchTerm
      };
    default:
      return state;
  }
};
