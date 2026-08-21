let accessToken: string | null = null;

export function getTestTakerAccessToken() {
  return accessToken;
}

export function setTestTakerAccessToken(token: string | null) {
  accessToken = token;
}
