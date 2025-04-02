"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { LucideCheckCircle2, LucideXCircle, LucideRefreshCw, LucideMoon, LucideSun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../providers/ThemeProvider";

export default function VerifyPage() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (code.length === 6) {
      handleSubmit();
    }
  }, [code]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Verification failed");
      }

      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setError(error instanceof Error ? error.message : "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to resend verification code");
      }

      setCanResend(false);
      setCountdown(600); // Reset to 10 minutes
      setCode(""); // Clear the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      setStatus("error");
      setError(error instanceof Error ? error.message : "Failed to resend code");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] dark:bg-[#111827]">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 dark:bg-[#1F2937] dark:hover:bg-[#2D3748] transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <LucideSun className="w-5 h-5 text-yellow-400" />
          ) : (
            <LucideMoon className="w-5 h-5 text-[#227C9D]" />
          )}
        </button>
      </div>

      <div className="container mx-auto max-w-md px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-center text-[#227C9D] dark:text-[#17C3B2] mb-4">
              Verify Your Email
            </h1>
            <p className="text-center text-[#334155] dark:text-[#F1F5F9] mb-6 text-lg">
              We've sent a verification code to{" "}
              <span className="font-medium">{email}</span>
            </p>

            <div className="mb-8 text-center">
              <div className="text-base text-[#334155] dark:text-[#F1F5F9]">
                Code expires in:{" "}
                <span className="font-semibold text-[#227C9D] dark:text-[#17C3B2] text-lg">
                  {formatTime(countdown)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-[#334155] dark:text-[#F1F5F9] mb-3"
                >
                  Verification Code
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(value);
                  }}
                  className="w-full px-4 py-4 text-xl tracking-wider text-center bg-white dark:bg-[#374151] border-2 border-[#E2E8F0] dark:border-[#374151] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#227C9D] dark:focus:ring-[#17C3B2] focus:border-transparent text-[#334155] dark:text-[#F1F5F9] transition-all duration-200"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={status === "loading" || status === "success"}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                >
                  <LucideXCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg"
                >
                  <LucideCheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Email verified successfully!</span>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={status === "loading" || status === "success" || code.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full px-6 py-4 bg-[#227C9D] dark:bg-[#17C3B2] text-white rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium shadow-lg ${
                  status === "loading" ? "cursor-wait" : "cursor-pointer"
                }`}
              >
                {status === "loading" ? "Verifying..." : "Verify Code"}
              </motion.button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || status === "loading"}
                  className={`text-base text-[#227C9D] dark:text-[#17C3B2] hover:opacity-80 transition-all duration-200 flex items-center justify-center gap-2 ${
                    !canResend ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <LucideRefreshCw className={`w-5 h-5 ${!canResend ? "animate-spin" : ""}`} />
                  {canResend ? "Resend Code" : `Resend available in ${formatTime(countdown)}`}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#227C9D] dark:text-[#17C3B2] hover:opacity-80 transition-all duration-200 font-medium text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
