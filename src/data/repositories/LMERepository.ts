import { ActorSession } from "@/contexts/ActorContext";
import { LMEPrice } from "../types";

export interface LMERepository {
  getLatestPrice(session: ActorSession): Promise<LMEPrice | null>;
  getPriceByDate(session: ActorSession, date: string): Promise<LMEPrice | null>;
  setManualPrice(session: ActorSession, price: number): Promise<LMEPrice>;
  getHistory(session: ActorSession, limit?: number): Promise<LMEPrice[]>;
}
