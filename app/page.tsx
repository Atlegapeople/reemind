"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LucideShieldCheck,
  LucideLock,
  LucideClock,
  LucideHeartHandshake,
  CheckCircle,
} from "lucide-react";
import { Inter, Dynalight, Poppins } from "next/font/google";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import confetti from "canvas-confetti";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const dynalight = Dynalight({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const REMINDER_OPTIONS = [
  { value: "1", label: "1 day before" },
  { value: "3", label: "3 days before" },
  { value: "7", label: "1 week before" },
  { value: "14", label: "2 weeks before" },
  { value: "30", label: "1 month before" },
];

const PROMISES = [
  {
    icon: <LucideShieldCheck className="h-8 w-8 text-[#17C3B2]" />,
    title: "Privacy First",
    text: "Your data belongs to you. We never sell or share your information. You're in control.",
  },
  {
    icon: <LucideLock className="h-8 w-8 text-[#17C3B2]" />,
    title: "End-to-End Hashing",
    text: "All names and emails are hashed. We can't see them — and we don't want to.",
  },
  {
    icon: <LucideClock className="h-8 w-8 text-[#17C3B2]" />,
    title: "On-Demand Access",
    text: "Your reminders are only accessed when you request them. No background processing.",
  },
  {
    icon: <LucideHeartHandshake className="h-8 w-8 text-[#17C3B2]" />,
    title: "Built for Care",
    text: "Reemind helps you stay connected — simply, beautifully, and meaningfully.",
  },
];

export default function HomePage() {
  const [showManageForm, setShowManageForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    month: "",
    day: "",
    reminder: "7",
  });
  const [manageEmail, setManageEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const showConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    if (success) {
      showConfetti();
    }
  }, [success]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          month: "",
          day: "",
          reminder: "7",
        });
      }
    } catch (error) {
      console.error("Error submitting reminder:", error);
    }
  };

  const handleManageSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: manageEmail }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Verification code sent! Check your inbox.");
        window.location.href = `/verify?email=${encodeURIComponent(manageEmail)}`;
      } else {
        alert("❌ Failed to send code: " + data.error);
      }
    } catch (error) {
      console.error("🔥 Error sending code:", error);
      alert("Something went wrong while sending the code.");
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setShowManageForm(false);
  };

  return (
    <div className={`min-h-screen bg-white text-[#212529] ${inter.className}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] opacity-10"
        />
        
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: 10 }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="absolute right-10 top-1/4 opacity-10"
        >
          <div className="w-64 h-64 rounded-full bg-[#17C3B2]/10" />
        </motion.div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 py-24 items-start">
        {/* Hero Section */}
        <div className="flex flex-col">
          {/* Logo */}
          <motion.h1
            className={`${dynalight.className} text-[7rem] text-[#227C9D] leading-none mb-4`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ lineHeight: '0.9' }}
          >
            Reemind.
          </motion.h1>

          {/* Static Description */}
          <div className="mb-8 space-y-2">
            <p className="text-[#495057] text-lg max-w-lg">
              Reemind makes it easy to stay thoughtful — with simple birthday
              reminders for the people you care about.
            </p>
            <p className="text-sm text-[#868e96]">
              Trusted by over 10,000 users to keep connections alive.
            </p>
          </div>

          {/* Animated Headline */}
          <motion.h2
            className={`text-4xl md:text-5xl font-bold leading-tight text-[#212529] ${poppins.className}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Typewriter
              words={["Remember the moments that matter..."]}
              loop={false}
              cursor
              cursorStyle="|"
              typeSpeed={60}
              deleteSpeed={50}
              delaySpeed={2000}
            />
          </motion.h2>
        </div>

        {/* Form Section */}
        <FormCard 
          success={success}
          showManageForm={showManageForm}
          formData={formData}
          manageEmail={manageEmail}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleManageSubmit={handleManageSubmit}
          setManageEmail={setManageEmail}
          resetForm={resetForm}
          setShowManageForm={setShowManageForm}
        />
      </div>

      {/* Promises Section */}
      <PromisesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FormCard({
  success,
  showManageForm,
  formData,
  manageEmail,
  handleChange,
  handleSubmit,
  handleManageSubmit,
  setManageEmail,
  resetForm,
  setShowManageForm,
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] p-8 w-full h-[520px] flex flex-col justify-between"
    >
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h3 className="text-2xl font-semibold text-[#17C3B2]">
            {success
              ? "Success!"
              : showManageForm
              ? "Manage Your Reminders"
              : "Set Up a Birthday Reminder"}
          </h3>
          <p className="text-sm text-[#868e96]">
            {success
              ? "Your reminder was saved successfully."
              : showManageForm
              ? "Enter your email to view or update your reminders."
              : "We'll send you a gentle reminder before the special day"}
          </p>
        </motion.div>

        {success ? (
          <SuccessView resetForm={resetForm} />
        ) : showManageForm ? (
          <ManageForm 
            manageEmail={manageEmail}
            setManageEmail={setManageEmail}
            handleManageSubmit={handleManageSubmit}
          />
        ) : (
          <ReminderForm 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
        )}
      </div>

      {!success && (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            onClick={() => setShowManageForm(!showManageForm)}
            className="w-full border border-[#227C9D] text-[#227C9D] hover:bg-[#227C9D]/10 font-semibold py-3 text-lg rounded-md mt-4"
          >
            {showManageForm ? "Set Reminder" : "Manage Reminders"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

function SuccessView({ resetForm }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="flex flex-col items-center space-y-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="text-[#17C3B2] h-10 w-10" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-md text-[#495057]"
      >
        You can manage your reminders anytime.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          className="w-full bg-[#17C3B2] hover:bg-[#227C9D] text-white font-semibold py-3 text-lg rounded-md shadow transition-all"
        >
          Go to Dashboard
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={resetForm}
          className="w-full border border-[#227C9D] text-[#227C9D] hover:bg-[#227C9D]/10 font-semibold py-3 text-lg rounded-md transition-all"
        >
          Set Another Reminder
        </Button>
      </motion.div>
    </motion.div>
  );
}

function ManageForm({ manageEmail, setManageEmail, handleManageSubmit }) {
  return (
    <form onSubmit={handleManageSubmit} className="space-y-5">
      <motion.div whileFocus={{ scale: 1.01 }}>
        <Label htmlFor="manage-email">Your email address</Label>
        <Input
          id="manage-email"
          type="email"
          value={manageEmail}
          onChange={(e) => setManageEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-[#fefefe]"
          required
        />
      </motion.div>
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="w-full bg-[#FE6D73] hover:bg-[#FFCB77] text-white font-semibold py-3 text-lg rounded-md shadow transition-all"
        >
          Submit
        </Button>
      </motion.div>
    </form>
  );
}

function ReminderForm({ formData, handleChange, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div whileFocus={{ scale: 1.01 }}>
        <Label htmlFor="name">
          Who's birthday do you want to remember?
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Mom, Dad, Best Friend…"
          className="bg-[#fefefe]"
          required
        />
      </motion.div>
      <div className="grid grid-cols-2 gap-4">
        <motion.div whileHover={{ y: -2 }}>
          <Label htmlFor="month">Month</Label>
          <select
            id="month"
            value={formData.month}
            onChange={handleChange}
            className="w-full rounded-md border border-[#dee2e6] bg-[#fefefe] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#227C9D]"
            required
          >
            <option value="" disabled>Month</option>
            {MONTHS.map((month, idx) => (
              <option key={idx} value={idx + 1}>{month}</option>
            ))}
          </select>
        </motion.div>
        <motion.div whileHover={{ y: -2 }}>
          <Label htmlFor="day">Day</Label>
          <select
            id="day"
            value={formData.day}
            onChange={handleChange}
            className="w-full rounded-md border border-[#dee2e6] bg-[#fefefe] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#227C9D]"
            required
          >
            <option value="" disabled>Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </motion.div>
      </div>
      <motion.div whileFocus={{ scale: 1.01 }}>
        <Label htmlFor="email">
          Which email address should we notify?
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="bg-[#fefefe]"
          required
        />
      </motion.div>
      <motion.div whileHover={{ y: -2 }}>
        <Label htmlFor="reminder">
          How many days before would you like to be reminded?
        </Label>
        <select
          id="reminder"
          value={formData.reminder}
          onChange={handleChange}
          className="w-full rounded-md border border-[#dee2e6] bg-[#fefefe] p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#227C9D]"
        >
          {REMINDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </motion.div>
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button
          type="submit"
          className="w-full bg-[#FE6D73] hover:bg-[#FFCB77] text-white font-semibold py-3 text-lg rounded-md shadow transition-all"
        >
          Set Reminder
        </Button>
      </motion.div>
    </form>
  );
}

function PromisesSection() {
  return (
    <section className="bg-[#fafafa] py-20 border-t border-[#f0f0f0]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-[#227C9D] mb-12"
        >
          Our Promise to You
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROMISES.map(({ icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <motion.div whileHover={{ y: -5 }}>
                <Card className="hover:shadow-lg transition-all duration-300 bg-white rounded-xl p-4 border border-[#f0f0f0]">
                  <CardHeader className="flex flex-col items-start space-y-3">
                    {icon}
                    <CardTitle className="text-lg font-semibold">
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-[#495057]">
                    {text}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="bg-[#f1f1f1] py-10 border-t border-[#dee2e6] text-center text-sm text-[#868e96]"
    >
      <div className="max-w-5xl mx-auto px-4 space-y-4">
        <p>&copy; {new Date().getFullYear()} Reemind. All rights reserved.</p>
        <div className="flex justify-center space-x-4 text-[#495057]">
          {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
            <motion.a
              key={social}
              href="#"
              className="hover:text-[#17C3B2] transition-colors"
              whileHover={{ y: -2 }}
            >
              {social}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
}