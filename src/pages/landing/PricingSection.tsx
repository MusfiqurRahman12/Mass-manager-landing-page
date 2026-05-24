import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../components/common";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "৳0",
    period: "forever",
    description: "Perfect for small messes just getting started.",
    features: [
      "Up to 5 members",
      "Meal tracking",
      "Basic expense splitting",
      "Monthly summary",
      "Community support",
    ],
    notIncluded: [
      "PDF reports",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Get Started Free",
    popular: false,
    gradient: "",
  },
  {
    name: "Pro",
    price: "৳299",
    period: "/month",
    description: "For serious messes that need full transparency.",
    features: [
      "Up to 20 members",
      "Everything in Free",
      "PDF report generation",
      "Utility expense tracking",
      "Home rent splitting",
      "Real-time chat",
      "Month history & archival",
      "Email support",
    ],
    notIncluded: [
      "Custom branding",
    ],
    cta: "Start 14-Day Trial",
    popular: true,
    gradient: "from-primary via-secondary to-accent",
  },
  {
    name: "Enterprise",
    price: "৳799",
    period: "/month",
    description: "For hostel managers and large shared spaces.",
    features: [
      "Unlimited members",
      "Everything in Pro",
      "Admin dashboard",
      "Custom branding",
      "Multi-mess management",
      "Audit logs",
      "Priority support",
      "API access",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
    gradient: "",
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-neutral-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
            Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">transparent</span> pricing.
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            No hidden fees. No surprises. Just like how your mess finances should be.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isAnnual
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              Annual
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-3xl p-[1px] ${
                plan.popular
                  ? "bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl shadow-primary/20"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold shadow-lg">
                  Most Popular ✨
                </div>
              )}
              <div className={`h-full rounded-3xl p-8 ${
                plan.popular
                  ? "bg-white dark:bg-neutral-900"
                  : "bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800"
              }`}>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-neutral-900 dark:text-white">
                    {plan.price === "৳0"
                      ? "৳0"
                      : isAnnual
                        ? `৳${Math.round(parseInt(plan.price.replace("৳", "")) * 0.8)}`
                        : plan.price}
                  </span>
                  <span className="text-neutral-500 text-sm">{plan.period}</span>
                </div>

                <Link to="/register">
                  <Button
                    className={`w-full mb-8 ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/25"
                        : ""
                    }`}
                    variant={plan.popular ? "primary" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-40">
                      <svg className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm text-neutral-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            14-day money-back guarantee. No questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
