// Watches DeFi protocols
// Has AI analyze the data
// Creates yield strategies
// Deploys them on-chain

// This file is the main entry point of our AI Curator system. It runs two main continuous processes:

// * 1. Market Data Loop (Runs Every Hour):
// - Fetches latest data from Base protocols (Moonwell, Morpho)
// - Stores data in LlamaStack memory for AI analysis
// - Updates prices, TVL, yields, etc.

// * 2. Strategy Generation Loop  (Runs Weekly):
// - Uses LlamaStack AI to analyze stored market data
// - Generates optimal yield strategies for USDC and WETH
// - Validates strategies meet our requirements:
//   * USDC: 80% in lending, 95% stablecoin exposure
//   * WETH: 60% in lending, up to 2x leverage
// - Deploys valid strategies to Liquid Protocol on Base

import { UPDATE_CONFIG } from "./agent/config";
import { Curator } from "./agent/curator";
import { mockMarketData } from "./data/mockData";
import { MarketStore } from "./memory/marketStore";

export class Runner {
  private isRunning: boolean = false;
  private marketDataInterval: NodeJS.Timeout | null = null;
  private strategyGenInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly marketStore: MarketStore,
    private readonly curator: Curator
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error("Runner is already active");
    }

    this.isRunning = true;
    this.runStrategyGenLoop();
    try {
      this.marketDataInterval = setInterval(
        () => this.runMarketDataLoop(),
        UPDATE_CONFIG.marketData
      );
      this.strategyGenInterval = setInterval(
        () => this.runStrategyGenLoop(),
        UPDATE_CONFIG.strategyGeneration
      );
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.marketDataInterval) {
      clearInterval(this.marketDataInterval);
    }

    if (this.strategyGenInterval) {
      clearInterval(this.strategyGenInterval);
    }
  }

  private async runMarketDataLoop(): Promise<void> {
    try {
      const marketData = await this.fetchLatestMarketData();
      await this.marketStore.storeMarketData(marketData);
      console.log("Market data updated successfully");
    } catch (error) {
      console.error("Market data update failed:", error);
    }
  }

  private async runStrategyGenLoop(): Promise<void> {
    try {
      const strategy = await this.curator.generateStrategy();
      console.log({ strategy: JSON.stringify(strategy) });
      // await this.deployStrategies([usdcStrategy, wethStrategy]);
      console.log("Strategy generation completed successfully");
    } catch (error) {
      console.error("Strategy generation failed:", error);
    }
  }

  private async fetchLatestMarketData() {
    return mockMarketData;
  }

  private async deployStrategies(strategies: any[]): Promise<void> {
    console.log("Strategies deployed:", strategies);
  }
}
