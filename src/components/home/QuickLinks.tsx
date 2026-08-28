import Link from "next/link";

const cards = [
    {
        title: "العائلات",
        description: "تعرف على العائلات وخدماتها وأنشطتها داخل الكنيسة.",
        href: "/families",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-9 w-9"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0M18.75 10.5a2.25 2.25 0 1 1-2.25 2.25M21 20.25a5.25 5.25 0 0 0-4.5-5.196"
                />
            </svg>
        ),
    },
    {
        title: "الخدام",
        description: "تعرف على خدام الكنيسة ومجالات الخدمة المختلفة.",
        href: "/servants",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-9 w-9"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a6 6 0 0 0-12 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 19.5a5.25 5.25 0 0 0-3.75-5.04M16.5 4.5a3.75 3.75 0 0 1 0 7.5"
                />
            </svg>
        ),
    },
    {
        title: "الآباء الكهنة",
        description: "تعرف على الآباء الكهنة وخدمتهم ورعايتهم للكنيسة.",
        href: "/priests",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-9 w-9"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v18M8 7h8M7 11h10M9 21h6"
                />
            </svg>
        ),
    },
];

export default function QuickLinks() {
    return (
        <section
            dir="rtl"
            className="bg-[var(--bg-page)] px-4 py-16 sm:px-6 lg:px-8"
        >
            <div className="mx-auto max-w-7xl">

                {/* Section Header */}
                <div className="mb-10 text-center">
                    <span className="mb-3 inline-block text-sm font-semibold text-[var(--primary)]">
                        خدمات الكنيسة
                    </span>

                    <h2 className="text-3xl font-bold text-[var(--text-main)] sm:text-4xl">
                        تعرف على مجتمع الكنيسة
                    </h2>

                    <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-[var(--primary)]" />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.href}
                            className="
                group
                relative
                overflow-hidden
                rounded-[var(--radius-lg)]
                border
                border-[var(--border-color)]
                bg-[var(--card-bg)]
                p-7
                shadow-[var(--shadow-card)]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-[var(--primary-border)]
                hover:shadow-xl
              "
                        >
                            {/* Decorative background */}
                            <div
                                className="
                  absolute
                  -right-12
                  -top-12
                  h-32
                  w-32
                  rounded-full
                  bg-[var(--primary-light)]
                  transition-transform
                  duration-500
                  group-hover:scale-[2]
                "
                            />

                            {/* Icon */}
                            <div
                                className="
                  relative
                  mb-6
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[var(--primary-light)]
                  text-[var(--primary)]
                  transition-all
                  duration-300
                  group-hover:bg-[var(--primary)]
                  group-hover:text-white
                "
                            >
                                {card.icon}
                            </div>

                            {/* Content */}
                            <div className="relative">
                                <h3 className="mb-3 text-2xl font-bold text-[var(--text-main)]">
                                    {card.title}
                                </h3>

                                <p className="mb-7 min-h-[48px] text-sm leading-7 text-[var(--text-muted)]">
                                    {card.description}
                                </p>

                                {/* Link */}
                                <Link
                                    href={card.href}
                                    className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-[var(--radius-md)]
                    bg-[var(--primary)]
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition-all
                    duration-300
                    hover:bg-[var(--primary-hover)]
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[var(--primary-focus)]
                  "
                                >
                                    اكتشف المزيد

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                                        />
                                    </svg>
                                </Link>
                            </div>

                            {/* Bottom accent */}
                            <div
                                className="
                  absolute
                  bottom-0
                  right-0
                  h-1
                  w-0
                  bg-[var(--primary)]
                  transition-all
                  duration-500
                  group-hover:w-full
                "
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}