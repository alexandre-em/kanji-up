import { Navigate } from 'react-router-dom';

import VintageSvg from '@/components/svg/vintage';
import useSession from '@/hooks/useSession';
import { PageLayout, TypographyMuted } from '@/shared';

export default function RedirectPage() {
  const session = useSession();

  if (session.accessToken) {
    return <Navigate to="/" />;
  }

  return (
    <PageLayout>
      <div className="h-full flex flex-col items-center justify-center">
        <VintageSvg width={350} height={200} />
        <div className="flex items-center mt-1">
          <TypographyMuted>Redirecting now...</TypographyMuted>
        </div>
      </div>
    </PageLayout>
  );
}
