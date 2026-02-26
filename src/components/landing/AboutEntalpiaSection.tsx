import { Award, Globe2, Truck, ShieldCheck, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AboutEntalpiaSection() {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === "es";

    const pillars = [
        {
            icon: Clock,
            label: isEs ? "+25 Años de experiencia" : "+25 Years of experience",
            description: isEs
                ? "Más de dos décadas distribuyendo cobre industrial a empresas del sector en toda Europa."
                : "More than two decades distributing industrial copper to companies in the sector across Europe.",
        },
        {
            icon: Globe2,
            label: isEs ? "Presencia internacional" : "International presence",
            description: isEs
                ? "Red de distribución activa en España, Portugal, Francia e Italia con capacidad de entrega a toda la UE."
                : "Active distribution network in Spain, Portugal, France, and Italy with delivery capacity throughout the EU.",
        },
        {
            icon: ShieldCheck,
            label: isEs ? "Certificaciones de calidad" : "Quality certifications",
            description: isEs
                ? "Toda nuestra gama cumple normativa EN/ISO aplicable. Trazabilidad completa por lote de producción."
                : "Our entire range complies with applicable EN/ISO regulations. Full traceability per production batch.",
        },
        {
            icon: Truck,
            label: isEs ? "Logística profesional" : "Professional logistics",
            description: isEs
                ? "Flota propia y red de transporte especializado en materiales metálicos para garantizar tiempos y condiciones."
                : "Own fleet and specialized transport network for metallic materials to guarantee times and conditions.",
        },
        {
            icon: Award,
            label: isEs ? "Proveedor de referencia" : "Reference supplier",
            description: isEs
                ? "Suministramos instaladores, industriales, fabricantes y grandes cuentas de forma recurrente y fiable."
                : "We supply installers, industrial users, manufacturers, and large accounts reliably and recurrently.",
        },
    ];

    return (
        <section id="entalpia" className="py-24 bg-[#f5f6f7] text-gray-900 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left: text block */}
                    <div>
                        <p className="text-green-700 text-xs font-semibold uppercase tracking-widest mb-3">
                            {t("landing.about.badge")}
                        </p>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                            {t("landing.about.title")}
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            {isEs
                                ? "Somos un distribuidor industrial de referencia en el sector del cobre. Desde hace más de 25 años suministramos a empresas instaladoras, fabricantes e industrias de toda Europa con la máxima fiabilidad."
                                : "We are a leading industrial distributor in the copper sector. For more than 25 years, we have supplied installation companies, manufacturers, and industries throughout Europe with maximum reliability."}
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            {isEs
                                ? "SHARY es nuestra plataforma digital: una herramienta construida para nuestros clientes profesionales que necesitan agilidad en la consulta de precios, disponibilidad de stock y generación de pedidos, sin renunciar al trato personal que nos caracteriza."
                                : "SHARY is our digital platform: a tool built for our professional clients who need agility in checking prices, stock availability, and placing orders, without giving up the personal touch that characterizes us."}
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            {[
                                { value: "+25", label: isEs ? "Años activos" : "Years active" },
                                { value: "5", label: isEs ? "Países UE" : "EU Countries" },
                                { value: "ISO", label: isEs ? "Certificado" : "Certified" },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="text-2xl font-bold text-green-700">{stat.value}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: pillars */}
                    <div className="space-y-4">
                        {pillars.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <div
                                    key={pillar.label}
                                    className="flex gap-4 p-4 rounded-lg bg-white border border-gray-200 hover:border-green-600 hover:shadow-md transition-all group"
                                >
                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                        <Icon size={18} className="text-green-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">{pillar.label}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed">{pillar.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
