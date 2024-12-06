import React from 'react';

import DeleteEntityButton from '@/components/DeleteEntityButton';
import { Separator } from '@/components/ui/separator';
import { FETCH_CACHE_REVALIDATION_SHORT, SESSION_COOKIE_NAME, kanjiUrl } from '@/constants';
import getCookies from '@/constants/cookies';

import CardDialog from './_components/CardDialog';
import ExampleListCard from './_components/ExampleListCard';
import RadicalForm from './_components/RadicalForm';
import UpdateKanjiForm from './_components/UpdateKanjiForm';

const getKanjiDetails = async (id: string) => {
  if (!id) return;

  try {
    const options = {
      next: { revalidate: 1 },
    };

    const response = await fetch(`${kanjiUrl}/api/v1/kanjis/detail/${id}`, options);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export default async function KanjiId({ params: { id } }: PageWithId) {
  const kanji: KanjiType = await getKanjiDetails(id);

  return (
    <main className="min-h-[calc(100dvh-57px)] flex flex-col m-5 overflow-auto">
      <h1 className="text-2xl font-extrabold">Updating kanji : &quot;{kanji.kanji.character}&quot;</h1>
      <Separator className="my-2" />
      <div className="flex flex-wrap justify-between">
        <CardDialog title="Update Character">
          <UpdateKanjiForm kanji={kanji} />
        </CardDialog>

        <div>
          <CardDialog title="Create Radical">
            <RadicalForm id={kanji.kanji_id} />
          </CardDialog>
          {kanji.radical?.radical_id && (
            <CardDialog title="Update Radical">
              <RadicalForm id={kanji.kanji_id} kanji={kanji} />
            </CardDialog>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold">Examples</h2>

      <ExampleListCard kanji={kanji} />

      {!kanji.deleted_at && (
        <DeleteEntityButton id={id} type="kanjis" headers={{ Authorization: `Bearer ${getCookies(SESSION_COOKIE_NAME)}` }} />
      )}
    </main>
  );
}
