import Link from "next/link";

const links = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/data-deletion", label: "Delete My Data" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-black/10 py-8 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-sm text-zinc-500 dark:text-zinc-400 sm:flex-row sm:justify-between sm:px-16">
        <span>© {new Date().getFullYear()} Kanji Up</span>
        <nav className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline-offset-4 hover:text-zinc-700 hover:underline dark:hover:text-zinc-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
