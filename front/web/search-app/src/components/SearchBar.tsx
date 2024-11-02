import React, { useCallback, useState } from 'react';
import { Input } from './ui/input';

export default function SearchBar() {
  const [input, setInput] = useState('');

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      window.location.href = `/search?query=${encodeURIComponent(input)}`;
    },
    [input]
  );
  return (
    <form onSubmit={handleSearch} className="mx-3">
      <Input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search..."
        className="rounded-full shadow-md text-muted-foreground"
        autoFocus={false}
      />
    </form>
  );
}
