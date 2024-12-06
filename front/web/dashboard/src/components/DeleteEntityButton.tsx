'use client';

import React, { useCallback } from 'react';

import { kanjiUrl } from '@/constants';

import { Button } from './ui/button';

type DeleteEntityButton = {
  id: string;
  type: 'radicals' | 'characters' | 'kanjis';
  headers?: HeadersInit;
};

export default function DeleteEntityButton({ id, type, headers }: DeleteEntityButton) {
  const handleDelete = useCallback(() => {
    if (id && type) {
      fetch(`${kanjiUrl}/api/v1/${type}`, {
        method: 'DELETE',
        headers,
      });
    }
  }, [id, headers, type]);

  return <Button onClick={handleDelete}>Delete {type}</Button>;
}
