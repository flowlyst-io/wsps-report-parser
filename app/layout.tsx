import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Brand book, "Corporate font": Nunito, Bold for titles, Light/Regular for body.
// next/font self-hosts the files at build time, so the page makes no request to
// Google at runtime and the app stays free of network calls.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WSPS Detailed Expenditure Report Parser — Flowlyst",
  description:
    "Turn a WSPS Detailed Expenditure Report export into the four files Budget Tracker needs. Runs entirely in your browser.",
  icons: { icon: "/flowlyst-icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
