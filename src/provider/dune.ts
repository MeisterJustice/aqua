import { QueryParameter, DuneClient } from "@duneanalytics/client-sdk";
import "dotenv/config";

export class DuneService {
  private static instance: DuneService;
  private readonly client: DuneClient;

  private constructor() {
    const apiKey = process.env.DUNE_API_KEY?.trim();
    if (!apiKey) throw new Error("DUNE_API_KEY is required");
    this.client = new DuneClient(apiKey);
  }

  public static getInstance(): DuneService {
    if (!this.instance) {
      this.instance = new DuneService();
    }
    return this.instance;
  }

  async runQuery<T = any>(
    queryId: number,
    parameters: QueryParameter[] = [],
  ): Promise<T[]> {
    try {
      const result = await this.client.runQuery({ queryId, parameters });
      return (result.result?.rows || []) as T[];
    } catch (error) {
      throw new Error(`Dune query failed: ${error}`);
    }
  }

  getClient(): DuneClient {
    return this.client;
  }
}

export const duneService = DuneService.getInstance();
