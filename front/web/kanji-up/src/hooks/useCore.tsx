import { useEffect } from 'react';

import { core, useSession } from '@/shared';

export default function useCore() {
  const { accessToken } = useSession();
  useEffect(() => {
    if (!core.accessToken && accessToken) {
      core.init(accessToken);
    }
  }, [accessToken]);
  return;
}
