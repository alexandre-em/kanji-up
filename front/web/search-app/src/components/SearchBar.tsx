import '../tailwind.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Input } from './ui/input';
import { register } from './sw';

export default function SearchBar() {
  const [input, setInput] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      window.location.href = `/search?query=${encodeURIComponent(input)}`;
    },
    [input]
  );

  useEffect(() => {
    register();
  }, []);

  return (
    <form onSubmit={handleSearch} className="w-full">
      <Input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="🔎 Search..."
        className="rounded-full text-muted-foreground shadow-md w-full"
        autoFocus={false}
      />
    </form>
  );
}
