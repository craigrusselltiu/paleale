import Auth0, {Auth0Callback, Auth0DecodedHash, Auth0ParseHashError, Auth0UserProfile} from "auth0-js";
import UUID from "uuid";

const webAuth = new Auth0.WebAuth({
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  clientID: process.env.REACT_APP_AUTH0_CLIENTID as string,
  domain: process.env.REACT_APP_AUTH0_DOMAIN as string,
  redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
  responseType: process.env.REACT_APP_AUTH0_RESPONSE_TYPE,
  scope: process.env.REACT_APP_AUTH0_SCOPE,
});

const AUTH0_LOGGED_IN_KEY = "AUTH0_LOGGED_IN";
const AUTH0_AUTH_STATE_KEY = "AUTH0_AUTH_STATE";

let accessToken: string;
let userProfile: Auth0UserProfile;

export function isLoggedIn() {
  return localStorage.getItem(AUTH0_LOGGED_IN_KEY) === "true";
}

export function getAccessToken() {
  return accessToken;
}

export function getUserProfile() {
  return userProfile;
}

function saveLocalLogin(authResult: Auth0DecodedHash) {
  if (authResult.accessToken) {
    accessToken = authResult.accessToken;
  }
  if (authResult.idTokenPayload) {
    userProfile = authResult.idTokenPayload;
  }
  localStorage.setItem(AUTH0_LOGGED_IN_KEY, "true");
}

function removeLocalLogin() {
  accessToken = "";
  localStorage.removeItem(AUTH0_LOGGED_IN_KEY);
}

function generateState() {
  const state = UUID.v4();
  localStorage.setItem(AUTH0_AUTH_STATE_KEY, state);
  return state;
}

function validateState(actualState?: string) {
  if (!actualState) {
    return false;
  }

  return localStorage.getItem(AUTH0_AUTH_STATE_KEY) === actualState;
}

export function triggerLogin() {
  removeLocalLogin();
  webAuth.authorize({
    state: generateState(),
  });
}

export function triggerLogout() {
  removeLocalLogin();
  webAuth.logout({});
}

function handleCallback(
  resolve: CallableFunction,
  reject: CallableFunction,
): Auth0Callback<Auth0DecodedHash | null, Auth0ParseHashError> {
  return (err, result) => {
    if (err != null) {
      return reject(err);
    }

    if (result == null || !validateState(result.state)) {
      return reject(new Error("invalid result"));
    }

    saveLocalLogin(result);
    return resolve(result);
  };
}

export function renewToken() {
  return new Promise((resolve, reject) => {
    if (localStorage.getItem(AUTH0_LOGGED_IN_KEY) !== "true") {
      reject(Error("not logged in"));
      return;
    }

    webAuth.checkSession({
      state: generateState(),
    }, handleCallback(resolve, reject));
  });
}

export function parseLogin() {
  return new Promise((resolve, reject) => {
    webAuth.parseHash(handleCallback(resolve, reject));
  });
}
