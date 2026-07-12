import { getOAuthClient } from "../config/googleOAuth.js";
import { User } from "../types/user.js";
type Token = {
  accessToken: string|null,
  refreshToken: string|null
}
export default function getAuthenticatedClient(tokens:Token|null) {
  const authenticatedClient = getOAuthClient();
  authenticatedClient.setCredentials({
    access_token: tokens?.accessToken,
    refresh_token:tokens?.refreshToken
  })

  return authenticatedClient
}
