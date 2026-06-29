import {
  FeaturesGrid,
  FooterCTA,
  Hero,
  PlacesSection,
  VendorSection,
} from "./components/marketing-home";

export default function Home() {
  return (
    <div className="bg-white">
      <Hero />
      <PlacesSection />
      <FeaturesGrid />
      <VendorSection />
      <FooterCTA />
    </div>
  );
}
