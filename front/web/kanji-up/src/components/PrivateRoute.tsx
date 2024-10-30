import { Navigate, Outlet } from 'react-router-dom';

import BottomNavBar from './BottomNavBar';
import useSession from '../hooks/useSession';

export default function PrivateRoute() {
  const session = useSession();

  return session.accessToken ? (
    <div className="flex justify-center w-full">
      <Outlet />
      <BottomNavBar />
    </div>
  ) : (
    <Navigate to="/login" />
  );
}
