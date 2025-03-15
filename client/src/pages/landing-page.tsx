import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Info, DollarSign, Users, Egg, HelpCircle, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

export default function LandingPage() {
  const [stats, setStats] = useState({
    eggsHatched: 2347852,
    activeUsers: 5293,
    totalEarnings: 412539
  });

  useEffect(() => {
    // Animate stats counting up
    const interval = setInterval(() => {
      setStats(prevStats => ({
        eggsHatched: prevStats.eggsHatched + Math.floor(Math.random() * 10),
        activeUsers: prevStats.activeUsers + (Math.random() > 0.7 ? 1 : 0),
        totalEarnings: prevStats.totalEarnings + Math.floor(Math.random() * 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to a section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-amber-100/30 to-transparent" />
          <img 
            src="/assets/farm-background.png" 
            alt="Farm Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div 
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="inline-block bg-amber-400 text-amber-900 font-semibold px-3 py-1 rounded-full text-sm">
                🚀 Play &amp; Earn with ChickFarms
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-amber-900 leading-tight">
                Farm, <span className="text-orange-600">Shoot</span>, Earn – The Ultimate Chicken Investment Game!
              </h1>
              <p className="text-lg text-amber-800 md:pr-12">
                Raise chickens, collect eggs, and earn real USDT in this immersive farm simulation game with exciting shooting mechanics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  asChild
                >
                  <Link href="/auth">Join Now & Start Earning!</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-amber-500 text-amber-700"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="/assets/chickfarms-hero.png" 
                alt="ChickFarms Game" 
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-4 -right-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-amber-200">
                <div className="flex gap-1 items-center text-amber-700 font-semibold">
                  <Egg className="h-5 w-5 text-amber-500" />
                  <span className="text-sm">Already farming:</span>
                </div>
                <div className="text-xl font-bold text-amber-900">
                  {stats.eggsHatched.toLocaleString()} Eggs Hatched
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-md border border-amber-100">
              <Egg className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-900">
                {stats.eggsHatched.toLocaleString()}
              </div>
              <p className="text-amber-700">Total Eggs Hatched</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-md border border-amber-100">
              <Users className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-900">
                {stats.activeUsers.toLocaleString()}
              </div>
              <p className="text-amber-700">Active Farmers</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-md border border-amber-100">
              <DollarSign className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-amber-900">
                ${stats.totalEarnings.toLocaleString()}
              </div>
              <p className="text-amber-700">Total USDT Earned</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">How ChickFarms Works</h2>
              <p className="text-amber-700 max-w-2xl mx-auto">
                ChickFarms combines farming simulation with engaging gameplay to create a unique earning opportunity.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🐔",
                title: "Buy Chickens",
                description: "Purchase Baby, Regular, or Golden Chickens from the shop. Each type has different earning potential.",
                delay: 0.1
              },
              {
                icon: "🥚",
                title: "Hatch & Earn Eggs",
                description: "Feed your chickens with wheat and water to produce eggs at different rates based on chicken type.",
                delay: 0.2
              },
              {
                icon: "🔫",
                title: "Shooting Arena",
                description: "Buy guns & bullets. Enter the arena and shoot chickens for bonus eggs and special rewards!",
                delay: 0.3
              },
              {
                icon: "💰",
                title: "Sell & Withdraw",
                description: "Convert eggs to USDT in the marketplace. Withdraw your earnings to your crypto wallet.",
                delay: 0.4
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md border border-amber-100 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: step.delay }}
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-amber-900 mb-2">
                  Step {index + 1}: {step.title}
                </h3>
                <p className="text-amber-700">{step.description}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-white"
              asChild
            >
              <Link href="/auth">Start Playing Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* Features Tabs */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-amber-50/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">Game Features</h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Explore the various features that make ChickFarms both fun and profitable.
            </p>
          </motion.div>
          
          <Tabs defaultValue="deposits" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="deposits">Deposits & Withdrawals</TabsTrigger>
              <TabsTrigger value="referral">Referral Program</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="chickens">Chicken Types</TabsTrigger>
            </TabsList>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <TabsContent value="deposits" className="p-6 bg-white rounded-xl shadow-md border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Easy Deposits & Withdrawals</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Multi-Network Support</span>
                          <p className="text-amber-700 text-sm">Deposit USDT via Ethereum, Tron, or BNB networks</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Secure Transactions</span>
                          <p className="text-amber-700 text-sm">Your funds are handled with enterprise-grade security</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Efficient Withdrawals</span>
                          <p className="text-amber-700 text-sm">Withdraw your earnings directly to your USDT wallet</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <img 
                      src="/assets/wallet-screen.png" 
                      alt="Deposits and Withdrawals" 
                      className="rounded-xl shadow-lg w-full"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="referral" className="p-6 bg-white rounded-xl shadow-md border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Lucrative Referral Program</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <Users className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">10% Commission</span>
                          <p className="text-amber-700 text-sm">Earn 10% of the deposits made by your referred players</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <Users className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Unlimited Referrals</span>
                          <p className="text-amber-700 text-sm">There's no limit to how many friends you can refer</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <Users className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Leaderboard Rewards</span>
                          <p className="text-amber-700 text-sm">Top referrers get special bonuses and recognition</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <img 
                      src="/assets/referral-screen.png" 
                      alt="Referral Program" 
                      className="rounded-xl shadow-lg w-full"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="marketplace" className="p-6 bg-white rounded-xl shadow-md border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Dynamic Marketplace</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Resource Trading</span>
                          <p className="text-amber-700 text-sm">Buy and sell water, wheat, eggs, and more</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Live Price Updates</span>
                          <p className="text-amber-700 text-sm">Market prices that reflect real-time supply and demand</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Strategic Trading</span>
                          <p className="text-amber-700 text-sm">Buy low, sell high to maximize your earnings</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <img 
                      src="/assets/market-screen.png" 
                      alt="Marketplace" 
                      className="rounded-xl shadow-lg w-full"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chickens" className="p-6 bg-white rounded-xl shadow-md border border-amber-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4">Chicken Varieties</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <span className="text-amber-600 font-bold text-sm">1</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Baby Chicken</span>
                          <p className="text-amber-700 text-sm">Low cost, short cooldown, small egg production</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <span className="text-amber-600 font-bold text-sm">2</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Regular Chicken</span>
                          <p className="text-amber-700 text-sm">Medium cost, balanced cooldown and egg production</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-amber-100 p-1 rounded-full mr-3 mt-1">
                          <span className="text-amber-600 font-bold text-sm">3</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-900">Golden Chicken</span>
                          <p className="text-amber-700 text-sm">Premium cost, longer cooldown, massive egg production</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <img 
                      src="/assets/chickens-screen.png" 
                      alt="Chicken Types" 
                      className="rounded-xl shadow-lg w-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </section>
      
      {/* Call To Action */}
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-amber-50">
              Join thousands of players already farming, playing, and earning with ChickFarms.
            </p>
            <Button 
              size="lg" 
              className="bg-white hover:bg-amber-100 text-amber-600"
              asChild
            >
              <Link href="/">Enter the Game</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* FAQs */}
      <section id="faqs" className="py-16 md:py-24 px-4 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-amber-700 max-w-2xl mx-auto">
              Find answers to common questions about ChickFarms.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "How do I start playing ChickFarms?",
                  answer: "Sign up for an account, make a USDT deposit, purchase your first chicken from the shop, and start your farming journey!"
                },
                {
                  question: "What are the different types of chickens?",
                  answer: "ChickFarms offers three main chicken types: Baby (beginner-friendly), Regular (balanced), and Golden (high-yield premium)."
                },
                {
                  question: "How do withdrawals work?",
                  answer: "Submit a withdrawal request with your USDT wallet address. Our team reviews and processes withdrawals within 24 hours."
                },
                {
                  question: "Is there a minimum deposit amount?",
                  answer: "The minimum deposit is 10 USDT, allowing everyone to start with a reasonable investment."
                },
                {
                  question: "How does the referral system work?",
                  answer: "You earn 10% commission on deposits made by players you refer. This is an unlimited, lifetime commission on all their deposits."
                },
                {
                  question: "How often can chickens produce eggs?",
                  answer: "Each chicken type has a different cooldown period: Baby (4 hours), Regular (8 hours), Golden (24 hours)."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-amber-900 hover:text-amber-700">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-amber-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
          
          <motion.div
            className="mt-12 bg-white p-6 rounded-xl shadow-md border border-amber-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-amber-100 rounded-full p-4">
                <HelpCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-amber-900 mb-2">Still have questions?</h3>
                <p className="text-amber-700">Our support team is ready to help you with any questions you may have.</p>
              </div>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap"
              >
                Contact Support <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/assets/chickfarms-logo-light.png" 
                alt="ChickFarms" 
                className="h-10 mb-4" 
              />
              <p className="text-sm">
                ChickFarms combines farming simulation with play-to-earn mechanics to create a fun and profitable gaming experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#faqs" className="hover:text-white">FAQs</a></li>
                <li><Link href="/auth" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Telegram</a></li>
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-amber-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} ChickFarms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}