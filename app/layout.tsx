import "./globals.css";
import { Inter } from "next/font/google";
import { Dynalight } from "next/font/google";

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

export const metadata = {
  title: "Reemind",
  description: "Private, simple birthday reminders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dynalight.variable}`}>
      <body className="bg-[#f7f7f8]">
        <main className="min-h-screen bg-[#f7f7f8] p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
