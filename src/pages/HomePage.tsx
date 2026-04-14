import { Link } from "react-router-dom";
import { Button } from "../components/common";
import { Footer, Navbar } from "../components/layout";

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-purple-500 to-secondary text-white py-24 md:py-32">
          <div className="container-max text-center space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                MessSync
              </h1>
              <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Simplify shared living with real-time expense tracking, meal
                management, and seamless member coordination.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login" className="flex-1 sm:flex-none">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-neutral-50 dark:bg-neutral-900">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                Everything you need to manage your shared space efficiently and
                fairly
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: "🍽️",
                  title: "Meal Tracking",
                  desc: "Track daily meals for each member",
                },
                {
                  icon: "💰",
                  title: "Expense Management",
                  desc: "Manage shared expenses and utilities",
                },
                {
                  icon: "💬",
                  title: "Real-time Chat",
                  desc: "Communicate with mess members instantly",
                },
                {
                  icon: "📊",
                  title: "Reports & Analytics",
                  desc: "Generate detailed monthly statements",
                },
                {
                  icon: "🔐",
                  title: "Secure & Private",
                  desc: "Your data is protected and encrypted",
                },
                {
                  icon: "📱",
                  title: "Mobile Friendly",
                  desc: "Fully responsive on all devices",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-5xl mb-4 inline-block group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
