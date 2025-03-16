import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FEF3C7] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
            Privacy
          </Badge>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect and use your information.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-amber-100 p-8"
        >
          <div className="prose prose-amber max-w-none">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">1. Information We Collect</h2>
            <p className="text-amber-700 mb-6">
              We collect information that you provide directly to us, including account information, transaction data, and communications.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-amber-700 mb-6">
              We use the information we collect to operate and improve our services, process your transactions, and communicate with you.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">3. Information Sharing</h2>
            <p className="text-amber-700 mb-6">
              We do not sell or share your personal information with third parties except as described in this policy.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">4. Data Security</h2>
            <p className="text-amber-700 mb-6">
              We implement appropriate security measures to protect your personal information from unauthorized access or disclosure.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-amber-700 mb-6">
              We use cookies and similar technologies to enhance your experience and collect usage information.
            </p>

            <h2 className="text-2xl font-bold text-amber-900 mb-4">6. Your Rights</h2>
            <p className="text-amber-700 mb-6">
              You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
