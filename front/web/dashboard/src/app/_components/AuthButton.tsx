'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/useAuth';

export default function AuthButton() {
  const { handleSignIn } = useAuth();

  return <Button onClick={handleSignIn}>Sign in</Button>;
}
