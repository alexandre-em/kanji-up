import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { authUrl, dashboardAppId, dashboardUrl } from '@/constants';

export default function useAuth() {
  const router = useRouter();

  const handleSignIn = useCallback(() => {
    const popup = window.open(`${authUrl}/auth/login?app_id=${dashboardAppId}`, 'popup', 'popup=true');

    const checkPopup = setInterval(() => {
      if (popup && popup.window.location.href.includes(dashboardUrl!)) {
        popup.close();
      }

      if (!popup || !popup.closed) return;
      clearInterval(checkPopup);
    }, 1000);
  }, []);

  const handleSignOut = useCallback(() => {
    const popup = window.open(`${authUrl}/auth/logout`, 'popup', 'popup=true');

    const checkPopup = setInterval(() => {
      if (!popup || !popup.closed) return;
      clearInterval(checkPopup);
    }, 1000);

    fetch('/api/logout').then((res) => {
      if (res.status === 200) {
        router.replace('/');
      }
    });
  }, [router]);

  return {
    handleSignIn,
    handleSignOut,
  };
}
