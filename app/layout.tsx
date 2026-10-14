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
      <body className="relative min-h-full flex flex-col bg-paper text-forest">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src="/watercolor/eucalyptus.jpg"
            alt=""
            aria-hidden="true"
            className="watercolor top-[-30px] right-[-40px] w-[min(40vw,420px)] rotate-[18deg]"
          />
          <img
            src="/watercolor/eucalyptus.jpg"
            alt=""
            aria-hidden="true"
            className="watercolor bottom-[-40px] left-[-50px] w-[min(36vw,380px)] rotate-[198deg]"
          />
        </div>
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </body>
    </html>
  );
}
