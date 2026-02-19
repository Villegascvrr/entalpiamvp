import { TrendingUp, TrendingDown, Minus, RefreshCw, Newspaper, ArrowRight, ExternalLink } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

const MOCK_PRICE = 9_847.5;
const MOCK_CHANGE = +1.23;

const indicators = [
    { label: "LME Cobre 3M", value: "9.847,50 $/t", change: "+1.23%", trend: "up" },
    { label: "Volumen diario", value: "342.000 t", change: "+5.8%", trend: "up" },
    { label: "Inventarios LME", value: "87.450 t", change: "-3.2%", trend: "down" },
    { label: "USD/EUR", value: "0.9234", change: "−0.05%", trend: "neutral" },
];

const news = [
    {
        title: "La demanda de cobre en Europa aumenta ante la transición energética y el vehículo eléctrico",
        source: "CopperBulletin",
        time: "Hace 2 h",
        tag: "Mercado",
    },
    {
        title: "Nuevas restricciones de exportación en Chile impactan precio a futuro para 2026",
        source: "Metal Prices",
        time: "Hace 5 h",
        tag: "Economía",
    },
    {
        title: "Inversión en infraestructura eléctrica impulsa consumo industrial en el primer trimestre",
        source: "IndustrialReport",
        time: "Ayer",
        tag: "Industria",
    },
];

// Mock chart data - approx 1 month trend
const chartData = [
    { date: "1 Feb", price: 9200 },
    { date: "3 Feb", price: 9350 },
    { date: "5 Feb", price: 9280 },
    { date: "7 Feb", price: 9400 },
    { date: "9 Feb", price: 9380 },
    { date: "11 Feb", price: 9450 },
    { date: "13 Feb", price: 9600 },
    { date: "15 Feb", price: 9550 },
    { date: "17 Feb", price: 9680 },
    { date: "19 Feb", price: 9847 },
];

function TrendIcon({ trend }: { trend: string }) {
    if (trend === "up") return <TrendingUp size={14} className="text-green-600" />;
    if (trend === "down") return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
}

export function CopperMarketSection() {
    return (
        <>
            {/* ─────────────────────────────────────────────────────────────
          SECTION 1: Market Data (White Background)
         ───────────────────────────────────────────────────────────── */}
            <section id="mercado" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                        <div>
                            <p className="text-green-700 text-xs font-semibold uppercase tracking-widest mb-2">
                                Mercado
                            </p>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                Mercado del Cobre
                            </h2>
                            <p className="text-gray-500 mt-2 max-w-xl">
                                Referencia de precios y actividad sectorial. Los clientes SHARY
                                acceden a precios personalizados en tiempo real.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                            <RefreshCw size={12} />
                            <span>Datos orientativos (Mock) · Tiempo real solo clientes</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart Column */}
                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-gray-500 text-sm font-medium">LME Copper Cash</p>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-bold tabular-nums text-gray-900">
                                            {MOCK_PRICE.toLocaleString("es-ES", { minimumFractionDigits: 2 })} $/t
                                        </span>
                                        <span className="flex items-center gap-1 text-green-600 text-lg font-semibold px-2 py-0.5 rounded-md bg-green-50">
                                            <TrendingUp size={18} />
                                            +{MOCK_CHANGE}%
                                        </span>
                                    </div>
                                </div>
                                {/* Period toggles */}
                                <div className="flex p-1 bg-gray-100 rounded-lg">
                                    {["1D", "1M", "3M", "1A"].map((period) => (
                                        <button
                                            key={period}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === "1M"
                                                    ? "bg-white text-green-700 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#15803d" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                                            itemStyle={{ color: "#15803d", fontWeight: 600 }}
                                            formatter={(value: number) => [`$${value}`, "Precio"]}
                                        />
                                        <YAxis domain={["dataMin - 50", "dataMax + 50"]} hide />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#15803d"
                                            strokeWidth={2} // Thicker line
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Indicators Column */}
                        <div className="space-y-4">
                            {indicators.map((ind) => (
                                <div
                                    key={ind.label}
                                    className="bg-white border border-gray-100 rounded-lg p-5 hover:border-gray-300 transition-colors shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            {ind.label}
                                        </p>
                                        <TrendIcon trend={ind.trend} />
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-gray-900 font-bold text-xl tabular-nums">
                                            {ind.value}
                                        </p>
                                        <span
                                            className={`text-xs font-medium ${ind.trend === "up"
                                                    ? "text-green-600"
                                                    : ind.trend === "down"
                                                        ? "text-red-500"
                                                        : "text-gray-400"
                                                }`}
                                        >
                                            {ind.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
          SECTION 2: Sector News (Green Background)
         ───────────────────────────────────────────────────────────── */}
            <section className="py-20 bg-[#194f48]"> {/* Corporate Deep Green */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Newspaper className="text-green-300" size={20} />
                                <span className="text-green-300 text-xs font-bold uppercase tracking-widest">
                                    Actualidad
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-white">
                                Noticias del Sector
                            </h3>
                        </div>
                        <a href="#" className="text-sm font-medium text-green-200 hover:text-white flex items-center gap-1 transition-colors">
                            Ver todas las noticias <ArrowRight size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {news.map((item) => (
                            <article
                                key={item.title}
                                className="bg-white rounded-xl p-6 shadow-lg hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100">
                                        {item.tag}
                                    </span>
                                    <ExternalLink size={14} className="text-gray-300" />
                                </div>

                                <h4 className="text-gray-900 font-bold text-lg leading-snug mb-4 flex-1 line-clamp-3 hover:text-green-700 transition-colors cursor-pointer">
                                    {item.title}
                                </h4>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <span className="font-medium text-gray-700">{item.source}</span>
                                    <span>{item.time}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
