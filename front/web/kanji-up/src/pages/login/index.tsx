import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import useSession from '../../hooks/useSession';
import { logger } from '../../shared';

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
    <div>
      LoginPage
      <button onClick={handleSignIn}>Login</button>
    </div>
  );
}
