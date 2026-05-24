import { motion } from "framer-motion";

interface MacBookMockupProps {
  screenshotUrl: string;
  rotateX?: any; // MotionValue or number
  rotateY?: any; // MotionValue or number
  scale?: any; // MotionValue or number
  y?: any; // MotionValue or number
  className?: string;
  animateOpen?: boolean;
}

export function MacBookMockup({
  screenshotUrl,
  rotateX = 0,
  rotateY = 0,
  scale = 1,
  y = 0,
  className = "",
  animateOpen = false,
}: MacBookMockupProps) {
  // Motion variants for opening the lid
  const lidVariants = {
    closed: { rotateX: -80 },
    open: { 
      rotateX: 0, 
      transition: { duration: 1.6, ease: [0.25, 1, 0.5, 1], delay: 0.6 } 
    }
  };

  // Motion variants for the neon leak and open-flash (flush)
  const glowVariants = {
    closed: { 
      scale: 0.9, 
      opacity: 0.8,
      boxShadow: "0 0 25px 6px rgba(170, 59, 255, 0.75), 0 0 45px 12px rgba(6, 182, 212, 0.5), inset 0 0 15px rgba(170, 59, 255, 0.4)",
    },
    open: {
      scale: [0.9, 1.25, 1.05],
      opacity: [0.8, 1.0, 0],
      boxShadow: [
        "0 0 25px 6px rgba(170, 59, 255, 0.75), 0 0 45px 12px rgba(6, 182, 212, 0.5), inset 0 0 15px rgba(170, 59, 255, 0.4)",
        "0 0 70px 20px rgba(170, 59, 255, 0.9), 0 0 100px 30px rgba(6, 182, 212, 0.75), inset 0 0 25px rgba(170, 59, 255, 0.6)",
        "0 0 30px 5px rgba(170, 59, 255, 0), 0 0 40px 10px rgba(6, 182, 212, 0), inset 0 0 0px rgba(170, 59, 255, 0)"
      ],
      transition: { 
        duration: 1.8, 
        times: [0, 0.4, 1], // Peak glow as it passes mid-point
        ease: "easeOut",
        delay: 0.6
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ perspective: "1500px" }}>
      {/* 3D Wrapper */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          y,
          transformStyle: "preserve-3d",
        }}
        className="w-full relative flex flex-col items-center transition-all duration-300 ease-out"
      >
        {/* Neon Glow Leak & Flush (Leaks around the closed screen and flashes on open) */}
        {animateOpen && (
          <motion.div
            variants={glowVariants}
            initial="closed"
            animate="open"
            className="absolute w-[83%] aspect-[16/10] bg-neutral-900/10 rounded-2xl pointer-events-none"
            style={{
              transform: "translateZ(0px) translateY(-8px)",
              transformOrigin: "bottom center",
            }}
          />
        )}

        {/* Lid / Screen with 3D rotation around bottom hinge */}
        <motion.div 
          variants={lidVariants}
          initial={animateOpen ? "closed" : "open"}
          animate="open"
          className="relative w-[85%] aspect-[16/10]"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "bottom center",
          }}
        >
          {/* FRONT SIDE: Screen and Bezel */}
          <div 
            className="absolute inset-0 bg-neutral-950 rounded-2xl p-[1.5%] border-[3px] border-neutral-800/80 flex flex-col justify-between shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "translateZ(0.5px)",
            }}
          >
            {/* Top Bezel Notch / Webcam */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-2 bg-neutral-900 rounded-b-md flex items-center justify-center gap-1 z-20">
              <div className="w-1 h-1 bg-blue-900/80 rounded-full"></div> {/* Camera */}
              <div className="w-0.5 h-0.5 bg-green-500/50 rounded-full"></div> {/* Green indicator */}
            </div>

            {/* Actual Screen Image display */}
            <div className="relative w-full h-full bg-neutral-900 rounded-lg overflow-hidden border border-neutral-950 select-none">
              {/* Screen Reflection Gloss */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-10" />

              {/* Inner Screen Shadow / Bezel bevel */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/40 z-10" />

              {/* The Screenshot */}
              <motion.img
                key={screenshotUrl}
                src={screenshotUrl}
                alt="MessSync Interface"
                initial={animateOpen ? { opacity: 0, scale: 0.98 } : { opacity: 0.95, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: animateOpen ? 1.6 : 0 }}
                className="w-full h-full object-cover object-left-top"
              />

              {/* Neon Flash overlay when screenshotUrl changes */}
              <motion.div
                key={screenshotUrl + "_flash"}
                initial={{ opacity: 0.7, scale: 0.95 }}
                animate={{ opacity: 0, scale: 1.08 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-secondary/20 to-transparent pointer-events-none z-20 mix-blend-screen rounded-lg filter blur-[2px]"
              />
            </div>
          </div>

          {/* BACK SIDE: Metal Cover shown when closed */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-2xl border-[3px] border-neutral-700/80 flex items-center justify-center shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(0.5px)",
            }}
          >
            {/* Glowing Logo indicator */}
            <div className="w-14 h-14 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-full filter blur-[8px] animate-pulse" />
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary relative z-10">M</span>
            </div>
          </div>
        </motion.div>

        {/* Neon Scroll Glow Flash (behind the laptop for scroll transitions) */}
        {!animateOpen && (
          <motion.div
            key={screenshotUrl + "_scroll_glow"}
            initial={{ 
              scale: 0.85, 
              opacity: 0.8,
              boxShadow: "0 0 35px 8px rgba(170, 59, 255, 0.75), 0 0 55px 12px rgba(6, 182, 212, 0.5)",
            }}
            animate={{ 
              scale: 1.25, 
              opacity: 0,
              boxShadow: "0 0 70px 20px rgba(170, 59, 255, 0), 0 0 100px 30px rgba(6, 182, 212, 0)",
            }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute w-[80%] aspect-[16/10] bg-transparent rounded-2xl pointer-events-none -z-10"
            style={{
              transform: "translateZ(-10px) translateY(-12px)",
            }}
          />
        )}

        {/* Hinge & Base Bezel */}
        <div 
          className="w-[83%] h-2 bg-neutral-800 dark:bg-neutral-900 border-t border-neutral-700/50"
          style={{ transform: "translateZ(0px)" }}
        />

        {/* MacBook Body / Keyboard Base */}
        <div 
          className="w-full h-4 relative bg-gradient-to-b from-neutral-200 to-neutral-400 dark:from-neutral-700 dark:to-neutral-800 rounded-b-2xl shadow-xl flex justify-center"
          style={{
            transform: "rotateX(75deg) translateY(-2px)",
            transformOrigin: "top center",
          }}
        >
          {/* Front Opening Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-neutral-900 dark:bg-neutral-950 rounded-b-md shadow-inner" />
          
          {/* Subtle aluminum highlights */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10 rounded-b-2xl" />
        </div>
      </motion.div>
    </div>
  );
}
