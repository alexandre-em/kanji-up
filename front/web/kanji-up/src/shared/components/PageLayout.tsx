import React, { PropsWithChildren } from 'react';

type PageLayoutProps = {
  title: string;
  header?: boolean;
  subtitle?: string;
};

export default function PageLayout({ header, title, subtitle, children }: PageLayoutProps & PropsWithChildren) {
  return (
    <div>
      PageLayout {title}
      {children}
    </div>
  );
}
