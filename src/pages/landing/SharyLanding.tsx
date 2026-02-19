import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { CopperMarketSection } from "@/components/landing/CopperMarketSection";
import { ProductCatalogSection } from "@/components/landing/ProductCatalogSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AboutEntalpiaSection } from "@/components/landing/AboutEntalpiaSection";
import { ClientAccessSection } from "@/components/landing/ClientAccessSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function SharyLanding() {
    return (
        <div className="min-h-screen font-sans antialiased">
            <LandingNav />
            <main>
                <HeroSection />
                <CopperMarketSection />
                <ProductCatalogSection />
                <HowItWorksSection />
                <AboutEntalpiaSection />
                <ClientAccessSection />
                <ContactSection />
            </main>
            <LandingFooter />
        </div>
    );
}
