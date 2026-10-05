import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Creative Developer | 3D Web Experiences & Creative Coding",
    template: "%s | Creative Developer",
  },
  description: "Portfolio of a Creative Developer specializing in 3D web experiences, WebGL shaders, React Three Fiber, and immersive digital interactions.",
  keywords: [
    "Creative Developer",
    "3D Web",
    "WebGL",
    "Three.js",
    "React Three Fiber",
    "Shaders",
    "Creative Coding",
    "Portfolio",
    "Frontend Developer",
  ],
  authors: [{ name: "Creative Developer" }],
  creator: "Creative Developer",
  publisher: "Creative Developer",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://creativedev.dev",
    title: "Creative Developer | 3D Web Experiences",
    description: "Portfolio showcasing 3D web experiences, WebGL shaders, and creative coding projects.",
    siteName: "Creative Developer Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Developer | 3D Web Experiences",
    description: "Portfolio showcasing 3D web experiences, WebGL shaders, and creative coding projects.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dl.polyhaven.org" />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}