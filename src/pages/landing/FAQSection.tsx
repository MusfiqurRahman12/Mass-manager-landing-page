import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const faqs = [
  {
    q: "Is MessSync really free?",
    a: "Yes! Our Free plan supports up to 5 members with core features like meal tracking and basic expense splitting. No credit card required.",
  },
  {
    q: "How does meal tracking work?",
    a: "The mess manager adds daily meal entries for each member. Members can also toggle their meals on/off. The system automatically calculates per-meal rates and individual costs.",
  },
  {
    q: "Can I split rent and utilities unevenly?",
    a: "Absolutely. MessSync supports equal, percentage-based, and manual share types for both home rent and utility expenses. Everyone sees their fair share.",
  },
  {
    q: "How do PDF reports work?",
    a: "At the end of each month, the manager can generate a comprehensive PDF statement that includes all meals, expenses, deposits, and final balances for every member.",
  },
  {
    q: "Is my financial data secure?",
    a: "Yes. All data is encrypted in transit and at rest. We use role-based access control so only the mess manager can modify settings, while members get full transparency.",
  },
  {
    q: "Can I switch plans later?",
    a: "Of course! You can upgrade or downgrade at any time. When upgrading, you get immediate access to new features. We also offer a 14-day money-back guarantee.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-neutral-50 dark:bg-neutral-950 scroll-mt-16">
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Got questions? <span className="text-primary">We've got answers.</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <span className="font-semibold text-neutral-900 dark:text-white pr-4">{faq.q}</span>
                <motion.svg
                  animate={{ rotate: openIndex === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-primary shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
