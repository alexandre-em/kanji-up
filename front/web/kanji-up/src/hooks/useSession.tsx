import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useLocation, useNavigate } from 'react-router-dom';

import { ACCESS_TOKEN } from '../constants';
import { AppDispatch, RootState } from '../store';
import { isLoggedIn, session } from '../store/reducers/session';

export default function useSession() {
  const dispatch = useDispatch<AppDispatch>();
  const sessionState = useSelector((state: RootState) => state.session);
  const [isOnline, setIsOnline] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const accessToken = searchParams.get(ACCESS_TOKEN);

  const init = useCallback(async (accessToken: string) => {
    dispatch(session.actions.init(accessToken));
  }, []);

  // Search param init case
  useEffect(() => {
    if (!sessionState.accessToken && accessToken) {
      init(accessToken);
    }
  }, [accessToken]);

  // Localstorage init case
  useEffect(() => {
    if (!sessionState.accessToken && !accessToken) {
      const token = localStorage.getItem(ACCESS_TOKEN);

      if (token) init(token);
      else if (isOnline) navigate('/login');
    }
  }, [accessToken, sessionState.accessToken, isOnline]);

  // Checking if user connected
  useEffect(() => {
    if (sessionState.status === 'idle' && sessionState.accessToken) {
      init(sessionState.accessToken);
      dispatch(isLoggedIn());
    }
  }, [sessionState.status, sessionState.accessToken]);

  useEffect(() => {
    if (sessionState.status === 'failed' && isOnline) {
      dispatch(session.actions.reset());
      redirect('/login');
    } else if (sessionState.status === 'succeeded')
      if (location.pathname === '/login') {
        navigate('/');
      }
  }, [sessionState.status, location.pathname, isOnline]);

  // After logged in
  window.addEventListener('storage', () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) init(token);
  });

  window.addEventListener('online', () => {
    console.log('User is online');
    // Perform actions to sync data or refresh content
    setIsOnline(true);
  });

  window.addEventListener('offline', () => {
    console.log('User is offline');
    // Show offline notification or update UI
    setIsOnline(false);
  });

  return sessionState;
}
