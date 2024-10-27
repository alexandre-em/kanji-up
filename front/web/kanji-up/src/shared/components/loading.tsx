import { LoaderCircle } from 'lucide-react';

import PageLayout from './PageLayout';
import { TypographyMuted } from './typography';

import SubwaySvg from '@/components/svg/subway';

export default function Loading() {
  return (
    <PageLayout>
      <div className="h-full flex flex-col items-center justify-center">
        <SubwaySvg width={350} height={200} />
        <div className="flex items-center mt-1">
          <LoaderCircle className="text-muted-foreground animate-spin mr-2" />
          <TypographyMuted>Loading now...</TypographyMuted>
        </div>
      </div>
    </PageLayout>
  );
}
