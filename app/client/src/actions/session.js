export const LOGIN = "session/LOGIN";
export const LOGOUT = "session/LOGOUT";

export function login(user) {
  return {
    type: LOGIN,
    user
  };
}

export function logout() {
  return {
    type: LOGOUT
  };
}
