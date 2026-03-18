import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ConciergeAI - Enterprise AI Customer Experience Agent Builder",
  description: "Build, deploy, and manage AI-powered customer service agents with knowledge bases, conversation flows, and multi-channel support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#1f2937", color: "#f9fafb", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
