import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FEF3C7] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
            Legal
          </Badge>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Please read these terms carefully before using ChickFarms.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-amber-100 p-8"
        >
          <div className="prose prose-amber max-w-none">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-amber-700 mb-6">
              By accessing and using ChickFarms, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">2. Game Rules and Fair Play</h2>
            <p className="text-amber-700 mb-6">
              Users must follow fair play practices and avoid any form of cheating or exploitation of game mechanics.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">3. Virtual Currency and Transactions</h2>
            <p className="text-amber-700 mb-6">
              All transactions involving USDT are final. Users are responsible for maintaining the security of their accounts and crypto wallets.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">4. Account Responsibilities</h2>
            <p className="text-amber-700 mb-6">
              Users are responsible for maintaining the confidentiality of their account information and for all activities under their account.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">5. Service Modifications</h2>
            <p className="text-amber-700 mb-6">
              ChickFarms reserves the right to modify or discontinue the service at any time without notice.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-amber-700 mb-6">
              ChickFarms shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
