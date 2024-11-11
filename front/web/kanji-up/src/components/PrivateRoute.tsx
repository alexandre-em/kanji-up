import { Navigate, Outlet } from 'react-router-dom';

import BottomNavBar from './BottomNavBar';
import useSession from '../hooks/useSession';

import { Loading } from '@/shared';

export default function PrivateRoute() {
  const session = useSession();

  if (session.status === 'idle' || session.status === 'pending') return <Loading />;

  return session.accessToken ? (
    <div className="flex justify-center w-full">
      <Outlet />
      <BottomNavBar />
    </div>
  ) : (
    <Navigate to="/login" />
  );
}
