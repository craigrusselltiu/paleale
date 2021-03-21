import Axios from "axios";

const AuthAxios = Axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export function setAccessToken(accessToken: string) {
  AuthAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

export default AuthAxios;
