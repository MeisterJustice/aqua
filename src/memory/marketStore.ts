// MarketStore class
// Handles interaction with LlamaStack's memory system
// Stores and retrieves market data
// Manages the vector memory bank for historical data
// Provides functions for market data operations

import { MEMORY_CONFIG } from "../agent/config";
import { MarketData } from "./types";
import { llamaService } from "../provider/llama";

const client = llamaService.getClient();

export class MarketStore {
  constructor(private readonly config = MEMORY_CONFIG) {}

  async storeMarketData(data: MarketData[]): Promise<void> {
    try {
      await client.memory.insert({
        bank_id: this.config.bankId,
        documents: data.map((item) => ({
          content: JSON.stringify(item, (_, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
          document_id: `${item.timestamp}-${item.blockNumber}`,
          metadata: {
            timestamp: item.timestamp,
            blockNumber: item.blockNumber,
          },
        })),
      });
    } catch (error) {
      throw new Error(`Failed to store market data: ${error}`);
    }
  }

  async getLatestMarketData(): Promise<any> {
    try {
      return await client.memory.query({
        bank_id: this.config.bankId,
        query: "What are the current market conditions for all protocols?",
      });
    } catch (error) {
      throw new Error(`Failed to retrieve market data: ${error}`);
    }
  }

  async getHistoricalData(startTime: number, endTime: number): Promise<any> {
    try {
      return await client.memory.query({
        bank_id: this.config.bankId,
        query: `Show me historical market data from ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()} including protocol stats, token prices, and risk metrics`,
      });
    } catch (error) {
      throw new Error(`Failed to retrieve historical data: ${error}`);
    }
  }
}
