import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function LandingNav() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Mercado", href: "#mercado" },
        { label: "Catálogo", href: "#catalogo" },
        { label: "Cómo funciona", href: "#como-funciona" },
        { label: "Entalpia Europe", href: "#entalpia" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-18">
                    {/* Logo */}
                    <a href="#top" className="flex flex-col leading-none group">
                        <span
                            className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"
                                }`}
                        >
                            SHARY
                        </span>
                        <span
                            className={`text-[10px] font-medium tracking-widest uppercase transition-colors ${scrolled ? "text-green-700" : "text-green-300"
                                }`}
                        >
                            by Entalpia Europe
                        </span>
                    </a>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-green-600 ${scrolled ? "text-gray-600" : "text-white/80"
                                    }`}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                        {/* Contact Button */}
                        <a
                            href="#contacto"
                            className={`hidden sm:inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${scrolled
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-white hover:bg-white/10"
                                }`}
                        >
                            Contacto
                        </a>

                        <Link
                            to="/login"
                            className="hidden sm:inline-flex items-center px-5 py-2 rounded-md text-sm font-semibold bg-green-700 text-white hover:bg-green-800 transition-colors shadow-sm"
                        >
                            Acceso Clientes
                        </Link>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={`lg:hidden p-2 rounded-md transition-colors ${scrolled
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-white hover:bg-white/10"
                                }`}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <a
                            href="#contacto"
                            onClick={() => setMenuOpen(false)}
                            className="block py-2 text-sm font-medium text-gray-700 hover:text-green-700 transition-colors"
                        >
                            Contacto
                        </a>
                        <div className="pt-3 border-t border-gray-100 mt-2">
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block w-full text-center px-5 py-2.5 rounded-md text-sm font-semibold bg-green-700 text-white hover:bg-green-800 transition-colors"
                            >
                                Acceso Clientes
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
