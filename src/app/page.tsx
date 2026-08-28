import HeroSlider from "@/components/home/HeroSec";
import QuickLinks from "@/components/home/QuickLinks";
import Navbar from "@/components/shared/Navbar";

export default function Home() {
  return (
    <section>
      <Navbar />
      <HeroSlider />
      <QuickLinks />
    </section>
  );
}
