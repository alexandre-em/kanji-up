'use server';
import { revalidatePath } from 'next/cache';

import { SESSION_COOKIE_NAME, kanjiUrl } from '@/constants';
import getCookies from '@/constants/cookies';

// TODO: transform to action, because it can't be used like this (cause: accessToken)
export default async function uploadKanjiImage(formData: FormData) {
  const accessToken = getCookies(SESSION_COOKIE_NAME);

  revalidatePath('/');
  revalidatePath('/kanji');

  const id = formData.get('id');
  const type = formData.get('type');

  formData.delete('id');
  formData.delete('type');

  const res = await fetch(`${kanjiUrl}/api/v1/${type}/${id}/image`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const jsonRes = await res.json();
  // console.log('json', jsonRes);
}
