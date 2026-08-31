import PriestsDetailsPage from "@/components/priests/PriestsDetailsPage";
import Navbar from "@/components/shared/Navbar";

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
