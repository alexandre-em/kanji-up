import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#premium", label: "Premium" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 sm:px-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/app-icon.png"
            alt=""
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="font-semibold text-black dark:text-zinc-50">
            Kanji Up
          </span>
        </Link>
        <nav className="flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
