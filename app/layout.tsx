import "./globals.css";
import { Inter } from "next/font/google";
import { Dynalight } from "next/font/google";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "./providers/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const dynalight = Dynalight({ 
  subsets: ["latin"], 
  weight: "400",
  variable: "--font-dynalight"
});

export const metadata: Metadata = {
  title: "Reemind - Birthday Reminders",
  description: "Never forget a birthday again",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dynalight.variable}`}>
      <body className="bg-background-light dark:bg-background-dark transition-colors duration-200">
        <ThemeProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
