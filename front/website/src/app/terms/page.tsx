import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to using the Kanji Up app.",
};

const lastUpdated = "2026-08-10";

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="flex flex-col gap-6 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
          <p>
            These terms govern your use of the Kanji Up mobile app, developed
            by an individual developer based in France. By using the app, you
            agree to these terms.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Using the app
            </h2>
            <p className="mt-2">
              Kanji Up is provided for personal, non-commercial use to help
              you learn Japanese kanji. You agree not to misuse the app,
              attempt to disrupt its operation, or access it through means
              other than the interfaces we provide.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Accounts
            </h2>
            <p className="mt-2">
              An account is not required to use the app. You may optionally
              sign in with Google to recover your kanji selections and
              progress when switching to a new phone. You are responsible for
              keeping access to your account secure. See our{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4"
              >
                Privacy Policy
              </Link>{" "}
              for details on the data we collect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Advertising
            </h2>
            <p className="mt-2">
              The app is free to use and funded in part by ads served through
              Google AdMob. Ads may include banner, interstitial, and
              rewarded formats.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              No warranty
            </h2>
            <p className="mt-2">
              Kanji Up is provided &quot;as is&quot;, without warranty of any
              kind. We do not guarantee the app will be uninterrupted,
              error-free, or that content (including kanji data) is entirely
              accurate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Limitation of liability
            </h2>
            <p className="mt-2">
              To the extent permitted by law, we are not liable for any
              indirect or incidental damages arising from your use of the
              app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Changes to these terms
            </h2>
            <p className="mt-2">
              We may update these terms as the app evolves. Material changes
              will be reflected by updating the date above.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Contact
            </h2>
            <p className="mt-2">
              Questions about these terms? Contact us at{" "}
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
