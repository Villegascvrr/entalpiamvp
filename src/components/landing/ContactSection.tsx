import { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ContactSection() {
    const { t, i18n } = useTranslation();
    const isEs = i18n.language === "es";

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
                        {t("landing.contact.badge")}
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                        {t("landing.contact.title")}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {t("landing.contact.desc")}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sent ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center gap-4">
                                <CheckCircle size={52} className="text-green-600" />
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isEs ? "Mensaje enviado" : "Message sent"}
                                </h3>
                                <p className="text-gray-500 max-w-xs">
                                    {isEs
                                        ? "Nos pondremos en contacto contigo en un plazo de 24–48 horas hábiles."
                                        : "We will contact you within 24-48 business hours."}
                                </p>
                                <button
                                    onClick={() => {
                                        setSent(false);
                                        setForm({ name: "", company: "", email: "", message: "" });
                                    }}
                                    className="text-sm text-green-700 font-semibold hover:underline mt-2"
                                >
                                    {isEs ? "Enviar otro mensaje" : "Send another message"}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            {t("landing.contact.form.name")}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={isEs ? "Tu nombre" : "Your name"}
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            {t("landing.contact.form.company")}
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={isEs ? "Nombre de tu empresa" : "Your company name"}
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
                                        placeholder={isEs ? "correo@empresa.com" : "email@company.com"}
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                        {t("landing.contact.form.message")}
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder={isEs ? "¿En qué podemos ayudarte?" : "How can we help you?"}
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
                                    {t("landing.contact.form.send")}
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
                                {isEs
                                    ? "Distribuidor industrial de cobre con presencia en toda Europa. Nuestro equipo comercial está disponible para atender consultas de grandes volúmenes, condiciones especiales y altas de nuevos clientes."
                                    : "Industrial copper supplier with presence throughout Europe. Our commercial team is available to answer inquiries about large volumes, special conditions, and new client registrations."}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: MapPin,
                                    label: isEs ? "Dirección" : "Address",
                                    value: "Polígono Industrial Can Rosés\nBarcelona, España",
                                },
                                {
                                    icon: Phone,
                                    label: isEs ? "Teléfono" : "Phone",
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
                                {isEs ? "Horario de atención comercial:" : "Business hours:"}{" "}
                                <span className="text-gray-700 font-medium">
                                    {isEs ? "Lunes a Viernes, 8:00–18:00 h (CET)" : "Monday to Friday, 8:00–18:00 (CET)"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
