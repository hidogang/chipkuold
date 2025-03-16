import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[#FEF3C7] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">
            Get in Touch
          </Badge>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Contact Us</h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Have questions? We're here to help and would love to hear from you.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-amber-100">
              <CardHeader>
                <CardTitle className="text-amber-900">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-900">Name</label>
                    <Input placeholder="Your name" className="border-amber-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-900">Email</label>
                    <Input type="email" placeholder="your@email.com" className="border-amber-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-amber-900">Message</label>
                    <Textarea placeholder="Your message" className="border-amber-200 min-h-[150px]" />
                  </div>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border border-amber-100 text-center">
              <div className="text-2xl mb-3">📧</div>
              <h3 className="font-semibold text-amber-900 mb-2">Email</h3>
              <p className="text-amber-700">support@chickfarms.com</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-amber-100 text-center">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-semibold text-amber-900 mb-2">Live Chat</h3>
              <p className="text-amber-700">Available 24/7</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-amber-100 text-center">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="font-semibold text-amber-900 mb-2">Social Media</h3>
              <p className="text-amber-700">@ChickFarms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
