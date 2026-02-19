import { UserCheck, Tag, Package } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: UserCheck,
        title: "Accede con tu cuenta profesional",
        description:
            "Accede con las credenciales de tu empresa. Cada cuenta está vinculada a tu perfil de cliente y condiciones negociadas con Entalpia Europe.",
    },
    {
        number: "02",
        icon: Tag,
        title: "Consulta precios personalizados",
        description:
            "Visualiza el catálogo completo con tus precios específicos, calculados en tiempo real sobre el LME según tu tarifa de cliente.",
    },
    {
        number: "03",
        icon: Package,
        title: "Realiza pedidos y gestiona entregas",
        description:
            "Genera pedidos directamente desde la plataforma, sigue el estado de preparación y coordina la logística de entrega sin intermediarios.",
    },
];

export function HowItWorksSection() {
    return (
        <section id="como-funciona" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-green-700 text-xs font-semibold uppercase tracking-widest mb-3">
                        Proceso
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        Cómo funciona SHARY
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Una plataforma diseñada para profesionales del sector. Sin
                        complicaciones, sin márgenes ocultos.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
                    {/* Connector line (desktop) */}
                    <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-green-200 via-green-400 to-green-200" />

                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className="relative flex flex-col items-center text-center group">
                                {/* Step bubble */}
                                <div className="relative z-10 w-16 h-16 rounded-full bg-green-700 flex items-center justify-center mb-6 shadow-lg shadow-green-200 group-hover:bg-green-800 transition-colors">
                                    <Icon size={26} className="text-white" />
                                </div>

                                {/* Step number */}
                                <span className="text-xs font-mono font-bold text-green-600 tracking-widest mb-2">
                                    PASO {step.number}
                                </span>

                                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
