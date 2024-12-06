'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, kanjiUrl } from '@/constants';
import getCookies from '@/constants/cookies';

const radNameSchema = z.object({
  romaji: z.string().min(1),
  hiragana: z.string().min(1),
});

const updateRadSchema = z.object({
  radical_id: z.string().uuid(),
  character: z.string().length(1),
  strokes: z.string().transform((val) => Number(val)),
  meaning: z.string().transform((val) => val.split(',')),
  name: radNameSchema,
});

export default async function updateKanjiRad(formData: FormData) {
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

  const result = updateRadSchema.safeParse(formattedData);

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const accessToken = getCookies(SESSION_COOKIE_NAME);

  revalidatePath('/');
  revalidatePath('/kanji');

  // const res =
  await fetch(`${kanjiUrl}/api/v1/radicals/${data.radical_id}/info`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  redirect('/kanji');
}
