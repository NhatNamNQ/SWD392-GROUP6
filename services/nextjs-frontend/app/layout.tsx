import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "OrbitDocs",
  description: "Educational RAG workspace for the SWD392 course document chatbot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
