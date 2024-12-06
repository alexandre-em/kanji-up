import React from 'react';

import Search from '@/components/Search';

export default function Kanji() {
  return (
    <main className="min-h-[calc(100dvh-57px)] flex flex-col m-5">
      <h1 className="text-2xl font-extrabold mb-5">Dashboard - Kanji</h1>
      <Search type="kanji" />
    </main>
  );
}
