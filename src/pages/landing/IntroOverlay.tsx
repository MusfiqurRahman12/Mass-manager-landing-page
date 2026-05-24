import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

/**
 * IntroOverlay — A cinematic full-screen loading animation.
 * 
 * Shows a centered MacBook that opens its lid to reveal the hero section
 * screenshot. Once fully open, the overlay fades away to show the actual
 * landing page underneath.
 */
export function IntroOverlay() {
  const [phase, setPhase] = useState<"closed" | "opening" | "done">("closed");
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Only play the cinematic intro if the user loads the page at the very top
    // (no anchor hash and scroll position is at the top)
    const isAtTop = window.scrollY < 50;
    const hasNoAnchor = !window.location.hash || window.location.hash === "#" || window.location.hash === "#hero";
    
    if (!isAtTop || !hasNoAnchor) {
      setShouldRender(false);
      setPhase("done");
      return;
    }

    // Start lid opening after a brief pause
    const t1 = setTimeout(() => setPhase("opening"), 400);
    // Remove overlay after animation completes
    const t2 = setTimeout(() => setPhase("done"), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!shouldRender) return null;

  // Lid animation variants
  const lidVariants = {
    closed: { rotateX: -85 },
    opening: { 
      rotateX: 0,
      transition: { duration: 1.8, ease: [0.25, 1, 0.5, 1], delay: 0 }
    },
  };

  // Neon glow behind the laptop
  const glowVariants = {
    closed: {
      scale: 0.85,
      opacity: 0.9,
      boxShadow: "0 0 30px 8px rgba(170, 59, 255, 0.8), 0 0 50px 15px rgba(6, 182, 212, 0.6)",
    },
    opening: {
      scale: [0.85, 1.3, 1.1],
      opacity: [0.9, 1.0, 0],
      boxShadow: [
        "0 0 30px 8px rgba(170, 59, 255, 0.8), 0 0 50px 15px rgba(6, 182, 212, 0.6)",
        "0 0 80px 25px rgba(170, 59, 255, 1), 0 0 120px 40px rgba(6, 182, 212, 0.8)",
        "0 0 40px 10px rgba(170, 59, 255, 0), 0 0 60px 15px rgba(6, 182, 212, 0)"
      ],
      transition: { duration: 2.0, times: [0, 0.4, 1], ease: "easeOut" }
    }
  };

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-neutral-900 flex items-center justify-center"
          style={{ perspective: "1200px" }}
        >
          {/* Ambient background glow */}
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full filter blur-[150px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-secondary/8 rounded-full filter blur-[130px] pointer-events-none" />

          {/* Centered MacBook */}
          <div className="relative w-[90%] max-w-3xl flex flex-col items-center" style={{ perspective: "1400px" }}>
            
            {/* Neon Glow burst behind the laptop */}
            <motion.div
              variants={glowVariants as any}
              initial="closed"
              animate={phase === "opening" ? "opening" : "closed"}
              className="absolute w-[85%] aspect-[16/10] bg-transparent rounded-2xl pointer-events-none"
              style={{ transform: "translateY(-12px)" }}
            />

            {/* 3D Laptop Container */}
            <div className="w-full flex flex-col items-center" style={{ transformStyle: "preserve-3d" }}>
              
              {/* Lid — rotates open around bottom hinge */}
              <motion.div
                variants={lidVariants as any}
                initial="closed"
                animate={phase === "opening" ? "opening" : "closed"}
                className="relative w-[85%] aspect-[16/10]"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "bottom center",
                }}
              >
                {/* FRONT: Screen */}
                <div
                  className="absolute inset-0 bg-neutral-950 rounded-2xl p-[1.5%] border-[3px] border-neutral-800/80 shadow-2xl"
                  style={{ backfaceVisibility: "hidden", transform: "translateZ(0.5px)" }}
                >
                  {/* Webcam notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-2 bg-neutral-900 rounded-b-md flex items-center justify-center gap-1 z-20">
                    <div className="w-1 h-1 bg-blue-900/80 rounded-full" />
                    <div className="w-0.5 h-0.5 bg-green-500/50 rounded-full" />
                  </div>

                  {/* Screen */}
                  <div className="relative w-full h-full bg-neutral-900 rounded-lg overflow-hidden border border-neutral-950 select-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/40 z-10" />
                    <motion.img
                      src="/images/landing/hero_preview.png"
                      alt="MessSync Hero"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: phase === "opening" ? 1 : 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className="w-full h-full object-cover object-left-top"
                    />
                  </div>
                </div>

                {/* BACK: Metal Cover */}
                <div
                  className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-2xl border-[3px] border-neutral-700/80 flex items-center justify-center shadow-2xl"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(0.5px)" }}
                >
                  <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full filter blur-[8px] animate-pulse" />
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary relative z-10">M</span>
                  </div>
                </div>
              </motion.div>

              {/* Hinge */}
              <div className="w-[83%] h-2 bg-neutral-800 border-t border-neutral-700/50" />

              {/* Keyboard Base */}
              <div
                className="w-full h-4 relative bg-gradient-to-b from-neutral-700 to-neutral-800 rounded-b-2xl shadow-xl flex justify-center"
                style={{ transform: "rotateX(75deg) translateY(-2px)", transformOrigin: "top center" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-neutral-950 rounded-b-md shadow-inner" />
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10 rounded-b-2xl" />
              </div>
            </div>

            {/* Brand text below laptop */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-8 text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight"
            >
              MessSync
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-1 text-xs text-neutral-500 uppercase tracking-widest font-semibold"
            >
              Loading your experience...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
