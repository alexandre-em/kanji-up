import { Navigate, Outlet } from 'react-router-dom';

import useSession from '../hooks/useSession';

import Loading from '@/shared/components/loading';

export default function PrivateRoute() {
  const session = useSession();

  if (session.status !== 'succeeded' && session.status !== 'failed') {
    return <Loading />;
  }

  return session.accessToken ? <Outlet /> : <Navigate to="/login" />;
}
