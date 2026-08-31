import type { Metadata } from "next";
import PriestsDetailsPage from "@/components/priests/PriestsDetailsPage";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
    title: "تفاصيل الأب الكاهن",
    robots: {
        index: false,
        follow: false,
    },
};

type PriestsDetailsPageDynamicProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PriestsDetailsDynamicPage({
    params,
}: PriestsDetailsPageDynamicProps) {
    const { id } = await params;

    return (
        <>
            <Navbar />
            <PriestsDetailsPage priestId={id} />
        </>
    );
}
