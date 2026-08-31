import type { Metadata } from "next";
import PriestsPage from "@/components/priests/PriestsPageComponent";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
    title: "الآباء الكهنة",
    robots: {
        index: false,
        follow: false,
    },
};

const Page = () => {
    return (
        <div>
            <Navbar />
            <PriestsPage />
        </div>
    );
};

export default Page;

