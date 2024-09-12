import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "M3U8 Viewer",
  description: "View M3U8 streams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): ReactNode {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-zinc-800 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}