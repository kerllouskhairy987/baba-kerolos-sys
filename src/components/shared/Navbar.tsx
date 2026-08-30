"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { label: "العائلات", href: "/families" },
        { label: "الخدام", href: "/servants" },
        { label: "الآباء الكهنة", href: "/priests" },
    ];

    return (
        <>
            <nav
                dir="rtl"
                className="w-full border-b border-[var(--border-color)] bg-[var(--card-bg)]"
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* الرئيسية - ناحية اليمين */}
                    <Link
                        href="/"
                        className="text-lg font-bold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)]"
                    >
                        الرئيسية
                    </Link>

                    {/* Desktop Links - ناحية الشمال */}
                    <div className="hidden items-center gap-8 md:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-[var(--text-main)] transition-colors hover:text-[var(--primary)]"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="text-sm font-medium text-red-500 transition-colors hover:text-red-700 cursor-pointer"
                            >
                                تسجيل الخروج
                            </button>
                        </form>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        aria-label="فتح القائمة"
                        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-main)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)] md:hidden"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Aside */}
            <aside
                dir="rtl"
                className={`fixed right-0 top-0 z-50 h-full w-72 bg-[var(--card-bg)] shadow-2xl transition-transform duration-300 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Aside Header */}
                <div className="flex h-16 items-center justify-between border-b border-[var(--border-color)] px-5">
                    <span className="text-lg font-bold text-[var(--text-main)]">
                        القائمة
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="إغلاق القائمة"
                        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-5 w-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18 18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-2 p-4">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="rounded-[var(--radius-md)] px-4 py-3 text-base font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <form action={logoutAction} className="mt-4 pt-4 border-t border-[var(--border-color)]">
                        <button
                            type="submit"
                            className="w-full text-right rounded-[var(--radius-md)] px-4 py-3 text-base font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                            تسجيل الخروج
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}