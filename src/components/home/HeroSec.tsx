"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const images = [
    "/slide-00.jpeg",
    "/slide-0.jpeg",
    "/slide-1.jpeg",
    "/slide-2.jpeg",
    "/slide-3.jpeg",
    "/slide-4.jpeg",
    "/slide-5.jpeg",
    "/slide-6.jpeg",
];

const text = "كنيسة البابا كيرلس ترحب بيكم";

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Slider Auto Play
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Typing Animation
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (!isDeleting && displayText.length < text.length) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length + 1));
            }, 120);
        } else if (!isDeleting && displayText.length === text.length) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, 2500);
        } else if (isDeleting && displayText.length > 0) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length - 1));
            }, 70);
        } else if (isDeleting && displayText.length === 0) {
            timeout = setTimeout(() => {
                setIsDeleting(false);
            }, 700);
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting]);

    return (
        <section
            dir="rtl"
            className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[var(--bg-page)]"
        >
            {/* ================= Slider ================= */}
            <div className="absolute inset-0">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Image
                            src={image}
                            alt={`صورة الكنيسة ${index + 1}`}
                            fill
                            priority={index === 0}
                            className="object-cover"
                            sizes="100vw"
                        />
                    </div>
                ))}
            </div>

            {/* ================= Overlay ================= */}
            <div className="absolute inset-0 bg-[var(--primary)]/45" />

            {/* Overlay إضافي خفيف عشان الكلام يبقى أوضح */}
            <div className="absolute inset-0 bg-black/15" />

            {/* ================= Content ================= */}
            <div className="absolute inset-0 flex items-center justify-center px-5">
                <div className="text-center">
                    {/* Animated Text */}
                    <h1 className=" text-3xl font-bold leading-relaxed text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
                        {displayText}
                        <span className=" mr-1 inline-block h-[1em] w-[3px] translate-y-1 animate-pulse bg-[var(--primary-light)]" />
                    </h1>

                    {/* Small decorative line */}
                    <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-[var(--primary-light)] opacity-90" />
                </div>
            </div>

            {/* ================= Slider Indicators ================= */}
            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        aria-label={`الصورة ${index + 1}`}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? "w-8 bg-[var(--primary-light)]"
                                : "w-2 bg-white/60"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
