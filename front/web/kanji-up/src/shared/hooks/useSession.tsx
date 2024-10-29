import { useSelector } from 'react-redux';

import { RootState } from '../../store';

export default function useSession() {
  const sessionState = useSelector((state: RootState) => state.session);

  return sessionState;
}
