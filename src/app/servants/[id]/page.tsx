import ServantsDetailsPage from "@/components/servants/ServantsDetailsPage";
import Navbar from "@/components/shared/Navbar";

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