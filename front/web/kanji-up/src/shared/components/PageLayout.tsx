import React, { PropsWithChildren } from 'react';

type PageLayoutProps = {
  header?: {
    title: string;
    subtitle?: string;
  };
};

export default function PageLayout({ header, children }: PageLayoutProps & PropsWithChildren) {
  return (
    <div className="h-dvh flex flex-col items-center">
      <div className="max-w-[1080px] w-full min-h-dvh h-full">{children}</div>
    </div>
  );
}
