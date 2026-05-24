import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { MacBookMockup } from "./MacBookMockup";

interface FeatureItem {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
}

const features: FeatureItem[] = [
  {
    title: "Personalized Financial Statements",
    subtitle: "FINANCIAL TRANSPARENCY",
    description: "Get complete transparency of your mess account. View your personal surplus or deficit, meal counts, rent share, and utility portions calculated instantly and automatically.",
    icon: "📊",
    image: "/images/landing/dashboard.png",
  },
  {
    title: "Seamless Daily Meal Logs",
    subtitle: "MEAL TRACKING",
    description: "Log meals for multiple members daily. The system tracks active meals and calculates the current meal rate dynamically in real-time to avoid manual calculation errors.",
    icon: "🍽️",
    image: "/images/landing/meals.png",
  },
  {
    title: "Bazaar & Grocery Logs",
    subtitle: "EXPENSE RECORDING",
    description: "Keep complete records of grocery shopping and bazaar costs. Specify amounts, dates, and which member spent the money. Entries are stored chronologically with manager approvals.",
    icon: "🛒",
    image: "/images/landing/meal_expenses.png",
  },
  {
    title: "Multi-Method Utility Splits",
    subtitle: "BILL DIVISION",
    description: "Split electricity, gas, water, internet, and miscellaneous shared bills. Use equal division, percentage-based ratios, or manual overrides to match your apartment policies.",
    icon: "⚡",
    image: "/images/landing/utilities.png",
  },
  {
    title: "Monthly Settlements & Archives",
    subtitle: "MONTH HISTORY",
    description: "Settle transactions and close active months. MessSync archives historical data so managers can start new cycles with zero confusion and clean calculations.",
    icon: "📅",
    image: "/images/landing/history.png",
  },
];

export function MockupScrollShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Set up scroll tracking over the entire 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to dynamic 3D rotations for the MacBook
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0, 6, -6, 5, 0, 3]
  );
  
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0, -25, 25, -20, 20, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [1, 0.96, 1.04, 0.97, 1.06, 1]
  );

  // Listen to progress to update active index for text content changes
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 5 features -> intervals of 0.2
    const index = Math.min(Math.floor(latest * 5), 4);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  });

  return (
    <div id="features" ref={containerRef} className="relative h-[500vh] bg-neutral-950 select-none scroll-mt-16">
      {/* Sticky viewport container */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden px-6 md:px-12 lg:px-24">
        
        {/* Left: Animated Text Content */}
        <div className="w-full lg:w-[45%] h-[35vh] lg:h-auto flex flex-col justify-center text-white z-10 lg:pr-8">
          <div className="max-w-xl">
            {/* Feature Index indicator */}
            <div className="flex items-center gap-2 mb-4">
              {features.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === activeIndex ? "w-8 bg-primary" : "w-2 bg-neutral-800"
                  }`}
                />
              ))}
            </div>

            {/* Slide Details */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              <span className="text-sm font-semibold tracking-wider text-primary uppercase">
                {features[activeIndex].subtitle}
              </span>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-100 flex items-center gap-3">
                <span className="text-4xl">{features[activeIndex].icon}</span>
                {features[activeIndex].title}
              </h2>
              
              <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
                {features[activeIndex].description}
              </p>
            </motion.div>

            {/* Scroll Indicator helper */}
            <div className="hidden lg:flex items-center gap-2 mt-12 text-xs text-neutral-600">
              <span className="animate-bounce">↓</span>
              <span>Keep scrolling to view other features</span>
            </div>
          </div>
        </div>

        {/* Right: Sticky MacBook with 3D Motion */}
        <div className="w-full lg:w-[50%] h-[50vh] lg:h-auto flex items-center justify-center relative mt-6 lg:mt-0">
          {/* Futuristic Background Glow */}
          <div className="absolute w-[80%] aspect-square bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent rounded-full filter blur-[80px] pointer-events-none -z-10" />

          {/* MacBook Mockup Component bound to scroll transitions */}
          <MacBookMockup
            screenshotUrl={features[activeIndex].image}
            rotateX={rotateX}
            rotateY={rotateY}
            scale={scale}
            className="w-[90%] md:w-[80%] lg:w-full"
          />
        </div>

      </div>
    </div>
  );
}
