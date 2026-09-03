import type { Metadata } from "next";
import FamilyDetailsPage from "@/components/families/FamilyDetailsPage";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
    title: "تفاصيل العائلة",
    robots: {
        index: false,
        follow: false,
    },
};

type FamilyDetailsPageDynamicProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function FamilyDetailsDynamicPage({
    params,
}: FamilyDetailsPageDynamicProps) {
    const { id } = await params;

    return (
        <div className="w-full overflow-x-hidden">
            <Navbar />
            <main
                dir="rtl"
                className="min-h-screen bg-[var(--bg-page)] px-2 py-8 sm:px-6 lg:px-8"
            >
                <div className="mx-auto max-w-6xl">
                    <div
                        className=" rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--card-bg)] pt-3 px-1 md:p-8 shadow-[var(--shadow-card)]"
                    >
                        <h1 className="text-3xl text-center md:text-start font-bold text-[var(--text-main)]">
                            تفاصيل العيلة
                        </h1>

                        <FamilyDetailsPage familyId={id} />
                    </div>
                </div>
            </main>
        </div>
    );
}
