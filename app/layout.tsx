import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Price Analyzer",
  description: "Make smarter trading decisions with data-driven price analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
