"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 250) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const navLinks = [
        { label: "الرئيسية", href: "/" },
        { label: "العائلات", href: "/families" },
        { label: "الخدام", href: "/servants" },
        { label: "الآباء الكهنة", href: "/priests" },
    ];

    return (
        <>
            <footer
                dir="rtl"
                className="mt-auto border-t border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-main)] transition-colors"
            >
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        {/* Logo & System Name */}
                        <Link
                            href="/"
                            className="group mb-3 flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-105"
                        >
                            <Image
                                src="/images/church-logo.png"
                                alt="شعار كنيسة البابا كيرلس بغرب النوبارية"
                                width={60}
                                height={60}
                                className="h-14 w-14 object-contain drop-shadow-sm"
                            />
                            <span className="text-lg font-bold text-[var(--primary)] transition-colors group-hover:text-[var(--primary-hover)]">
                                كنيسة البابا كيرلس بغرب النوبارية
                            </span>
                        </Link>

                        {/* Short Description */}
                        <p className="mb-6 max-w-md text-sm text-[var(--text-muted)]">
                            نظام متكامل لإدارة وتنظيم بيانات الكنيسة
                        </p>

                        {/* Quick Navigation Links */}
                        <nav aria-label="روابط سريعة" className="mb-6">
                            <ul className="flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-8">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="font-medium text-[var(--text-main)] transition-colors hover:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-focus)] rounded-[var(--radius-sm)] px-1 py-0.5"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* WhatsApp Contact Button */}
                        <div className="mb-6 flex items-center justify-center">
                            <a
                                href="https://wa.me/201032910697"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="التواصل عبر واتساب"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)] hover:text-white hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[var(--primary-focus)]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5"
                                >
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                            </a>
                        </div>

                        {/* Divider */}
                        <div className="mb-5 h-px w-full max-w-xs bg-[var(--border-color)]" />

                        {/* Copyright Section */}
                        <p className="text-xs text-[var(--text-muted)]">
                            © 2026 جميع الحقوق محفوظة
                        </p>
                    </div>
                </div>
            </footer>

            {/* Back to Top Floating Button */}
            {showBackToTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    aria-label="العودة إلى أعلى الصفحة"
                    className="
                        fixed bottom-6 left-6 z-40
                        flex h-11 w-11 items-center justify-center
                        rounded-[var(--radius-md)]
                        bg-[var(--primary)] text-white
                        shadow-lg
                        transition-all duration-300
                        hover:-translate-y-1 hover:bg-[var(--primary-hover)]
                        focus:outline-none focus:ring-4 focus:ring-[var(--primary-focus)]
                    "
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.2}
                        stroke="currentColor"
                        className="h-5 w-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 15.75l7.5-7.5 7.5 7.5"
                        />
                    </svg>
                </button>
            )}
        </>
    );
}
