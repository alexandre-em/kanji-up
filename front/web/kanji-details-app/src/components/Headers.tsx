import { KanjiType } from 'gatewayApp/shared';
import { Helmet } from 'react-helmet-async';

import { kanjiApiUrl } from '../constants';

type DetailsHeaderProps = {
  character: KanjiType | null;
  id: string;
};

export default function DetailsHeaders({ character, id }: DetailsHeaderProps) {
  return (
    <Helmet>
      <title>{character?.kanji.character}'s details | KanjiUp Application</title>
      <meta name="description" content={character?.kanji.meaning?.join(', ')} />
      <link rel="canonical" href={`https://app.kanjiup.alexandre-em.fr/kanji/${id}`} />
      <meta property="og:title" content={`${character?.kanji.character}'s details | KanjiUp Application`} />
      <meta property="og:description" content={character?.kanji.meaning?.join(', ')} />
      <meta property="og:image" content={`${kanjiApiUrl}/kanjis/image/${encodeURIComponent(character?.kanji.character || '')}`} />
      <meta property="og:url" content={`https://app.kanjiup.alexandre-em.fr/kanji/${id}`} />
      <script type="application/ld+json">
        {`
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "${character?.kanji.character}'s details",
              "image": "${kanjiApiUrl}/kanjis/image/${encodeURIComponent(character?.kanji.character || '')}",
              "description": "${character?.kanji.meaning?.join(', ')}",
            }
          `}
      </script>
    </Helmet>
  );
}
