import type { Metadata } from "next";
import FamiliesPageComponent from "@/components/families/FamiliesPageComponent";
import Navbar from "@/components/shared/Navbar";

export const metadata: Metadata = {
    title: "العائلات",
    robots: {
        index: false,
        follow: false,
    },
};

const FamiliesPage = () => {
    return (
        <>
            <Navbar />
            <FamiliesPageComponent />
        </>
    );
};

export default FamiliesPage;