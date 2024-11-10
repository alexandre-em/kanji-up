import '../tailwind.css';
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
    <form onSubmit={handleSearch}>
      <Input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="🔎 Search..."
        className="rounded-full text-muted-foreground shadow-md"
        autoFocus={false}
      />
    </form>
  );
}
