import { useCallback } from 'react';

import { appId, appUrl, authUrl } from '../constants';

export default function useAuth() {
  const handleSignIn = useCallback(() => {
    // const popup = window.open(`${authUrl}/auth/login?app_id=${appId}`, '_blank', 'popup=true');
    //
    // const checkPopup = setInterval(() => {
    //   if (popup && popup.window.location.href.includes(appUrl!)) {
    //     popup.close();
    //   }
    //
    //   if (!popup || !popup.closed) return;
    //   clearInterval(checkPopup);
    // }, 1000);
    //
    // // If needed, handle cases where the popup fails to open
    // if (popup) {
    //   popup.onerror = () => {
    //     window.clearInterval(checkPopup);
    //     // TODO: Add a error toaster
    //   };
    // }
    //
    window.location.replace(`${authUrl}/auth/login?app_id=${appId}`);
  }, []);

  const handleSignOut = useCallback(() => {
    // const popup = window.open(`${authUrl}/auth/logout`, 'popup', 'popup=true');
    //
    // const checkPopup = setInterval(() => {
    //   if (popup && popup.window.location.href.includes(appUrl!)) {
    //     popup.close();
    //   }
    //
    //   if (!popup || !popup.closed) return;
    //   clearInterval(checkPopup);
    // }, 1000);
    //
    // if (popup) {
    //   popup.onerror = () => {
    //     window.clearInterval(checkPopup);
    //     // TODO: Add a let boolean variable and if !popup && isError -> toaster
    //   };
    // }
    window.location.replace(`${authUrl}/auth/logout`);
  }, []);

  return { handleSignIn, handleSignOut };
}
