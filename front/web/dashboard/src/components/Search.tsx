'use client';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import { authUrl, kanjiUrl, wordUrl } from '@/constants';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

type SearchProps = {
  type: 'kanji' | 'word' | 'user';
};

const url = {
  kanji: `${kanjiUrl}/api/v1/kanjis/search/autocomplete/id`,
  word: wordUrl,
  user: authUrl,
};

export default function Search({ type }: SearchProps) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Array<Partial<KanjiType | WordType | User>>>([]);

  const getSuggestions = useCallback(
    async (input: string) => {
      if (!input) setSuggestions([]);
      else {
        const res = await fetch(`${url[type]}?query=${input}`);
        const json: Array<Partial<KanjiType | WordType | User>> = await res.json();

        setSuggestions(json);
      }
    },
    [type]
  );

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Search a kanji id..." onValueChange={(e) => getSuggestions(e)} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {suggestions?.length > 0 && (
          <CommandGroup heading="Suggestions">
            {suggestions.map((item) => {
              const id = (item as Record<string, string>)[`${type}_id`];

              return (
                <CommandItem key={`${type}_${id}`} value={id} onSelect={(value) => router.push(`/kanji/${value}`)}>
                  <span>{id}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
