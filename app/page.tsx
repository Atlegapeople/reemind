"use client";

import { useState, useEffect, useCallback } from "react";
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
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Inter, Dynalight, Poppins } from "next/font/google";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    gradient: "from-[#17C3B2]/5 to-[#17C3B2]/10",
    accent: "#17C3B2"
  },
  {
    icon: <LucideLock className="h-8 w-8 text-[#227C9D]" />,
    title: "End-to-End Hashing",
    text: "All names and emails are hashed. We can't see them — and we don't want to.",
    gradient: "from-[#227C9D]/5 to-[#227C9D]/10",
    accent: "#227C9D"
  },
  {
    icon: <LucideClock className="h-8 w-8 text-[#FE6D73]" />,
    title: "On-Demand Access",
    text: "Your reminders are only accessed when you request them. No background processing.",
    gradient: "from-[#FE6D73]/5 to-[#FE6D73]/10",
    accent: "#FE6D73"
  },
  {
    icon: <LucideHeartHandshake className="h-8 w-8 text-[#FFCB77]" />,
    title: "Built for Care",
    text: "Reemind helps you stay connected — simply, beautifully, and meaningfully.",
    gradient: "from-[#FFCB77]/5 to-[#FFCB77]/10",
    accent: "#FFCB77"
  },
];

interface FormData {
  name: string;
  email: string;
  month: string;
  day: string;
  reminder: string;
}

interface FormCardProps {
  success: boolean;
  showManageForm: boolean;
  formData: FormData;
  manageEmail: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleManageSubmit: (e: React.FormEvent) => Promise<void>;
  setManageEmail: (email: string) => void;
  resetForm: () => void;
  setShowManageForm: (show: boolean) => void;
  isLoading: boolean;
  isManageLoading: boolean;
}

interface ReminderFormProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

interface SuccessViewProps {
  resetForm: () => void;
  setShowManageForm: (show: boolean) => void;
}

