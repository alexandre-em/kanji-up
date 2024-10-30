import { BookA, HomeIcon, LibraryBig, NotebookPen, Search, SlidersHorizontal } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BottomNavBar() {
  const navigate = useNavigate();

  const handleRedirect = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  return (
    <div className="fixed bottom-5 flex bg-primary min-w-[250px] w-3/4 max-w-[600px] h-[50px] items-center justify-around rounded-xl shadow-xl ease-linear hover:min-w-[300px] hover:w-10/12 duration-100 opacity-75 hover:opacity-100">
      <button
        onClick={() => handleRedirect('/')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px] hover:animate-bounce"
      >
        <HomeIcon className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/kanjis')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px] hover:animate-bounce"
      >
        <BookA className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/words')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px] hover:animate-bounce"
      >
        <LibraryBig className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/tests')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px] hover:animate-bounce"
      >
        <NotebookPen className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/search')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px] hover:animate-bounce"
      >
        <Search className="text-white w-5 h-5" />
      </button>

      <button
        onClick={() => handleRedirect('/setting')}
        className="outline-none border-0 w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-foreground ease-in-out duration-75 cursor-pointer hover:translate-y-[-5px] hover:animate-bounce"
      >
        <SlidersHorizontal className="text-white w-5 h-5" />
      </button>
    </div>
  );
}
