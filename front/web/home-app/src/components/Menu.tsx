import { Spacer, TypographySmall } from 'gatewayApp/shared';
import { LanguagesIcon, NotebookPenIcon, WholeWordIcon } from 'lucide-react';
import { useCallback } from 'react';

import EvaluateBgImage from '../assets/evaluateBG.jpg';
import FlashcardBgImage from '../assets/flashcard.jpg';
import WordBgImage from '../assets/wordGame.jpg';

const menu = [
  {
    id: 'flascard',
    title: 'Flashcard',
    icon: LanguagesIcon,
    url: '/flashcard',
    image: FlashcardBgImage,
  },
  {
    id: 'drawing',
    title: 'Writing game',
    icon: NotebookPenIcon,
    url: '/drawing',
    image: EvaluateBgImage,
  },
  {
    id: 'word',
    title: 'Word game',
    icon: WholeWordIcon,
    url: '/drawing',
    image: WordBgImage,
  },
];

export default function Menu() {
  const navTo = useCallback((item: (typeof menu)[0]) => {
    window.location.href = item.url;
  }, []);

  return (
    <div className="flex justify-center flex-wrap">
      {menu.map((m) => (
        <div
          key={`${m.id}`}
          style={{ backgroundImage: `url(${m.image})`, backgroundSize: 'cover' }}
          className="m-2 min-w-[200px] sm:max-w-[340px] relative w-full h-full bg-center flex flex-col justify-center items-center shadow-lg cursor-pointer rounded-se-lg rounded-es-lg rounded-tl-3xl rounded-br-3xl"
          onClick={() => navTo(m)}
        >
          <div className="absolute inset-0 bg-white opacity-50 rounded-se-lg rounded-es-lg rounded-tl-3xl rounded-br-3xl hover:opacity-0 transition duration-100"></div>

          <Spacer size={1} />
          <m.icon className="text-primary" size={50} />
          <Spacer size={0.5} />
          <TypographySmall>{m.title}</TypographySmall>
          <Spacer size={1} />
        </div>
      ))}
    </div>
  );
}
