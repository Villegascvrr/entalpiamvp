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
const APP_MODE: AppMode = "development";

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
