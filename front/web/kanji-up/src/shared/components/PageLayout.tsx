import { PropsWithChildren } from 'react';

import { TypographyH2, TypographyMuted } from './typography';

type PageLayoutProps = {
  header?: {
    title: string;
    subtitle?: string;
  };
  canScroll?: boolean;
};

export default function PageLayout({ header, canScroll = true, children }: PageLayoutProps & PropsWithChildren) {
  return (
    <div className={`w-full h-dvh flex flex-col items-center bg-[#f9fafb] ${canScroll && 'overflow-y-auto'} scrollbar-hide`}>
      <div className="max-w-[750px] w-full min-h-dvh h-dvh p-4">
        {header?.title && (
          <div className="w-full">
            <TypographyH2>{header?.title}</TypographyH2>
            <TypographyMuted>{header?.subtitle}</TypographyMuted>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
