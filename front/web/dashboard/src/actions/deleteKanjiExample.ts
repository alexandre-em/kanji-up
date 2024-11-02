'use server';

import { SESSION_COOKIE_NAME, kanjiUrl } from '@/constants';
import getCookies from '@/constants/cookies';

export default async function deleteKanjiExample(id: string, index: number) {
  const accessToken = getCookies(SESSION_COOKIE_NAME);

  const res = await fetch(`${kanjiUrl}/api/v1/kanjis/${id}/examples/${index}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return res.json();
}
