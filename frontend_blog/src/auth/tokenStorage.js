const TOKEN_KEY = "admin_access_token";


export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}


export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}


export function removeToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}


export function hasToken() {
  return Boolean(getToken());
}