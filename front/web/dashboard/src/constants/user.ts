import { SESSION_COOKIE_NAME } from '.';

import getCookies from './cookies';

function parseJwt(token: string) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

export default function getUser() {
  const accessToken = getCookies(SESSION_COOKIE_NAME);

  if (!accessToken) {
    return undefined;
  }

  return parseJwt(accessToken);
}
