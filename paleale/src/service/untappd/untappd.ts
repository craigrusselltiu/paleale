import UUID from "uuid";

const UNTAPPD_AUTH_STATE_KEY = "UNTAPPD_AUTH_STATE";

function generateState() {
  const state = UUID.v4();
  localStorage.setItem(UNTAPPD_AUTH_STATE_KEY, state);
  return state;
}

function validateState(actualState: string) {
  return localStorage.getItem(UNTAPPD_AUTH_STATE_KEY) === actualState;
}

export function triggerAuthenticate() {
  const urlParams = new URLSearchParams();
  urlParams.set("client_id", process.env.REACT_APP_UNTAPPD_CLIENT_ID as string);
  urlParams.set("redirect_url", process.env.REACT_APP_UNTAPPD_REDIRECT_URL as string);
  urlParams.set("response_type", "code");
  urlParams.set("state", generateState());

  window.location.replace(process.env.REACT_APP_UNTAPPD_AUTHENTICATE_URL + "?" + urlParams.toString());
}

export function parseLogin() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  if (!code || !state || !validateState(state)) {
    throw new Error("cannot parse untappd url");
  }

  return code;
}
