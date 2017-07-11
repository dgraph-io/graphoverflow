export const UPDATE_SEARCH_TERM = "session/UPDATE_SEARCH_TERM";

export function updateSearchTerm(searchTerm) {
  return {
    type: UPDATE_SEARCH_TERM,
    searchTerm
  };
}
