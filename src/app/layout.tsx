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
    default: "كنيسة البابا كيرلس بغرب النوبارية",
    template: "%s | كنيسة البابا كيرلس بغرب النوبارية",
  },
  description: "الموقع الرسمي لكنيسة البابا كيرلس بغرب النوبارية، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
  verification: {
    google: "47IwqRN0Ngws4YGHghaE_MsDwQJRg_eQLE5x9mbqG0c",
  },
  keywords: [
    "كنيسة البابا كيرلس",
    "كنيسة البابا كيرلس بغرب النوبارية",
    "كنيسة البابا كيرلس غرب النوبارية",
    "كنيسة البابا كيرلس مصر",
    "البابا كيرلس غرب النوبارية",
  ],
  authors: [{ name: "كنيسة البابا كيرلس بغرب النوبارية" }],
  creator: "كنيسة البابا كيرلس بغرب النوبارية",
  publisher: "كنيسة البابا كيرلس بغرب النوبارية",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "كنيسة البابا كيرلس بغرب النوبارية",
    description: "الموقع الرسمي لكنيسة البابا كيرلس بغرب النوبارية، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
    url: siteUrl,
    siteName: "كنيسة البابا كيرلس بغرب النوبارية",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/church.jpg",
        width: 1200,
        height: 630,
        alt: "كنيسة البابا كيرلس بغرب النوبارية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "كنيسة البابا كيرلس بغرب النوبارية",
    description: "الموقع الرسمي لكنيسة البابا كيرلس بغرب النوبارية، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
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
      "name": "كنيسة البابا كيرلس بغرب النوبارية",
      "description": "الموقع الرسمي لكنيسة البابا كيرلس بغرب النوبارية، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
      "inLanguage": "ar",
    },
    {
      "@type": "Church",
      "@id": `${siteUrl}/#church`,
      "name": "كنيسة البابا كيرلس بغرب النوبارية",
      "url": siteUrl,
      "logo": `${siteUrl}/logo.png`,
      "image": `${siteUrl}/church.jpg`,
      "description": "الموقع الرسمي لكنيسة البابا كيرلس بغرب النوبارية، لخدمة وتنظيم بيانات العائلات والخدام والآباء الكهنة.",
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
