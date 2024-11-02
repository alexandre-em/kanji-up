import { cookies } from 'next/headers';

export default function getCookies(key: string) {
  const reqCookies = cookies();

  return reqCookies.get(key)?.value;
}
