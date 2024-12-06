'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, kanjiUrl } from '@/constants';
import getCookies from '@/constants/cookies';

const updateCharSchema = z.object({
  character_id: z.string().uuid(),
  character: z.string().length(1),
  strokes: z.string().transform((val) => Number(val)),
  meaning: z.string().transform((val) => val.split(',')),
  onyomi: z.string().transform((val) => val.split(',')),
  kunyomi: z.string().transform((val) => val.split(',')),
});

export default async function updateKanjiCharacter(formData: FormData) {
  const result = updateCharSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  const accessToken = getCookies(SESSION_COOKIE_NAME);

  revalidatePath('/');
  revalidatePath('/kanji');

  // const res =
  await fetch(`${kanjiUrl}/api/v1/characters/${data.character_id}/info`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // const jsonRes = await res.json();
  // console.log(jsonRes);

  redirect('/kanji');
}
