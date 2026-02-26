import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section
            id="top"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80')`,
                }}
            />

            {/* Dark overlay with neutral/green tint - NO BLUE */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-green-950/80" />

            {/* Subtle grid pattern */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-900/30 text-green-300 text-xs font-semibold mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {t("landing.hero.badge")}
                </div>

                {/* Title */}
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4">
                    {t("landing.hero.title")}
                </h1>


                {/* Subtitle */}
                <p className="text-base sm:text-lg text-white max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
                    {t("landing.hero.subtitle")}
                    <span className="text-white font-bold underline decoration-green-500/50 underline-offset-4">Entalpia Europe</span>.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/login"
                        className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-md bg-green-700 text-white text-base font-semibold hover:bg-green-600 transition-all shadow-lg shadow-green-900/40 hover:shadow-green-700/40"
                    >
                        {t("landing.hero.ctaClient")}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="#entalpia"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md border border-white/30 text-white text-base font-semibold hover:bg-white/10 hover:border-white/50 transition-all"
                    >
                        {t("landing.hero.ctaAbout")}
                    </a>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16 pt-12 border-t border-white/10">
                    {[
                        { value: "+25", label: t("landing.hero.stats.years") },
                        { value: "EU", label: t("landing.hero.stats.distr") },
                        { value: "ISO", label: t("landing.hero.stats.cert") },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-bold text-green-400">{stat.value}</div>
                            <div className="text-xs text-gray-400 mt-1 leading-tight">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}

        </section>
    );
}
