import type { Metadata } from "next";
import { Geist, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Footer from "@/components/shared/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["arabic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://babakerolos.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "كنيسة البابا كيرلس بعثمان محرم",
    template: "%s | كنيسة البابا كيرلس بعثمان محرم",
  },
  description: "الموقع الرسمي لكنيسة البابا كيرلس بعثمان محرم، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
  verification: {
    google: "47IwqRN0Ngws4YGHghaE_MsDwQJRg_eQLE5x9mbqG0c",
  },
  keywords: [
    "كنيسة البابا كيرلس",
    "كنيسة البابا كيرلس بعثمان محرم",
    "كنيسة البابا كيرلس عثمان محرم",
    "كنيسة البابا كيرلس مصر",
    "البابا كيرلس عثمان محرم",
  ],
  authors: [{ name: "كنيسة البابا كيرلس بعثمان محرم" }],
  creator: "كنيسة البابا كيرلس بعثمان محرم",
  publisher: "كنيسة البابا كيرلس بعثمان محرم",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "كنيسة البابا كيرلس بعثمان محرم",
    description: "الموقع الرسمي لكنيسة البابا كيرلس بعثمان محرم، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
    url: siteUrl,
    siteName: "كنيسة البابا كيرلس بعثمان محرم",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/church.jpg",
        width: 1200,
        height: 630,
        alt: "كنيسة البابا كيرلس بعثمان محرم",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "كنيسة البابا كيرلس بعثمان محرم",
    description: "الموقع الرسمي لكنيسة البابا كيرلس بعثمان محرم، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
    images: ["/church.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "كنيسة البابا كيرلس بعثمان محرم",
      "description": "الموقع الرسمي لكنيسة البابا كيرلس بعثمان محرم، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
      "inLanguage": "ar",
    },
    {
      "@type": "Church",
      "@id": `${siteUrl}/#church`,
      "name": "كنيسة البابا كيرلس بعثمان محرم",
      "url": siteUrl,
      "logo": `${siteUrl}/logo.png`,
      "image": `${siteUrl}/church.jpg`,
      "description": "الموقع الرسمي لكنيسة البابا كيرلس بعثمان محرم، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${notoNaskhArabic.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
