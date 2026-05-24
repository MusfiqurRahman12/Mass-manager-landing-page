import { motion } from "framer-motion";

interface QuestionItem {
  question: string;
  word: string;
  answer: string;
  icon: string;
  color: string;
}

const items: QuestionItem[] = [
  {
    word: "WHAT",
    question: "What is MessSync?",
    answer: "A comprehensive shared-living and mess management platform that automates daily meals, utility divisions, rent balances, and member deposits in a single unified dashboard.",
    icon: "🎯",
    color: "from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/20",
  },
  {
    word: "WHY",
    question: "Why use it?",
    answer: "No more ledger books, messy spreadsheets, or roommate disputes. Automate calculations, log historic summaries, and ensure complete transparency for every penny spent.",
    icon: "💡",
    color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20",
  },
  {
    word: "WHO",
    question: "Who is it for?",
    answer: "Built for students, bachelors, flatmates, roommates, and managers of shared housing facilities who need to divide shared living expenses fairly and transparently.",
    icon: "👥",
    color: "from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/20",
  },
  {
    word: "WHEN",
    question: "When to use it?",
    answer: "Add daily meals, register instant grocery purchases on the go, log utility bills, and generate final monthly settle sheets automatically when the billing cycle concludes.",
    icon: "📅",
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    word: "WHERE",
    question: "Where to access?",
    answer: "Everywhere. MessSync is a cloud-based web app. Review statements on your tablet, log bazaar costs on your mobile phone, or configure months on your desktop browser.",
    icon: "🌍",
    color: "from-red-500/20 to-pink-500/10 text-red-400 border-red-500/20",
  },
  {
    word: "HOW",
    question: "How to start?",
    answer: "Sign up, create a mess group, and invite your roommates. Start recording deposits, meals, and expenses. MessSync handles the complex mathematics instantly.",
    icon: "⚙️",
    color: "from-indigo-500/20 to-blue-500/10 text-indigo-400 border-indigo-500/20",
  },
];

export function FiveWOneHSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section id="about" className="py-24 bg-neutral-900 border-y border-neutral-800/80 relative overflow-hidden scroll-mt-16">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="container-max relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase bg-primary/10 px-3 py-1.5 rounded-full">
            THE 5W1H PARADIGM
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-6 mb-4 tracking-tight">
            Understanding MessSync
          </h2>
          <p className="text-neutral-400 text-lg">
            Let's break down how MessSync simplifies shared living dynamics across six essential dimensions.
          </p>
        </div>

        {/* Question Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((item) => (
            <motion.div
              key={item.word}
              variants={itemVariants}
              className={`rounded-2xl border bg-gradient-to-br ${item.color} p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl filter drop-shadow">{item.icon}</span>
                  <span className="text-xs font-extrabold tracking-widest text-neutral-500 group-hover:text-primary transition-colors">
                    {item.word}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-neutral-100 mb-3 group-hover:text-white">
                  {item.question}
                </h3>
                
                <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