export default function HomePage() {
  const [showManageForm, setShowManageForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    month: "",
    day: "",
    reminder: "7",
  });
  const [manageEmail, setManageEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isManageLoading, setIsManageLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsMounted(true);
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Update dimensions on resize
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#227C9D', '#17C3B2', '#FE6D73', '#FFCB77'],
      startVelocity: 30,
      gravity: 0.8,
      scalar: 1.2,
      ticks: 100
    });
  };

  useEffect(() => {
    if (success) {
      showConfetti();
    }
  }, [success]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Log the data being sent
      console.log("Sending data:", formData);

      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData),
      });

      // Log the response status
      console.log("Response status:", res.status);

      // Try to parse the response as JSON
      let data;
      try {
        const textResponse = await res.text();
        console.log("Raw response:", textResponse);
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid server response");
      }

      if (data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          month: "",
          day: "",
          reminder: "7",
        });
        toast.success("Reminder set successfully!");
      } else {
        console.error("Server returned error:", data);
        toast.error(data.error || "Failed to set reminder");
      }
    } catch (error) {
      console.error("Error submitting reminder:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsManageLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: manageEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Verification code sent! Check your inbox.");
        window.location.href = `/verify?email=${encodeURIComponent(manageEmail)}`;
      } else {
        toast.error(data.error || "Failed to send code");
      }
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsManageLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
  };

  return (
    <div className={`min-h-screen text-[#212529] ${inter.className} relative`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {/* Background gradient */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] opacity-30"
        />
        
        {/* Floating elements */}
        {isMounted && (
          <>
            {/* Top left floating element */}
            <motion.div
              initial={{ x: -100, y: -100 }}
              animate={{ x: 0, y: 0 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#227C9D]/20 blur-3xl"
            />

            {/* Top right floating element */}
            <motion.div
              initial={{ x: 100, y: -100 }}
              animate={{ x: 0, y: 0 }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute top-40 right-40 w-72 h-72 rounded-full bg-[#17C3B2]/20 blur-3xl"
            />

            {/* Bottom left floating element */}
            <motion.div
              initial={{ x: -100, y: 100 }}
              animate={{ x: 0, y: 0 }}
              transition={{
                duration: 30,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute bottom-40 left-40 w-56 h-56 rounded-full bg-[#FE6D73]/20 blur-3xl"
            />

            {/* Bottom right floating element */}
            <motion.div
              initial={{ x: 100, y: 100 }}
              animate={{ x: 0, y: 0 }}
              transition={{
                duration: 35,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[#FFCB77]/20 blur-3xl"
            />

            {/* Center floating element */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#227C9D]/20 blur-3xl"
            />
          </>
        )}
      </div>
      
      {/* Hero and Form Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
        >
          {/* Hero Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            {/* Logo with enhanced animation */}
            <motion.h1
              className={`${dynalight.className} text-[7rem] text-[#227C9D] leading-none`}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              style={{ lineHeight: '0.9' }}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              Reemind.
            </motion.h1>

            {/* Main description */}
            <motion.div 
              className="max-w-lg space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.p 
                className="text-[#495057] text-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Reemind makes it easy to stay thoughtful — with simple birthday
                reminders for the people you care about.
              </motion.p>

              {/* Trust badge */}
              <motion.div 
                className="inline-flex flex-col items-center lg:items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className={`${dynalight.className} text-4xl text-[#227C9D] tracking-wide whitespace-nowrap`}>
                  Trusted by Family & Friends, keeping connections alive
                </p>
              </motion.div>
            </motion.div>

            {/* Animated Headline */}
            <motion.div 
              className="w-full lg:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.h2
                className={`text-3xl lg:text-4xl font-bold leading-tight text-[#212529] ${poppins.className} max-w-xl`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Typewriter
                  words={[
                    "Remember the moments that matter...",
                    "Never forget a special day...",
                    "Stay connected with loved ones...",
                    "Make every birthday count...",
                    "Keep memories alive..."
                  ]}
                  loop={true}
                  cursor
                  cursorStyle="|"
                  typeSpeed={50}
                  deleteSpeed={40}
                  delaySpeed={4000}
                  cursorBlinking={true}
                  cursorColor="#227C9D"
                />
              </motion.h2>
            </motion.div>
          </div>

          {/* Form Section with enhanced animations */}
          <motion.div 
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
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
              isLoading={isLoading}
              isManageLoading={isManageLoading}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Promises Section with enhanced animations */}
      <motion.div 
        className="px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full rounded-3xl overflow-hidden border border-[#f0f0f0] shadow-sm bg-white/80 backdrop-blur-sm">
          <PromisesSection />
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div 
        className="px-6 mt-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full rounded-3xl overflow-hidden border border-[#f0f0f0] shadow-sm bg-white/80 backdrop-blur-sm">
          <HowItWorksSection />
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        className="px-6 mt-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full rounded-3xl overflow-hidden border border-[#f0f0f0] shadow-sm bg-white/80 backdrop-blur-sm">
          <FAQSection />
        </div>
      </motion.div>

      {/* Footer with enhanced animations */}
      <motion.div 
        className="px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full rounded-t-3xl overflow-hidden border border-[#f0f0f0] shadow-sm bg-white/80 backdrop-blur-sm">
          <Footer />
        </div>
      </motion.div>
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
  isLoading,
  isManageLoading,
}: FormCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[#f0f0f0] p-8 w-full max-w-md h-[600px] flex flex-col"
    >
      <div className="flex-1 space-y-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-4"
        >
          <h3 className="text-2xl font-semibold text-[#17C3B2]">
            {success
              ? "Success!"
              : showManageForm
              ? "Manage Your Reminders"
              : "Set Up a Birthday Reminder"}
          </h3>
          <p className="text-sm text-[#495057]">
            {success
              ? "Your reminder was saved successfully."
              : showManageForm
              ? "Enter your email to view or update your reminders."
              : "We'll send you a gentle reminder before the special day"}
          </p>
        </motion.div>

        <div className="flex-1 flex flex-col justify-between">
          {success ? (
            <SuccessView resetForm={resetForm} setShowManageForm={setShowManageForm} />
          ) : showManageForm ? (
            <form onSubmit={handleManageSubmit} className="flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                <motion.div whileFocus={{ scale: 1.01 }}>
                  <Label htmlFor="manageEmail">
                    Enter your email to manage your reminders
                  </Label>
                  <Input
                    id="manageEmail"
                    type="email"
                    value={manageEmail}
                    onChange={(e) => setManageEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full p-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17C3B2] transition-all duration-200"
                    required
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isManageLoading}
                    className="w-full bg-[#17C3B2] hover:bg-[#227C9D] text-white font-semibold py-3 text-lg rounded-md shadow transition-all"
                  >
                    {isManageLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </motion.div>
              </div>
            </form>
          ) : (
            <ReminderForm 
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {!success && (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-4">
          <Button
            variant="outline"
            onClick={() => setShowManageForm(!showManageForm)}
            className="w-full border border-[#227C9D] text-[#227C9D] hover:bg-[#227C9D]/10 font-semibold py-3 text-lg rounded-md"
          >
            {showManageForm ? "Set Reminder" : "Manage Reminders"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

function SuccessView({ resetForm, setShowManageForm }: SuccessViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="flex flex-col justify-between h-full"
    >
      <div className="flex flex-col items-center space-y-4">
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
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mt-6"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => {
            setShowManageForm(true);
            resetForm();
          }}
          className="w-full bg-[#17C3B2] hover:bg-[#227C9D] text-white font-semibold py-3 text-lg rounded-md shadow transition-all"
        >
          Manage Your Reminders
        </Button>
      </motion.div>
    </motion.div>
  );
}

function ReminderForm({ formData, handleChange, handleSubmit, isLoading }: ReminderFormProps) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (date) {
      const month = (date.getMonth() + 1).toString();
      const day = date.getDate().toString();
      handleChange({ target: { id: 'month', value: month } } as any);
      handleChange({ target: { id: 'day', value: day } } as any);
    }
  }, [date, handleChange]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div 
        whileFocus={{ scale: 1.01 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="text-sm font-medium">
          Who's birthday do you want to remember?
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Mom, Dad, Best Friend..."
          className="w-full p-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17C3B2] transition-all duration-200"
          required
        />
      </motion.div>

      <motion.div 
        whileFocus={{ scale: 1.01 }}
        className="space-y-2"
      >
        <Label className="text-sm font-medium">When is their birthday?</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full p-3 justify-start text-left font-normal bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-[#17C3B2]/5 focus:ring-2 focus:ring-[#17C3B2] transition-all duration-200 ${
                !date && "text-gray-500"
              }`}
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-[#17C3B2]" />
              {date ? format(date, "MMMM d") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 border-[#17C3B2]/20" 
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setOpen(false);
              }}
              initialFocus
              className="rounded-lg border-0"
              disabled={{ before: new Date(new Date().getFullYear(), 0, 1) }}
              fromMonth={new Date(new Date().getFullYear(), 0)}
              toMonth={new Date(new Date().getFullYear(), 11)}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center px-8",
                caption_label: "text-sm font-medium text-[#227C9D]",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#17C3B2]/10 rounded-lg transition-all",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm relative [&:has([aria-selected])]:bg-[#17C3B2]/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal rounded-lg hover:bg-[#17C3B2]/10 transition-colors",
                day_selected: "bg-[#17C3B2] text-white hover:bg-[#17C3B2] hover:text-white focus:bg-[#17C3B2] focus:text-white",
                day_today: "bg-[#227C9D]/5 text-[#227C9D]",
                day_outside: "text-gray-300 opacity-50 hover:bg-transparent hover:text-gray-300 cursor-default",
                day_disabled: "text-gray-300 opacity-50 hover:bg-transparent hover:text-gray-300 cursor-not-allowed",
                day_range_middle: "aria-selected:bg-[#17C3B2]/10",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
              }}
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      <motion.div 
        whileFocus={{ scale: 1.01 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-sm font-medium">
          Which email address should we notify?
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full p-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17C3B2] transition-all duration-200"
          required
        />
      </motion.div>

      <motion.div 
        whileFocus={{ scale: 1.01 }}
        className="space-y-2"
      >
        <Label htmlFor="reminder" className="text-sm font-medium">
          How many days before would you like to be reminded?
        </Label>
        <select
          id="reminder"
          value={formData.reminder}
          onChange={handleChange}
          className="w-full p-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#17C3B2] transition-all duration-200"
        >
          {REMINDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className={`w-full p-4 bg-[#FE6D73] text-white rounded-lg font-semibold 
          ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#FFCB77] transform transition-all duration-200'}
          focus:outline-none focus:ring-2 focus:ring-[#FE6D73] focus:ring-offset-2`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Setting Reminder...</span>
          </div>
        ) : (
          "Set Reminder"
        )}
      </motion.button>
    </form>
  );
}

function PromisesSection() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#17C3B2]/5 to-[#227C9D]/5 rounded-full blur-3xl -z-10" />
          <h2 className="text-3xl font-bold text-[#227C9D] mb-4">Our Promise to You</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We believe in transparency and trust. Here's what you can expect from Reemind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROMISES.map(({ icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                rotate: 0.5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#17C3B2]/5 to-[#227C9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="relative z-10">
                <motion.div 
                  className="mb-4 transform group-hover:scale-110 transition-transform duration-200"
                  whileHover={{ 
                    scale: 1.1,
                    transition: { 
                      duration: 0.2,
                      repeat: 1,
                      repeatType: "reverse"
                    }
                  }}
                >
                  {icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-[#227C9D] group-hover:text-[#17C3B2] transition-colors duration-200">{title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{text}</p>
              </div>
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
      className="bg-[#f1f1f1] py-10 text-center text-sm text-[#868e96]"
    >
      <div className="px-4 space-y-4">
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

function HowItWorksSection() {
  const steps = [
    {
      icon: <CalendarIcon className="h-8 w-8 text-[#17C3B2]" />,
      title: "Pick a Date",
      description: "Choose the birthday you want to remember using our simple calendar picker."
    },
    {
      icon: <LucideClock className="h-8 w-8 text-[#FE6D73]" />,
      title: "Set Reminder",
      description: "Tell us how many days before you'd like to be notified."
    },
    {
      icon: <LucideHeartHandshake className="h-8 w-8 text-[#FFCB77]" />,
      title: "Stay Connected",
      description: "We'll send you a gentle reminder before their special day."
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#17C3B2]/5 to-[#227C9D]/5 rounded-full blur-3xl -z-10" />
          <h2 className="text-3xl font-bold text-[#227C9D] mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reemind makes it easy to stay thoughtful and never miss another birthday.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                rotate: 0.5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#17C3B2]/5 to-[#227C9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="relative z-10">
                <motion.div 
                  className="mb-4 transform group-hover:scale-110 transition-transform duration-200"
                  whileHover={{ 
                    scale: 1.1,
                    transition: { 
                      duration: 0.2,
                      repeat: 1,
                      repeatType: "reverse"
                    }
                  }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-[#227C9D] group-hover:text-[#17C3B2] transition-colors duration-200">{step.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "How does Reemind work?",
      answer: "Simply enter the birthday you want to remember, choose how many days before you'd like to be notified, and we'll send you a reminder email when the time comes."
    },
    {
      question: "Is it free to use?",
      answer: "Yes! Reemind is completely free to use. We believe in helping people stay connected with their loved ones."
    },
    {
      question: "Can I set multiple reminders?",
      answer: "Absolutely! You can set as many birthday reminders as you'd like, and manage them all from your dashboard."
    },
    {
      question: "How do I manage my reminders?",
      answer: "Click on 'Manage Reminders' to view, edit, or delete your existing reminders. You'll need to verify your email to access your dashboard."
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#17C3B2]/5 to-[#227C9D]/5 rounded-full blur-3xl -z-10" />
          <h2 className="text-3xl font-bold text-[#227C9D] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                rotate: 0.5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#17C3B2]/5 to-[#227C9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold mb-2 text-[#227C9D] group-hover:text-[#17C3B2] transition-colors duration-200">{faq.question}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}