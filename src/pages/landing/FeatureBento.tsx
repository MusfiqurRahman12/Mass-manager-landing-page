import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../components/common";

const features = [
  {
    title: "Secure & Private",
    desc: "Role-based access ensures only the manager can modify the mess settings, while members get full transparency.",
    span: "col-span-1 md:col-span-2",
    icon: "🔐",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-500",
  },
  {
    title: "Mobile Ready",
    desc: "Check your balance or update your meal status from anywhere, instantly.",
    span: "col-span-1",
    icon: "📱",
    color: "bg-purple-50 dark:bg-purple-900/20 text-purple-500",
  },
  {
    title: "PDF Reports",
    desc: "Generate end-of-month statements with a single click. Keep a digital paper trail.",
    span: "col-span-1",
    icon: "📄",
    color: "bg-pink-50 dark:bg-pink-900/20 text-pink-500",
  },
  {
    title: "Live Chat",
    desc: "Discuss grocery lists, complain about who didn't wash dishes, and stay connected.",
    span: "col-span-1 md:col-span-2",
    icon: "💬",
    color: "bg-green-50 dark:bg-green-900/20 text-green-500",
  },
];

export function FeatureBento() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:justify-between md:items-end">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Everything you need, <br className="hidden md:block" />
              <span className="text-neutral-500">nothing you don't.</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              MessSync is built specifically for shared living spaces. We stripped away the bloat to focus on what actually matters.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <Link to="/register">
              <Button variant="outline" className="border-neutral-300 dark:border-neutral-700 dark:text-white">
                View all features
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`${feature.span} p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-300`}
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center text-2xl mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
