import { LlamaStackClient } from "llama-stack-client";
import "dotenv/config";

interface LlamaConfig {
  baseURL: string;
  timeout: number;
}

export class LlamaService {
  private static instance: LlamaService;
  private readonly client: LlamaStackClient;

  private constructor(config: LlamaConfig) {
    this.client = new LlamaStackClient({
      baseURL: config.baseURL,
      timeout: config.timeout,
    });
  }

  public static getInstance(): LlamaService {
    if (!LlamaService.instance) {
      const config = LlamaService.validateConfig();
      LlamaService.instance = new LlamaService(config);
    }
    return LlamaService.instance;
  }

  private static validateConfig(): LlamaConfig {
    const baseURL = process.env.LLAMA_BASE_URL?.trim();
    if (!baseURL) {
      throw new Error("LLAMA_BASE_URL environment variable is required");
    }

    const timeout = Number(process.env.LLAMA_TIMEOUT) || 30000;
    if (isNaN(timeout) || timeout <= 0) {
      throw new Error("LLAMA_TIMEOUT must be a positive number");
    }

    return { baseURL, timeout };
  }

  public getClient(): LlamaStackClient {
    return this.client;
  }
}

export const llamaService = LlamaService.getInstance();
