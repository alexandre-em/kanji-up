import { PropsWithChildren } from 'react';

export function TypographyH1({ children }: PropsWithChildren) {
  return <h1 className="text-[#3f3d56] font-roboto scroll-m-20 text-2xl font-black tracking-tight lg:text-5xl">{children}</h1>;
}

export function TypographyH2({ children }: PropsWithChildren) {
  return <h2 className="text-[#3f3d56] scroll-m-20 text-xl font-extrabold tracking-tight">{children}</h2>;
}

export function TypographyH3({ children }: PropsWithChildren) {
  return <h3 className="text-[#3f3d56] scroll-m-20 text-lg font-bold tracking-tight">{children}</h3>;
}

export function TypographyH4({ children }: PropsWithChildren) {
  return <h4 className="text-[#3f3d56] scroll-m-20 text-md font-semibold tracking-tight">{children}</h4>;
}

export function TypographyP({ children }: PropsWithChildren) {
  return <p className="text-[#3f3d56] leading-7 [&:not(:first-child)]:mt-6">{children}</p>;
}

export function TypographyBlockquote({ children }: PropsWithChildren) {
  return <blockquote className="text-[#3f3d56] mt-6 border-l-2 pl-6 italic">{children}</blockquote>;
}

/**
 * children: contains <li>element</li>
 */
export function TypographyList({ children }: PropsWithChildren) {
  return <ul className="text-[#3f3d56] my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>;
}

export function TypographyInlineCode({ children }: PropsWithChildren) {
  return (
    <code className="text-[#3f3d56] relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}
export function TypographyLead({ children }: PropsWithChildren) {
  return <p className="text-xl text-muted-foreground">{children}</p>;
}

export function TypographyLarge({ children }: PropsWithChildren) {
  return <div className="text-[#3f3d56] text-lg font-semibold">{children}</div>;
}
export function TypographySmall({ children }: PropsWithChildren) {
  return <small className="text-[#3f3d56] text-sm font-medium leading-none">{children}</small>;
}
export function TypographyMuted({ children }: PropsWithChildren) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
