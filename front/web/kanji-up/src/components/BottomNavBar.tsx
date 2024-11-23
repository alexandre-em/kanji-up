import { BookA, CircleUser, HomeIcon, LibraryBig, Search, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  const handleRedirect = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  let lastScrollPosition = 0;

  const handleScroll = () => {
    const currentScrollPosition = window.pageYOffset;

    console.log('Scrolling');

    if (currentScrollPosition > lastScrollPosition) {
      setHidden(true); // Hide navbar when scrolling down
    } else {
      setHidden(false); // Show navbar when scrolling up
    }

    lastScrollPosition = currentScrollPosition;
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`z-50 fixed bottom-5 flex bg-primary min-w-[250px] w-3/4 max-w-[600px] h-[50px] items-center justify-around rounded-xl shadow-xl ease-linear hover:min-w-[300px] hover:w-10/12 duration-100 opacity-100 transition-transform  ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <button
        onClick={() => handleRedirect('/')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px]"
      >
        <HomeIcon className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/kanjis')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px]"
      >
        <BookA className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/words')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px]"
      >
        <LibraryBig className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/search')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px]"
      >
        <Search className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/setting')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px]"
      >
        <SlidersHorizontal className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/user')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px]"
      >
        <CircleUser className="text-white w-5 h-5" />
      </button>
    </div>
  );
}
