import type { Metadata } from "next";
import ServantsPage from "@/components/servants/ServantsPageComponent";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
    title: "الخدام",
    robots: {
        index: false,
        follow: false,
    },
};

const Page = () => {
    return (
        <div>
            <Navbar />
            <ServantsPage />
        </div>
    );
};

export default Page;