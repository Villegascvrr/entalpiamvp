import { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle } from "lucide-react";

export function ContactSection() {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({
        name: "",
        company: "",
        email: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // No backend — UI only
        setSent(true);
    };

    return (
        <section id="contacto" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-green-700 text-xs font-semibold uppercase tracking-widest mb-3">
                        Contacto
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        ¿Hablamos?
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Si quieres más información sobre SHARY o sobre nuestros servicios de
                        distribución, contacta con nuestro equipo comercial.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center gap-4">
                                <CheckCircle size={52} className="text-green-600" />
                                <h3 className="text-xl font-bold text-gray-900">
                                    Mensaje enviado
                                </h3>
                                <p className="text-gray-500 max-w-xs">
                                    Nos pondremos en contacto contigo en un plazo de 24–48 horas
                                    hábiles.
                                </p>
                                <button
                                    onClick={() => {
                                        setSent(false);
                                        setForm({ name: "", company: "", email: "", message: "" });
                                    }}
                                    className="text-sm text-green-700 font-semibold hover:underline mt-2"
                                >
                                    Enviar otro mensaje
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Tu nombre"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Empresa
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nombre de tu empresa"
                                            value={form.company}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="correo@empresa.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                        Mensaje
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="¿En qué podemos ayudarte?"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-green-700 text-white text-sm font-bold hover:bg-green-800 transition-colors shadow-sm"
                                >
                                    <Send size={15} />
                                    Enviar mensaje
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Corporate info */}
                    <div className="flex flex-col gap-8 justify-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Entalpia Europe
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                                Distribuidor industrial de cobre con presencia en toda Europa.
                                Nuestro equipo comercial está disponible para atender consultas de
                                grandes volúmenes, condiciones especiales y altas de nuevos clientes.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: MapPin,
                                    label: "Dirección",
                                    value: "Polígono Industrial Can Rosés\nBarcelona, España",
                                },
                                {
                                    icon: Phone,
                                    label: "Teléfono",
                                    value: "+34 93 XXX XX XX",
                                },
                                {
                                    icon: Mail,
                                    label: "Email comercial",
                                    value: "comercial@entalpia.eu",
                                },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex gap-4">
                                        <div className="shrink-0 w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mt-0.5">
                                            <Icon size={16} className="text-green-700" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                                                {item.label}
                                            </p>
                                            <p className="text-sm text-gray-800 whitespace-pre-line">{item.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Horario de atención comercial:{" "}
                                <span className="text-gray-700 font-medium">
                                    Lunes a Viernes, 8:00–18:00 h (CET)
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
