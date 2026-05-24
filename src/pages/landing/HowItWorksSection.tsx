import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-neutral-900">
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
            Shared living, <span className="text-primary">simplified.</span>
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Say goodbye to messy spreadsheets and awkward money conversations. We handle the math so you can enjoy your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-16">
            <motion.div style={{ opacity }} className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Financial Transparency</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
                Add groceries, rent, and utility bills. MessSync instantly calculates who owes what, preventing "I already paid my share" arguments.
              </p>
            </motion.div>
            
            <motion.div style={{ opacity }} className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Meal Tracking</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
                Know exactly who is eating today. Members can turn their meals on or off with a single tap, reducing food waste and splitting costs accurately.
              </p>
            </motion.div>

            <motion.div style={{ opacity }} className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-2xl mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 dark:text-white">Real-time Sync</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
                Everyone gets notified instantly. Download end-of-month PDF reports to keep records crystal clear.
              </p>
            </motion.div>
          </div>

          {/* 3D / Parallax Elements */}
          <div className="relative h-[600px] hidden md:block perspective-1000">
            <motion.div 
              style={{ y: y1 }}
              className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl backdrop-blur-3xl border border-white/20 dark:border-neutral-800 shadow-2xl p-6 flex flex-col justify-between transform rotate-12"
            >
              <div className="w-12 h-12 rounded-full bg-primary/30 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
            </motion.div>

            <motion.div 
              style={{ y: y2 }}
              className="absolute bottom-20 left-10 w-72 h-48 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-3xl backdrop-blur-3xl border border-white/20 dark:border-neutral-800 shadow-2xl p-6 flex items-center justify-center transform -rotate-6"
            >
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-neutral-900 dark:text-white">$142.50</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Total Month Expense</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
