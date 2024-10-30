import React, { PropsWithChildren } from 'react';

type PageLayoutProps = {
  header?: {
    title: string;
    subtitle?: string;
  };
};

export default function PageLayout({ header, children }: PageLayoutProps & PropsWithChildren) {
  return (
    <div className="w-full h-dvh flex flex-col items-center">
      <div className="max-w-[750px] w-full min-h-dvh h-full p-2">{children}</div>
    </div>
  );
}
