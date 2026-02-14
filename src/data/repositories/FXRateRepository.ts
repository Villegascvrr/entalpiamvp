import type { FXRate } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

// ─────────────────────────────────────────────────────────────
// FX Rate Repository Interface
// Defines method for accessing and updating USD/EUR exchange rate.
// ─────────────────────────────────────────────────────────────

export interface FXRateRepository {
    getCurrentRate(session: ActorSession): Promise<FXRate>;
    updateRate(session: ActorSession, rate: number): Promise<FXRate>;
    getHistory(session: ActorSession): Promise<FXRate[]>;
}

// ─────────────────────────────────────────────────────────────
// Mock Implementation
// ─────────────────────────────────────────────────────────────

export class MockFXRateRepository implements FXRateRepository {
    // Single source of truth for the current rate
    private _currentRate: FXRate = {
        id: "fx-initial",
        rate: 0.92, // Default 1 USD = 0.92 EUR
        updated_at: new Date().toISOString(),
        updated_by: "system"
    };

    private _history: FXRate[] = [this._currentRate];

    async getCurrentRate(session: ActorSession): Promise<FXRate> {
        await this._delay(300);
        return { ...this._currentRate };
    }

    async updateRate(session: ActorSession, rate: number): Promise<FXRate> {
        await this._delay(500);

        if (session.role !== "admin") {
            throw new Error("Unauthorized: Only admins can update FX rate");
        }

        const newRate: FXRate = {
            id: `fx-${Date.now()}`,
            rate: rate,
            updated_at: new Date().toISOString(),
            updated_by: session.name
        };

        this._currentRate = newRate;
        this._history.unshift(newRate); // Add to history

        return newRate;
    }

    async getHistory(session: ActorSession): Promise<FXRate[]> {
        await this._delay(300);
        return [...this._history];
    }

    private _delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
