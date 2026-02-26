import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ClientAccessSection() {
    const { t } = useTranslation();

    return (
        <section className="py-20 bg-[#194f48]">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 border-2 border-green-500 mb-8">
                    <Shield size={26} className="text-white" />
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    {t("landing.clientAccess.title")}
                </h2>
                <p className="text-green-100 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                    {t("landing.clientAccess.desc")}
                </p>

                {/* CTA */}
                <Link
                    to="/login"
                    className="group inline-flex items-center gap-3 px-10 py-4 rounded-md bg-white text-green-800 text-base font-bold hover:bg-green-50 transition-all shadow-xl shadow-green-900/30"
                >
                    {t("landing.clientAccess.login")}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-green-300 text-sm mt-6">
                    {t("landing.clientAccess.registerTitle")} {t("landing.clientAccess.registerDesc")}
                </p>
            </div>
        </section>
    );
}
