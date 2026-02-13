import type { LMERepository } from "./LMERepository";
import type { LMEPrice } from "@/data/types";
import type { ActorSession } from "@/contexts/ActorContext";

// Initial mock data
const MOCK_LME_HISTORY: LMEPrice[] = [
    { id: "mock-1", tenant_id: "demo", price: 8450.50, date: new Date().toISOString().split('T')[0], source: "manual" },
    { id: "mock-2", tenant_id: "demo", price: 8432.20, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], source: "manual" },
    { id: "mock-3", tenant_id: "demo", price: 8410.00, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], source: "manual" },
];

export class MockLMERepository implements LMERepository {
    private history: LMEPrice[] = [...MOCK_LME_HISTORY];

    async getLatestPrice(session: ActorSession): Promise<LMEPrice | null> {
        await new Promise(r => setTimeout(r, 400));
        return this.history[0] || null;
    }

    async getPriceByDate(session: ActorSession, date: string): Promise<LMEPrice | null> {
        await new Promise(r => setTimeout(r, 200));
        return this.history.find(p => p.date === date) || null;
    }

    async setManualPrice(session: ActorSession, price: number): Promise<LMEPrice> {
        await new Promise(r => setTimeout(r, 600));
        const today = new Date().toISOString().split('T')[0];

        // Remove existing entry for today if any
        this.history = this.history.filter(p => p.date !== today);

        const newEntry: LMEPrice = {
            id: `mock-${Date.now()}`,
            tenant_id: session.tenantId || "demo",
            price: price,
            date: today,
            source: 'manual',
            created_by: session.actorId
        };

        this.history.unshift(newEntry);
        // Sort by date desc
        this.history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return newEntry;
    }

    async getHistory(session: ActorSession, limit: number = 7): Promise<LMEPrice[]> {
        await new Promise(r => setTimeout(r, 400));
        return this.history.slice(0, limit);
    }
}
