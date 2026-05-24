import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../components/common";

export function CtaBanner() {
  return (
    <section className="py-24 relative overflow-hidden bg-neutral-900 dark:bg-black">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-secondary/30 rounded-full mix-blend-screen filter blur-[80px] opacity-50" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto p-10 md:p-16 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to end the drama?
          </h2>
          <p className="text-xl text-neutral-300 mb-10">
            Join thousands of roommates who have upgraded to a peaceful shared living experience. Setup takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg shadow-white/10">
                Create a Free Account
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-neutral-400">
            No credit card required. 100% free for basic use.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
