import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
    const { i18n } = useTranslation();
    const currentLang = i18n.language;

    const toggle = (lang: "en" | "es") => {
        if (lang !== currentLang) {
            i18n.changeLanguage(lang);
        }
    };

    return (
        <div
            className="flex items-center rounded-full border border-border bg-muted/50 p-1 text-xs font-semibold select-none shadow-inner"
            title="Switch language"
        >
            <button
                onClick={() => toggle("en")}
                className={cn(
                    "px-3 py-1 rounded-full transition-all duration-200",
                    currentLang === "en"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                EN
            </button>
            <button
                onClick={() => toggle("es")}
                className={cn(
                    "px-3 py-1 rounded-full transition-all duration-200",
                    currentLang === "es"
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                ES
            </button>
        </div>
    );
}
