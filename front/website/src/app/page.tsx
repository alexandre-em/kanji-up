import Image from "next/image";

const features = [
  {
    title: "Flashcards",
    description:
      "Review kanji at your own pace, sorted by school grade, JLPT level, or the Advanced tier for everything beyond.",
    image: "/images/feature-flashcards.jpg",
  },
  {
    title: "Drawing quizzes",
    description:
      "Practice stroke order and recall by drawing kanji from memory, not just picking a multiple-choice answer.",
    image: "/images/feature-drawing.jpg",
  },
  {
    title: "Kanji details",
    description:
      "Every kanji comes with readings, stroke count, radicals, and real usage examples — not just a translation.",
    image: "/images/feature-details.jpg",
  },
];

const steps = [
  {
    number: "01",
    title: "Pick your level",
    description:
      "Choose a school grade, a JLPT level, or the Advanced tier for kanji beyond both.",
  },
  {
    number: "02",
    title: "Practice daily",
    description:
      "Flashcards and drawing quizzes reinforce recall and stroke order together.",
  },
  {
    number: "03",
    title: "Track your progress",
    description:
      "See what you've mastered and what still needs review, kanji by kanji.",
  },
];

const faqs = [
  {
    question: "Is Kanji Up free?",
    answer: "Yes, Kanji Up is free to use.",
  },
  {
    question: "What platforms are supported?",
    answer: "Kanji Up is coming to Android via Google Play.",
  },
  {
    question: "What levels does Kanji Up cover?",
    answer:
      "School grades 1 through 6, every JLPT level from N5 to N1, and an Advanced tier for kanji outside both.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No, you can use Kanji Up without signing in. Linking a Google account is only useful if you want to recover your kanji selection and progress when switching to a new phone.",
  },
  {
    question: "What does Premium include?",
    answer:
      "Premium unlocks additional features to enhance your learning experience. Details coming soon.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center overflow-hidden bg-white dark:bg-black">
      <main className="flex w-full flex-1 flex-col items-center">
        <section className="relative flex w-full flex-col items-center gap-8 px-6 pt-20 pb-8 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute top-[-8rem] left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl dark:bg-brand/10"
          />

          <span className="relative rounded-full bg-brand-light px-4 py-1 text-sm font-medium text-brand dark:bg-brand/20 dark:text-[#e87d7f]">
            Free to use
          </span>

          <h1 className="relative max-w-2xl text-5xl font-semibold tracking-tight text-black sm:text-6xl dark:text-zinc-50">
            Learn and memorize{" "}
            <span className="text-brand dark:text-[#e87d7f]">Japanese kanji</span>
          </h1>

          <p className="relative max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Flashcards, drawing quizzes, and detailed kanji breakdowns —
            everything you need to build real kanji recall.
          </p>

          <span className="relative inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:border-white/15 dark:text-zinc-400">
            Coming soon to Google Play
          </span>

          <div className="relative mt-4 w-full max-w-2xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 translate-y-6 scale-95 rounded-3xl bg-brand/25 blur-2xl dark:bg-brand/15"
            />
            <div className="relative aspect-[1376/768] w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:shadow-black/40 dark:ring-white/10">
              <Image
                src="/images/banner.png"
                alt="Kanji Up app screens: kanji selection, drawing practice, and evaluation results"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 672px, 100vw"
                priority
              />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full scroll-mt-24 bg-brand-light/40 py-24 dark:bg-white/[0.03]"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 sm:px-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex flex-col items-center gap-10 md:flex-row ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-3xl shadow-lg shadow-black/5 ring-1 ring-black/5 md:w-1/2 dark:shadow-black/30 dark:ring-white/10">
                  <Image
                    src={feature.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="flex flex-col gap-3 text-center md:w-1/2 md:text-left">
                  <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
                    {feature.title}
                  </h2>
                  <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full scroll-mt-24 px-6 py-24 sm:px-16"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              How it works
            </h2>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col gap-3">
                  <span className="text-3xl font-semibold text-brand dark:text-[#e87d7f]">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="premium"
          className="w-full scroll-mt-24 bg-brand-light/40 py-24 dark:bg-white/[0.03]"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 sm:px-16 md:flex-row">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-3xl shadow-lg shadow-black/5 ring-1 ring-black/5 md:w-1/2 dark:shadow-black/30 dark:ring-white/10">
              <Image
                src="/images/premium.jpg"
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-col gap-3 text-center md:w-1/2 md:text-left">
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
                Kanji Up Premium
              </h2>
              <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                Premium unlocks additional features to enhance your learning
                experience. Details coming soon.
              </p>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="w-full scroll-mt-24 px-6 py-24 sm:px-16"
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Frequently asked questions
            </h2>
            <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-6">
                  <h3 className="font-semibold text-black dark:text-zinc-50">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full bg-brand-light/40 px-6 py-20 text-center sm:px-16 dark:bg-white/[0.03]">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
            <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Ready to start learning?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Kanji Up is launching soon on Google Play.
            </p>
            <span className="mt-2 inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium text-zinc-500 dark:border-white/15 dark:text-zinc-400">
              Coming soon to Google Play
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
