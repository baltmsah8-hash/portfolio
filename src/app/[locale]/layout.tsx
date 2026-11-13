import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Alex_Brush } from "next/font/google";
import "./globals.css";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import ToTopButton from "../../components/assets/topBtn";
import { AlertProvider } from "@/src/context/alert";
import MainLoader from "@/src/components/loading/mainLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Abdelrhman Hany | Full-Stack Developer",
    template: "%s | Abdelrhman Hany",
  },
  description:
    "Portfolio of Abdelrhman Hany — Full-Stack Web Developer specializing in Next.js, TypeScript, and modern scalable web applications.",
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export const instant = false;

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!["en", "ar"].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${alexBrush.variable} h-full antialiased overflow-x-hidden scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://spline.design" />
      </head>
      <body className="min-h-full flex flex-col bg-[#02040a] text-white overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          <AlertProvider>
            <MainLoader />
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <ToTopButton />
          </AlertProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
