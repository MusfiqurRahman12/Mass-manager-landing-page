import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// CSS-rendered mockups of the actual MessSync UI screens
function DashboardMockup() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-inner h-full">
      {/* Sidebar + Content Layout */}
      <div className="flex h-full">
        {/* Mini Sidebar */}
        <div className="w-12 bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center py-3 gap-3 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-primary/20" />
          <div className="w-6 h-6 rounded bg-primary/40" />
          <div className="w-6 h-6 rounded bg-neutral-300 dark:bg-neutral-700" />
          <div className="w-6 h-6 rounded bg-neutral-300 dark:bg-neutral-700" />
          <div className="w-6 h-6 rounded bg-neutral-300 dark:bg-neutral-700" />
        </div>
        {/* Main */}
        <div className="flex-1 p-3 space-y-3">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <div className="h-3 w-28 bg-neutral-800 dark:bg-white rounded" />
              <div className="h-2 w-20 bg-neutral-300 dark:bg-neutral-600 rounded mt-1" />
            </div>
            <div className="h-5 w-16 rounded-full bg-primary/20 border border-primary/30" />
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Deposits", value: "৳12,500", color: "text-green-500", emoji: "💵" },
              { label: "Meals", value: "৳4,200", color: "text-blue-500", emoji: "🍽️" },
              { label: "Balance", value: "৳3,100", color: "text-emerald-500", emoji: "⚖️" },
            ].map((card) => (
              <div key={card.label} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
                <div className="text-[8px] text-neutral-400">{card.label}</div>
                <div className={`text-xs font-bold ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>
          {/* Monthly Summary Card */}
          <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
            <div className="h-2 w-20 bg-neutral-800 dark:bg-white rounded mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-700">
                <div className="text-[7px] text-neutral-400">Opening</div>
                <div className="text-[9px] font-bold text-neutral-800 dark:text-white">৳5,000</div>
              </div>
              <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-700">
                <div className="text-[7px] text-neutral-400">Closing</div>
                <div className="text-[9px] font-bold text-neutral-800 dark:text-white">৳3,100</div>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
          <div className="space-y-1">
            {["Add Meal 🍽️", "Add Expense 💰", "View Members 👥"].map((a) => (
              <div key={a} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[8px] text-neutral-600 dark:text-neutral-300">
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MealsMockup() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-inner h-full p-3 space-y-2">
      <div className="h-3 w-24 bg-neutral-800 dark:bg-white rounded" />
      <div className="h-2 w-32 bg-neutral-300 dark:bg-neutral-600 rounded" />
      {/* Summary Cards Row */}
      <div className="grid grid-cols-5 gap-1">
        {["My Meals", "Total", "Rate", "Cost", "Today"].map((label) => (
          <div key={label} className="p-1.5 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-700">
            <div className="text-[6px] text-neutral-400">{label}</div>
            <div className="text-[9px] font-bold text-neutral-800 dark:text-white">{Math.floor(Math.random() * 50 + 10)}</div>
          </div>
        ))}
      </div>
      {/* Meal Table */}
      <div className="rounded-lg border border-neutral-200/60 dark:border-neutral-700 overflow-hidden">
        <div className="grid grid-cols-4 gap-1 p-1.5 bg-neutral-50 dark:bg-neutral-800 text-[7px] font-semibold text-neutral-500">
          <span>Date</span><span>Member</span><span>Meals</span><span className="text-right">Cost</span>
        </div>
        {["May 16", "May 15", "May 14", "May 13", "May 12"].map((date, i) => (
          <div key={date} className="grid grid-cols-4 gap-1 p-1.5 text-[7px] text-neutral-600 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800">
            <span>{date}</span>
            <span>{["Emon", "Sarah", "Alex", "David", "Emon"][i]}</span>
            <span className="px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded text-center w-fit">{[2, 1, 3, 1, 2][i]}</span>
            <span className="text-right">৳{[120, 60, 180, 60, 120][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsMockup() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-inner h-full p-3 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-3 w-32 bg-neutral-800 dark:bg-white rounded" />
          <div className="h-2 w-24 bg-neutral-300 dark:bg-neutral-600 rounded mt-1" />
        </div>
        <div className="h-5 w-16 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[7px] text-neutral-500">📄 PDF</div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Total Meals", value: "156", color: "text-blue-500" },
          { label: "Meal Rate", value: "৳60", color: "text-yellow-500" },
          { label: "Expenses", value: "৳18.5K", color: "text-red-500" },
          { label: "Grocery", value: "৳9.4K", color: "text-green-500" },
        ].map((card) => (
          <div key={card.label} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-center">
            <div className="text-[7px] text-neutral-400">{card.label}</div>
            <div className={`text-xs font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>
      {/* Expense Breakdown Bars */}
      <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 space-y-1.5">
        <div className="text-[8px] font-semibold text-neutral-800 dark:text-white">Expense Breakdown</div>
        {[
          { label: "Meals", pct: 52, color: "bg-orange-400" },
          { label: "Rent", pct: 32, color: "bg-blue-400" },
          { label: "Utilities", pct: 16, color: "bg-yellow-400" },
        ].map((item) => (
          <div key={item.label} className="space-y-0.5">
            <div className="flex justify-between text-[7px] text-neutral-500">
              <span>{item.label}</span><span>{item.pct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full">
              <div className={`h-1.5 ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-inner h-full p-3 flex flex-col">
      <div className="h-3 w-16 bg-neutral-800 dark:bg-white rounded mb-2" />
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Messages */}
        <div className="flex gap-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-200 shrink-0" />
          <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[7px] text-neutral-600 dark:text-neutral-300 max-w-[70%]">
            Hey, did anyone buy groceries today? 🛒
          </div>
        </div>
        <div className="flex gap-1.5 justify-end">
          <div className="p-1.5 rounded-lg bg-primary text-white text-[7px] max-w-[70%]">
            Yes! I got rice and vegetables. Added it to expenses already ✅
          </div>
          <div className="w-5 h-5 rounded-full bg-purple-200 shrink-0" />
        </div>
        <div className="flex gap-1.5">
          <div className="w-5 h-5 rounded-full bg-green-200 shrink-0" />
          <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[7px] text-neutral-600 dark:text-neutral-300 max-w-[70%]">
            Thanks! I'll be having dinner tonight 🍽️
          </div>
        </div>
        <div className="flex gap-1.5 justify-end">
          <div className="p-1.5 rounded-lg bg-primary text-white text-[7px] max-w-[70%]">
            Cool, I'll mark your meal for today
          </div>
          <div className="w-5 h-5 rounded-full bg-purple-200 shrink-0" />
        </div>
      </div>
      {/* Input */}
      <div className="mt-2 flex gap-1.5">
        <div className="flex-1 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
        <div className="w-5 h-5 rounded-full bg-primary" />
      </div>
    </div>
  );
}

const screens = [
  { id: "dashboard", label: "Dashboard", component: <DashboardMockup />, description: "Real-time overview of deposits, expenses, and balances" },
  { id: "meals", label: "Meal Tracking", component: <MealsMockup />, description: "Track daily meals, bulk entry, and per-member costs" },
  { id: "reports", label: "Reports & PDF", component: <ReportsMockup />, description: "Generate monthly statements and download PDF reports" },
  { id: "chat", label: "Live Chat", component: <ChatMockup />, description: "Coordinate groceries, meals, and house matters in real-time" },
];

export function UIShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.95]);

  return (
    <section ref={containerRef} className="py-24 md:py-32 bg-neutral-950 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full filter blur-[120px]" />

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Preview
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Mess. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Your Rules.</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Every screen is designed to make shared living effortless. Here is what you and your roommates get.
          </p>
        </motion.div>

        {/* Perspective showcase */}
        <motion.div
          style={{ rotateX, scale, transformPerspective: 1200 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {screens.map((screen, i) => (
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Label */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-semibold text-white">{screen.label}</span>
                </div>
                <span className="text-xs text-neutral-500 group-hover:text-primary transition-colors">{screen.description}</span>
              </div>
              {/* Screen Frame */}
              <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm p-1 shadow-2xl shadow-black/50 group-hover:border-primary/40 transition-colors">
                {/* Window Bar */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-neutral-800">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <div className="ml-4 flex-1 h-4 rounded bg-neutral-800 max-w-[200px]" />
                </div>
                {/* Content */}
                <div className="h-[260px] md:h-[300px] overflow-hidden">
                  {screen.component}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
