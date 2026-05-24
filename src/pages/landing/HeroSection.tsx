import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Utensils, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "../../components/common";
import { MacBookMockup } from "./MacBookMockup";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Track scroll inside Hero to animate mockups
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Map scroll progress to dynamic perspective transformations for the mockup
  const rotateX = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[140vh] flex flex-col items-center justify-start overflow-hidden bg-neutral-900 pt-32 pb-24 border-b border-neutral-800"
    >
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="container-max relative z-10 mx-auto px-6 w-full flex flex-col items-center">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-8 border border-primary/20 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-semibold tracking-wide uppercase">Roommate life, upgraded.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black text-white tracking-tight mb-8"
          >
            Manage your mess, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              without the drama.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Track meals, split utilities fairly, and sync shared expenses in real-time. Built for roommates, students, and shared apartments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
          >
            <Link to="/#free" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/45 transition-all transform hover:-translate-y-0.5">
                Start Your Mess Free
              </Button>
            </Link>
            <Link to="/#pro" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700/80 transition-all transform hover:-translate-y-0.5">
                Subscribe &amp; Upgrade
              </Button>
            </Link>
          </motion.div>

          {/* User Count mini proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-4 text-sm text-neutral-500"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-neutral-900 bg-neutral-850"
                  src={`https://i.pravatar.cc/100?img=${i + 14}`}
                  alt={`User ${i}`}
                />
              ))}
            </div>
            <p className="font-medium">Trusted by 10,000+ roommates worldwide</p>
          </motion.div>
        </div>

        {/* Laptop Mockup display as Centerpiece */}
        <motion.div
          style={{ opacity }}
          className="mt-20 w-full max-w-4xl mx-auto relative px-4 md:px-12"
        >
          {/* Soft blur light behind the laptop */}
          <div className="absolute inset-0 bg-primary/20 rounded-full filter blur-[100px] pointer-events-none -z-10 w-[70%] h-[70%] mx-auto" />
          
          {/* Floating Card 1: Meals */}
          <motion.div
            animate={{ y: [-8, 8] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="absolute -left-4 lg:-left-12 top-[10%] hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-md shadow-2xl z-20"
          >
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Meal Rate</p>
              <p className="text-xs font-bold text-white">৳42.50 / Meal</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Bazar / Expenses */}
          <motion.div
            animate={{ y: [8, -8] }}
            transition={{ duration: 3.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.5 }}
            className="absolute -right-4 lg:-right-12 top-[18%] hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-md shadow-2xl z-20"
          >
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Total Bazar</p>
              <p className="text-xs font-bold text-white">৳12,450.00</p>
            </div>
          </motion.div>

          {/* Floating Card 3: Roommates count */}
          <motion.div
            animate={{ y: [6, -6] }}
            transition={{ duration: 4.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
            className="absolute -left-8 lg:-left-20 bottom-[30%] hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-md shadow-2xl z-20"
          >
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Roommates</p>
              <p className="text-xs font-bold text-white">6 Active Sync</p>
            </div>
          </motion.div>

          {/* Floating Card 4: Utilities */}
          <motion.div
            animate={{ y: [-6, 6] }}
            transition={{ duration: 4.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.8 }}
            className="absolute -right-8 lg:-right-16 bottom-[25%] hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 backdrop-blur-md shadow-2xl z-20"
          >
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Utility Bills</p>
              <p className="text-xs font-bold text-white">Equal Split</p>
            </div>
          </motion.div>

          <MacBookMockup 
            screenshotUrl="/images/landing/dashboard.png" 
            rotateX={rotateX}
            rotateY={rotateY}
            scale={scale}
            className="w-full"
          />
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500"
      >
        <span className="text-xs uppercase tracking-widest font-semibold">Scroll to explore</span>
        <motion.div 
          animate={{ y: [0, 8, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 border-2 border-neutral-700 rounded-full flex justify-center p-1"
        >
          <div className="w-1 h-2 bg-neutral-500 rounded-full animate-bounce" />
        </motion.div>
      </motion.div>
    </section>
  );
}
