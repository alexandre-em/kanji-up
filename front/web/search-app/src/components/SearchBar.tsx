import { logger } from 'gatewayApp/shared';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';

export default function SearchBar() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      navigate(`/search?query=${input}`);
    },
    [input, navigate]
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
