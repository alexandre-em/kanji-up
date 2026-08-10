import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete My Data",
  description: "How to request deletion of your Kanji Up account and data.",
};

export default function DataDeletion() {
  return (
    <div className="flex flex-1 flex-col items-center bg-white dark:bg-black">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-24 sm:px-16">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ← Kanji Up
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Delete My Data
          </h1>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            You can request deletion of your Kanji Up account and all
            associated data (your kanji selections and evaluation progress)
            at any time.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              How to request deletion
            </h2>
            <p className="mt-2">
              Email{" "}
              <a
                href="mailto:alexandre.em.em@gmail.com?subject=Kanji%20Up%20-%20Data%20deletion%20request"
                className="underline underline-offset-4"
              >
                alexandre.em.em@gmail.com
              </a>{" "}
              from the address associated with your Google account, with the
              subject &quot;Data deletion request&quot;. We will confirm and
              delete your account and data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              What gets deleted
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Your account information (name, email, profile picture).</li>
              <li>Your kanji selections and evaluation/progress history.</li>
            </ul>
            <p className="mt-2">
              See our{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
              >
                Privacy Policy
              </Link>{" "}
              for full details on the data we collect.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
