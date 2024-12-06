import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import useSession from '../../hooks/useSession';

import LogoImage from '@/assets/images/icon-144x144.png';
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
    }
  }, [session.status, location.pathname]);

  return (
    <main className="min-h-dvh flex justify-center items-center bg-gray-50">
      <Card>
        <CardHeader className="flex items-center">
          <img src={LogoImage} alt="logo" />
        </CardHeader>
        <CardContent>
          <CardTitle>KanjiUp App</CardTitle>
          <CardDescription>Wecome to KanjiUp application ! To use the application, please authenticate.</CardDescription>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSignIn}>Start the application</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
