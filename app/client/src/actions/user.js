export const LOGIN = "user/LOGIN";

export function login(user) {
  return {
    type: LOGIN,
    user
  };
}
