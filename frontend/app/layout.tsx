import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OrbitDocs",
  description: "Educational RAG workspace for the SWD392 course document chatbot.",
};

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
