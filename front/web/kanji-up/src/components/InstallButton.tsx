import { Download } from 'lucide-react';
import { MouseEvent, useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    console.log('adding event listener');
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('is installable');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('PWA was installed');
      } else {
        console.log('PWA installation was dismissed');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <Button disabled={!isInstallable} onClick={handleInstallClick}>
      <Download /> Install
    </Button>
  );
}
