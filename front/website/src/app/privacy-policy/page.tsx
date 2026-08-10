import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Kanji Up collects, uses, and protects your data.",
};

const lastUpdated = "2026-08-10";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            Kanji Up (&quot;we&quot;, &quot;us&quot;) is developed by an
            individual developer based in France. This policy explains what
            data the Kanji Up mobile app collects and how it is used.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Data we collect
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Account information</strong> — if you sign in with
                Google, we receive your name, email address, and profile
                picture from Google to create and identify your account.
              </li>
              <li>
                <strong>Device identifier</strong> — a device-specific
                identifier is used to associate your kanji selections and
                learning progress with your account.
              </li>
              <li>
                <strong>Learning progress</strong> — the kanji you select to
                study and your evaluation results, so the app can track your
                progress over time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Advertising
            </h2>
            <p className="mt-2">
              Kanji Up shows ads through Google AdMob (banner, interstitial,
              and rewarded ads). AdMob may collect device identifiers (such
              as the advertising ID) to serve and measure ads. See{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                className="underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                how Google uses data from AdMob
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              How we use your data
            </h2>
            <p className="mt-2">
              We use the data above to operate your account, keep your kanji
              progress in sync, and show ads that help fund the app. We do
              not sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Children&apos;s privacy
            </h2>
            <p className="mt-2">
              Kanji Up is not directed at children under 13. We do not
              knowingly collect personal data from children under 13. If you
              believe a child has provided us with personal data, contact us
              and we will remove it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Your rights
            </h2>
            <p className="mt-2">
              If you are in the European Economic Area, you have the right to
              access, correct, or delete your personal data. To request this,
              contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Changes to this policy
            </h2>
            <p className="mt-2">
              We may update this policy as the app evolves. Material changes
              will be reflected by updating the date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Contact
            </h2>
            <p className="mt-2">
              Questions about this policy or your data? Contact us at{" "}
              <a
                href="mailto:alexandre.em.em@gmail.com"
                className="underline underline-offset-4"
              >
                alexandre.em.em@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
