'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, kanjiUrl } from '@/constants';
import getCookies from '@/constants/cookies';

const radNameSchema = z.object({
  romaji: z.string().min(1),
  hiragana: z.string().min(1),
});

const createRadSchema = z.object({
  kanji_id: z.string().uuid(),
  character: z.string().length(1),
  strokes: z.string().transform((val) => Number(val)),
  meaning: z.string().transform((val) => val.split(',')),
  name: radNameSchema,
});

export default async function createKanjiRad(formData: FormData) {
  const formattedData = {
    kanji_id: formData.get('kanji_id'),
    character: formData.get('character'),
    strokes: formData.get('strokes'),
    meaning: formData.get('meaning'),
    name: {
      hiragana: formData.get('hiragana'),
      romaji: formData.get('romaji'),
    },
  };

  const result = createRadSchema.safeParse(formattedData);

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const kanjiId = data.kanji_id;

  const accessToken = getCookies(SESSION_COOKIE_NAME);

  revalidatePath('/');
  revalidatePath('/kanji');

  const res = await fetch(`${kanjiUrl}/api/v1/radicals`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.status === 201) {
    const jsonRes = await res.json();

    await fetch(`${kanjiUrl}/api/v1/kanjis/${kanjiId}/radical/${jsonRes.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return jsonRes;
  }

  return null;
}
