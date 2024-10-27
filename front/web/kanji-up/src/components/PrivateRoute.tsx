import { Navigate, Outlet } from 'react-router-dom';

import useSession from '../hooks/useSession';

export default function PrivateRoute() {
  const session = useSession();

  if (session.status !== 'succeeded' && session.status !== 'failed') {
    return <div>loading...</div>;
  }

  return session.accessToken ? <Outlet /> : <Navigate to="/login" />;
  // return <div>OP</div>;
}
