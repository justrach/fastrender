import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastRender vs Remark | Performance Comparison",
  description: "Real-time comparison of WebAssembly-powered FastRender vs JavaScript-based Remark for Markdown and LaTeX rendering",
  keywords: ["FastRender", "Remark", "WebAssembly", "Markdown", "LaTeX", "Performance", "Comparison"],
  authors: [{ name: "Rach Pradhan" }],
  openGraph: {
    title: "FastRender vs Remark Performance Comparison",
    description: "Compare the performance of WebAssembly and JavaScript-based Markdown renderers in real-time",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FastRender vs Remark Performance Comparison",
    description: "Compare the performance of WebAssembly and JavaScript-based Markdown renderers in real-time",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
