import AuthAxios from "../authaxios";

import {AddProfileParams, AuthorizeUntappdParams, GetProfileResponse} from "./protocols";

const PROFILE_ENDPOINT = "/profile";

export async function getProfile() {
  const response = await AuthAxios.post<GetProfileResponse>(`${PROFILE_ENDPOINT}/getProfile`);
  return response.data;
}

export async function addProfileIfNotExisted(params: AddProfileParams) {
  await AuthAxios.post(`${PROFILE_ENDPOINT}/addProfileIfNotExisted`, params);
}

export async function authorizeUntappd(params: AuthorizeUntappdParams) {
  await AuthAxios.post(`${PROFILE_ENDPOINT}/authorizeUntappd`, params);
}

export async function disconnectUntappd() {
  await AuthAxios.post(`${PROFILE_ENDPOINT}/disconnectToUntappd`);
}
