import { logger } from "./logger";
import { MarketStore } from "./memory/marketStore";
import { Runner } from "./runner";

export class AppInitializer {
  private static isRunning = false;

  static async start() {
    if (this.isRunning) {
      return;
    }

    try {
      const marketStore = new MarketStore();
      const runner = new Runner(marketStore);

      await runner.start();
      this.isRunning = true;
      logger.info("Services started successfully");
    } catch (error) {
      logger.error("Failed to start services:", error);
      throw error;
    }
  }

  static async stop() {
    if (!this.isRunning) {
      return;
    }

    try {
      this.isRunning = false;
      logger.info("Services stopped successfully");
    } catch (error) {
      logger.error("Failed to stop services:", error);
      throw error;
    }
  }
}
