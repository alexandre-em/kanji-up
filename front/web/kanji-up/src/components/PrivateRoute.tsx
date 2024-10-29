import { Navigate, Outlet } from 'react-router-dom';

import useSession from '../hooks/useSession';

export default function PrivateRoute() {
  const session = useSession();

  return session.accessToken ? <Outlet /> : <Navigate to="/login" />;
}
