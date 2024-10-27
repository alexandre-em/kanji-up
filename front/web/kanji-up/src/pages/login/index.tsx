import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import useSession from '../../hooks/useSession';
import { logger } from '../../shared';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function LoginPage() {
  const { handleSignIn } = useAuth();
  const session = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session.status === 'succeeded') {
      if (location.pathname === '/login') navigate('/');
    } else {
      logger.error('ERROR on session ' + session.status);
    }
  }, [session.status, location.pathname]);

  return (
    <main className="min-h-dvh flex justify-center items-center bg-gray-50">
      <Card>
        <CardHeader className="flex items-center">
          <img src="/icons/icon-192x192.png" alt="logo" />
        </CardHeader>
        <CardContent>
          <CardTitle>KanjiUp App</CardTitle>
          <CardDescription>Wecome to KanjiUp application ! To use the application, please authenticate.</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSignIn}>Sign in</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
