import { useEffect, useState } from 'react';

export default function usePwaInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setIsInstalled(true);
    });

    return () => window.removeEventListener('appinstalled', () => {});
  }, []);

  return isInstalled;
}
