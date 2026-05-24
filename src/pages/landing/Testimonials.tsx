import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Alex",
    role: "University Student",
    quote: "We used to argue every week about who bought groceries last. MessSync completely eliminated the tension in our apartment.",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Sarah & Roommates",
    role: "Young Professionals",
    quote: "The meal tracking feature alone is worth it. No more cooking too much food or someone feeling left out of the dinner plans.",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "David",
    role: "Mess Manager",
    quote: "Calculating the end-of-month balances used to take me hours on Excel. Now I just click 'Generate PDF' and I'm done.",
    avatar: "https://i.pravatar.cc/150?img=68",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-neutral-900 overflow-hidden scroll-mt-16">
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Loved by <span className="text-primary">roommates.</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Don't just take our word for it. Here is what other messes are saying.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800"
            >
              <div className="absolute top-8 right-8 text-6xl text-primary/10 font-serif leading-none">
                "
              </div>
              <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 relative z-10 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-primary/20" />
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
