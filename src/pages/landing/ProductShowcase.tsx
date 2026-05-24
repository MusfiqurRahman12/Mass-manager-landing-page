import { motion } from "framer-motion";

export function ProductShowcase() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:mix-blend-screen" />
      
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6"
          >
            A Command Center for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Mess</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-neutral-600 dark:text-neutral-400"
          >
            Beautifully designed for both desktop and mobile. Access your shared living data wherever you are, whenever you need it.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto mt-20 pb-20"
        >
          {/* Laptop Mockup */}
          <div className="relative mx-auto border-neutral-800 dark:border-neutral-800 bg-neutral-800 border-[8px] rounded-t-xl h-[250px] max-w-[420px] md:h-[450px] md:max-w-[768px] shadow-2xl">
            <div className="rounded-lg overflow-hidden h-[234px] md:h-[434px] bg-white dark:bg-neutral-900 relative">
              {/* Fallback image if actual dashboard screenshot is missing */}
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
                alt="Desktop Dashboard" 
                className="h-full w-full object-cover opacity-90"
              />
              {/* Optional UI overlay to make it look more app-like */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent mix-blend-overlay"></div>
            </div>
          </div>
          <div className="relative mx-auto bg-neutral-900 dark:bg-neutral-700 rounded-b-xl rounded-t-sm h-[17px] max-w-[480px] md:h-[24px] md:max-w-[896px]">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-neutral-800"></div>
          </div>

          {/* Mobile Mockup overlapping */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute -bottom-10 -right-4 md:-right-8 border-neutral-800 dark:border-neutral-800 bg-neutral-800 border-[14px] rounded-[2.5rem] h-[350px] w-[170px] md:h-[500px] md:w-[240px] shadow-2xl z-20"
          >
            <div className="h-[32px] w-[3px] bg-neutral-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-neutral-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-neutral-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-neutral-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-[142px] h-[322px] md:w-[212px] md:h-[472px] bg-white dark:bg-neutral-900 relative">
              <img 
                src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800" 
                alt="Mobile Dashboard" 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/40 to-transparent"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
