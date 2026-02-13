// ─────────────────────────────────────────────────────────────
// App Mode Configuration
// Controls which data provider is used across the application.
// When backend is ready, switch to "production".
// ─────────────────────────────────────────────────────────────

export type AppMode = "demo" | "development" | "production";

export interface AppConfig {
    mode: AppMode;
    apiBaseUrl: string;
    enableDevTools: boolean;
}

/** Current application mode — change this to switch data sources */
// const APP_MODE: AppMode = "development"; // OLD STATIC

const STORAGE_KEY = "dev_data_mode";

function getAppMode(): AppMode {
    if (typeof window === 'undefined') return "development";

    // Read from local storage (Dev Tool)
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "mock") return "demo";
    if (stored === "supabase-demo") return "development";
    if (stored === "supabase-real-dev") return "production";

    // Default fallback
    return "demo";
}

const APP_MODE: AppMode = getAppMode();

const configs: Record<AppMode, AppConfig> = {
    demo: {
        mode: "demo",
        apiBaseUrl: "",
        enableDevTools: true,
    },
    development: {
        mode: "development",
        apiBaseUrl: "https://syqhaewpxflmpmtmjspa.supabase.co",
        enableDevTools: true,
    },
    production: {
        mode: "production",
        apiBaseUrl: "https://syqhaewpxflmpmtmjspa.supabase.co",
        enableDevTools: false,
    },
};

export const appConfig: AppConfig = configs[APP_MODE];

export function isDemoMode(): boolean {
    return appConfig.mode === "demo";
}

export function isDevMode(): boolean {
    return appConfig.mode === "development";
}

export function isProdMode(): boolean {
    return appConfig.mode === "production";
}
