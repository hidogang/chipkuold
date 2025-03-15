import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import ScrollToTop from "@/components/scroll-to-top";

export default function LandingPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      setLocation("/home");
    } else {
      setLocation("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF3C7] flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-amber-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/assets/chickfarms-logo.png" alt="ChickFarms Logo" className="h-10" />
            <span className="text-xl font-bold text-amber-900">ChickFarms</span>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                onClick={() => setLocation(user ? "/home" : "/auth")}
                className="text-amber-900 hover:text-amber-700 hover:bg-amber-50"
              >
                <span className="flex items-center">
                  <span className="mr-1.5 text-lg">🏠</span> {user ? "Dashboard" : "Login"}
                </span>
              </Button>
            </motion.div>

            {!user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    boxShadow: ["0px 0px 0px rgba(245, 158, 11, 0)", "0px 0px 15px rgba(245, 158, 11, 0.5)", "0px 0px 0px rgba(245, 158, 11, 0)"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2
                  }}
                  className="absolute inset-0 rounded-md"
                />
                <Button
                  variant="default"
                  onClick={() => setLocation("/auth")}
                  className="bg-amber-500 hover:bg-amber-600 text-white relative z-10 border border-amber-400"
                >
                  <span className="flex items-center">
                    <span className="mr-1.5 text-lg">🐔</span> Sign Up
                  </span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
              Farming Game
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 mb-6">
              Farm, Invest & Earn Real USDT
            </h1>
            <p className="text-lg text-amber-800 mb-8">
              Join ChickFarms, the innovative farming simulation where you raise chickens,
              collect eggs, and earn real cryptocurrency through strategic gameplay.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    boxShadow: ["0px 0px 0px rgba(245, 158, 11, 0)", "0px 0px 20px rgba(245, 158, 11, 0.5)", "0px 0px 0px rgba(245, 158, 11, 0)"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2
                  }}
                  className="absolute inset-0 rounded-full"
                />
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 rounded-full relative z-10 shadow-lg border-2 border-amber-400"
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-xl">🐔</span> Start Playing
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const howItWorksSection = document.getElementById("how-it-works");
                    howItWorksSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="border-amber-500 text-amber-500 hover:bg-amber-50 rounded-full shadow-md"
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-xl">📘</span> Learn More
                  </span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="/assets/chickfarms-banner.png"
                alt="ChickFarms Game Preview"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-amber-300 rounded-full opacity-30 blur-3xl"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-amber-500 rounded-full opacity-20 blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
              Game Mechanics
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              How ChickFarms Works
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              A simple farming simulation game with real earnings potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Buy Chickens",
                desc: "Purchase different types of chickens with varying production rates and hatching times.",
                icon: "🐔",
                delay: 0
              },
              {
                title: "Collect Eggs",
                desc: "Regularly collect eggs from your chickens and sell them in the marketplace for USDT.",
                icon: "🥚",
                delay: 0.1
              },
              {
                title: "Upgrade Farm",
                desc: "Expand your chicken collection and increase your earning potential over time.",
                icon: "📈",
                delay: 0.2
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: item.delay }}
                viewport={{ once: true }}
              >
                <Card className="border-amber-100 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-100 text-3xl mb-4">
                      {item.icon}
                    </div>
                    <CardTitle className="text-xl text-amber-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-700">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Meet Your Chickens */}
          <div className="mt-20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-100">
                  <h3 className="text-2xl font-bold text-amber-900 mb-6">
                    Meet Your Chickens
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Baby Chicken",
                        desc: "Produces 2 eggs every 6 hours. Perfect for beginners!",
                        price: "$90 USDT",
                        emoji: "🐥",
                        production: "8 eggs per day"
                      },
                      {
                        title: "Regular Chicken",
                        desc: "Produces 5 eggs every 5 hours. Balanced investment.",
                        price: "$150 USDT",
                        emoji: "🐔",
                        production: "24 eggs per day"
                      },
                      {
                        title: "Golden Chicken",
                        desc: "Produces 20 eggs every 3 hours. For serious farmers!",
                        price: "$400 USDT",
                        emoji: "✨🐔",
                        production: "160 eggs per day"
                      }
                    ].map((chicken, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="p-6 rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className="text-3xl"
                              animate={{
                                y: [0, -5, 0],
                                rotate: index === 0 ? [0, 10, 0] : index === 1 ? [0, -5, 0] : [0, 15, 0]
                              }}
                              transition={{
                                duration: 1.5 + index * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {chicken.emoji}
                            </motion.div>
                            <div>
                              <h4 className="font-bold text-lg text-amber-900">{chicken.title}</h4>
                              <p className="text-amber-700 text-sm">{chicken.production}</p>
                            </div>
                          </div>
                          <span className="text-lg font-semibold text-amber-600">{chicken.price}</span>
                        </div>
                        <p className="mt-3 text-amber-700 text-sm">{chicken.desc}</p>
                        <div className="mt-4">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                            ROI: {index === 0 ? "40" : index === 1 ? "30" : "20"} days
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-100">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">
                    Resource Management
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💧</span>
                      <div>
                        <h4 className="font-semibold text-amber-900">Water Needs</h4>
                        <p className="text-sm text-amber-700">Essential for egg production</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌾</span>
                      <div>
                        <h4 className="font-semibold text-amber-900">Wheat Feed</h4>
                        <p className="text-sm text-amber-700">Required for healthy chickens</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-amber-100">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">
                    Earning Potential
                  </h3>
                  <div className="space-y-2">
                    <p className="text-amber-700">
                      • Baby Chickens earn up to <span className="font-semibold">$80 USDT</span> in ROI period
                    </p>
                    <p className="text-amber-700">
                      • Regular Chickens earn up to <span className="font-semibold">$172.8 USDT</span> in ROI period
                    </p>
                    <p className="text-amber-700">
                      • Golden Chickens earn up to <span className="font-semibold">$560 USDT</span> in ROI period
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-20"> </div>
        </div>
      </section>

      {/* Deposits & Withdrawals */}
      <section className="py-20 bg-amber-50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-400 rounded-full opacity-20 blur-3xl"></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-200 text-amber-800 hover:bg-amber-300">
              Transactions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Easy Deposits & Withdrawals
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Secure and straightforward transactions to fund your farm and withdraw your earnings
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h3 className="text-2xl font-bold text-amber-900 mb-6">
                Cryptocurrency Transactions
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Deposit USDT</h4>
                    <p className="text-amber-700">
                      Deposit USDT (TRC20) to your game wallet to purchase chickens and resources.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Play & Earn</h4>
                    <p className="text-amber-700">
                      Generate income by raising chickens, collecting eggs, and selling resources.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Withdraw Profits</h4>
                    <p className="text-amber-700">
                      Withdraw your earnings to your personal USDT wallet anytime.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <img
                src="/assets/wallet-screen.svg"
                alt="Wallet Interface"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Referral Program */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <img
                src="/assets/referral-screen.svg"
                alt="Referral Program Interface"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
                Earn More
              </Badge>
              <h2 className="text-3xl font-bold text-amber-900 mb-6">
                Referral Program
              </h2>
              <p className="text-lg text-amber-700 mb-8">
                Invite friends to join ChickFarms and earn a commission on their deposits forever.
              </p>
              <div className="space-y-6">
                <div className="p-6 rounded-lg bg-amber-50 border border-amber-100">
                  <h4 className="text-xl font-semibold text-amber-900 mb-2">10% Commission</h4>
                  <p className="text-amber-700">
                    Earn 10% of every deposit your referrals make. The more active referrals you have, the more passive income you generate.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                    🔗
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">Share Your Link</h4>
                    <p className="text-amber-700">
                      Every account gets a unique referral link to share.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">
                    📊
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">Track Performance</h4>
                    <p className="text-amber-700">
                      Monitor your referrals and earnings in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="py-20 bg-amber-50 relative overflow-hidden">

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-200 text-amber-800 hover:bg-amber-300">
              Trading
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              In-Game Marketplace
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Buy and sell farm resources to maximize your profits
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <h3 className="text-2xl font-bold text-amber-900 mb-6">
                Resource Trading
              </h3>
              <p className="text-amber-700 mb-6">
                The marketplace is where you can buy essential resources for your farm
                and sell your products for USDT.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      💧
                    </motion.div>
                    <h4 className="font-semibold text-amber-900">Water</h4>
                  </div>
                  <p className="text-sm text-amber-700">
                    Essential for chicken health and egg production.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, -4, 0, 4, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    >
                      🌾
                    </motion.div>
                    <h4 className="font-semibold text-amber-900">Wheat</h4>
                  </div>
                  <p className="text-sm text-amber-700">
                    Feed your chickens to maintain egg production.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl"
                      animate={{
                        scale: [1, 1.05, 1],
                        y: [0, -3, 0]
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6
                      }}
                    >
                      🥚
                    </motion.div>
                    <h4 className="font-semibold text-amber-900">Eggs</h4>
                  </div>
                  <p className="text-sm text-amber-700">
                    Sell eggs for profit or use them to expand your farm.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg border border-amber-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl"
                      animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 10, 0, -10, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.9
                      }}
                    >
                      🐣
                    </motion.div>
                    <h4 className="font-semibold text-amber-900">Chicks</h4>
                  </div>
                  <p className="text-sm text-amber-700">
                    Buy baby chickens to start or expand your farm.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <img
                src="/assets/market-screen.svg"
                alt="Marketplace Interface"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
              Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Everything you need to know about ChickFarms
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "Is ChickFarms free to play?",
                  answer: "ChickFarms is free to register, but you'll need to make a deposit to purchase chickens and start playing. Different chickens have different prices, with baby chickens being the most affordable option for beginners."
                },
                {
                  question: "How do I earn real money?",
                  answer: "You earn by collecting eggs from your chickens and selling them in the marketplace. The more chickens you have and the better you manage your farm, the more you can earn. You can withdraw your earnings as USDT cryptocurrency."
                },
                {
                  question: "How often can chickens produce eggs?",
                  answer: "Each chicken type has a different cooldown period. Baby chickens produce eggs every 4 hours, regular chickens every 8 hours, and golden chickens every 24 hours. You need to ensure your chickens have water and feed to maintain production."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "Currently, we accept USDT (TRC20) for deposits. We're planning to add more cryptocurrency options in the future."
                },
                {
                  question: "How long do withdrawals take?",
                  answer: "Withdrawal requests are typically processed within 24 hours. Once approved, funds are transferred to your USDT wallet immediately."
                },
                {
                  question: "Is there a minimum withdrawal amount?",
                  answer: "Yes, the minimum withdrawal amount is 10 USDT. This helps minimize transaction fees and ensures efficient processing."
                }
              ].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-amber-100 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-amber-50 text-amber-900 font-semibold text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-amber-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-400 to-amber-600 text-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-300 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-700 rounded-full opacity-20 blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
                        >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Farming Journey?
              </h2>
              <p className="text-xl mb-8 text-amber-50">
                Join thousands of players already earning from their virtual farms.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative inline-block"
              >
                <motion.div
                  animate={{
                    boxShadow: ["0px 0px 0px rgba(255, 255, 255, 0)", "0px 0px 25px rgba(255, 255, 255, 0.6)", "0px 0px 0px rgba(255, 255, 255, 0)"]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2
                  }}
                  className="absolute inset-0 rounded-full"
                />
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-amber-50 px-8 text-lg rounded-full relative z-10 shadow-lg border-2 border-amber-100"
                >
                  <span className="flex items-center">
                    <span className="mr-2 text-2xl">🚀</span> Start Playing Now
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/assets/chickfarms-logo.png" alt="ChickFarms Logo" className="h-8" />
                <span className="text-lg font-bold text-white">ChickFarms</span>
              </div>
              <p className="text-amber-300 mb-4">
                The fun farming game where you can earn real cryptocurrency.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-amber-300 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-amber-300 hover:text-white transition-colors">
                  <span className="sr-only">Telegram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.18-.04-.26-.02-.11.02-1.85 1.17-5.21 3.42-.49.33-.94.5-1.35.48-.44-.02-1.3-.25-1.93-.46-.78-.24-1.39-.38-1.33-.8.03-.21.32-.43.84-.66 3.31-1.43 5.52-2.39 6.63-2.86 3.16-1.35 3.81-1.58 4.24-1.59.09 0 .31.02.45.19.12.13.15.31.17.48z" />
                  </svg>
                </a>
                <a href="#" className="text-amber-300 hover:text-white transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3847-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Game</h3>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-amber-300 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Chickens</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Marketplace</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Referral Program</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-amber-300 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Newsletter</h3>
              <p className="text-amber-300 mb-4">
                Subscribe to get updates about game features and promotions.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-md text-amber-900 w-full"
                />
                <button className="bg-amber-500 text-white px-4 py-2 rounded-r-md hover:bg-amber-600 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-amber-800 text-center text-amber-400">
            <p>&copy; {new Date().getFullYear()} ChickFarms. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}