import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Will I Kill This Plant?",
  description:
    "An honest pre-purchase plant check for people who keep killing plants. We know your history. The plants do, too.",
  openGraph: {
    title: "Will I Kill This Plant?",
    description: "Get the verdict before you waste $42… once again.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-forest">
        {children}
      </body>
    </html>
  );
}
