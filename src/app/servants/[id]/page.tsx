import type { Metadata } from "next";
import ServantsDetailsPage from "@/components/servants/ServantsDetailsPage";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
    title: "تفاصيل الخادم",
    robots: {
        index: false,
        follow: false,
    },
};

type ServantsDetailsPageDynamicProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ServantsDetailsDynamicPage({
    params,
}: ServantsDetailsPageDynamicProps) {
    const { id } = await params;

    return (
        <>
            <Navbar />
            <ServantsDetailsPage servantId={id} />
        </>
    );
}