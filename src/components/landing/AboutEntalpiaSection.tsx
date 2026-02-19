import { Award, Globe2, Truck, ShieldCheck, Clock } from "lucide-react";

const pillars = [
    {
        icon: Clock,
        label: "+25 Años de experiencia",
        description:
            "Más de dos décadas distribuyendo cobre industrial a empresas del sector en toda Europa.",
    },
    {
        icon: Globe2,
        label: "Presencia internacional",
        description:
            "Red de distribución activa en España, Portugal, Francia e Italia con capacidad de entrega a toda la UE.",
    },
    {
        icon: ShieldCheck,
        label: "Certificaciones de calidad",
        description:
            "Toda nuestra gama cumple normativa EN/ISO aplicable. Trazabilidad completa por lote de producción.",
    },
    {
        icon: Truck,
        label: "Logística profesional",
        description:
            "Flota propia y red de transporte especializado en materiales metálicos para garantizar tiempos y condiciones.",
    },
    {
        icon: Award,
        label: "Proveedor de referencia",
        description:
            "Suministramos instaladores, industriales, fabricantes y grandes cuentas de forma recurrente y fiable.",
    },
];

export function AboutEntalpiaSection() {
    return (
        <section id="entalpia" className="py-24 bg-[#f5f6f7] text-gray-900 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Left: text block */}
                    <div>
                        <p className="text-green-700 text-xs font-semibold uppercase tracking-widest mb-3">
                            Sobre nosotros
                        </p>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                            Entalpia Europe
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            Somos un distribuidor industrial de referencia en el sector del cobre.
                            Desde hace más de 25 años suministramos a empresas instaladoras,
                            fabricantes e industrias de toda Europa con la máxima fiabilidad.
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            SHARY es nuestra plataforma digital: una herramienta construida para
                            nuestros clientes profesionales que necesitan agilidad en la consulta de
                            precios, disponibilidad de stock y generación de pedidos, sin renunciar
                            al trato personal que nos caracteriza.
                        </p>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            {[
                                { value: "+25", label: "Años activos" },
                                { value: "5", label: "Países UE" },
                                { value: "ISO", label: "Certificado" },
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
