import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function LandingFooter() {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === "es";

    const footerLinks = [
        { label: t("landing.footer.legal"), href: "#" },
        { label: t("landing.footer.privacy"), href: "#" },
        { label: t("landing.footer.cookies"), href: "#" },
    ];

    return (
        <footer className="bg-zinc-950 border-t border-zinc-900 py-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Brand */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-white">SHARY</span>
                            <span className="text-xs text-green-500 font-medium tracking-widest uppercase">
                                by Entalpia Europe
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 max-w-xs">
                            {isEs
                                ? "Plataforma profesional B2B para la gestión de comercio de cobre industrial."
                                : "Professional B2B platform for industrial copper trade management."}
                        </p>
                    </div>

                    {/* Legal links */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {footerLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        to="/login"
                        className="inline-flex items-center px-5 py-2 rounded-md text-xs font-bold bg-green-700 text-white hover:bg-green-600 transition-colors shrink-0"
                    >
                        {t("landing.nav.clientAccess")}
                    </Link>
                </div>

                {/* Divider + copyright */}
                <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row sm:justify-between gap-2">
                    <p className="text-xs text-zinc-600">
                        © {new Date().getFullYear()} Entalpia Europe. {t("landing.footer.rights")}
                    </p>
                    <p className="text-xs text-zinc-700">
                        {isEs
                            ? "SHARY · Plataforma de gestión B2B del cobre"
                            : "SHARY · B2B Copper Management Platform"}
                    </p>
                </div>
            </div>
        </footer>
    );
}
