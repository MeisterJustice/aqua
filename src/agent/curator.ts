//- Core strategy generation logic
// - Creates and manages the AI agent
// - Generates prompts based on market conditions

import { MarketStore } from "../memory/marketStore";
import { GeneratedStrategy, StrategyStep } from "./types";
import { AGENT_CONFIG, STRATEGY_CONFIG, SAFETY_CONFIG } from "./config";
import { STRATEGY_PROMPT } from "./prompts";
import { MarketData } from "../memory/types";
import { llamaService } from "../provider/llama";

export class Curator {
  constructor(
    private readonly marketStore: MarketStore
  ) {}

  async generateStrategy(
    assetType: keyof typeof STRATEGY_CONFIG,
    amount: bigint
  ): Promise<GeneratedStrategy> {
    // Get latest market data for analysis
    const marketData = await this.marketStore.getLatestMarketData();
    console.log({ marketData });
    if (!marketData) throw new Error("No market data available");

    // Generate optimal strategy using AI
    const strategy = await this.createOptimalStrategy(
      assetType,
      amount,
      marketData
    );

    // Validate strategy meets requirements
    await this.validateStrategy(strategy, assetType);

    return strategy;
  }

  private async createOptimalStrategy(
    assetType: keyof typeof STRATEGY_CONFIG,
    amount: bigint,
    marketData: MarketData
  ): Promise<GeneratedStrategy> {
    // Build context for AI prompt
    // const context = {
    //   assetType,
    //   amount: amount.toString(),
    //   marketData: this.prepareMarketContext(marketData),
    //   constraints: STRATEGY_CONFIG[assetType],
    // };
    const client = llamaService.getClient();
    const response = await client.agents.create({
      agent_config: {
        model: AGENT_CONFIG.model,
        max_infer_iters: 5,
        instructions: STRATEGY_PROMPT,
        enable_session_persistence: true,
      },
    });
    console.log({ response });
    ///double check
    return this.parseStrategyResponse(response.agent_id);
  }

  private prepareMarketContext(marketData: MarketData) {
    return {
      protocols: {
        moonwell: {
          markets: Object.entries(marketData.protocols.moonwell.markets).map(
            ([address, market]: [
              string,
              (typeof marketData.protocols.moonwell.markets)[string],
            ]) => ({
              address,
              supplyRate: market.supplyRate,
              borrowRate: market.borrowRate,
              totalSupply: market.totalSupply.toString(),
              totalBorrow: market.totalBorrow.toString(),
              liquidity: market.liquidity.toString(),
              collateralFactor: market.collateralFactor,
            })
          ),
        },
        morpho: {
          vaults: Object.entries(marketData.protocols.morpho.vaults).map(
            ([address, vault]: [
              string,
              (typeof marketData.protocols.morpho.vaults)[string],
            ]) => ({
              address,
              apy: vault.apy,
              tvl: vault.tvl.toString(),
              token: vault.token,
              performanceFee: vault.performanceFee,
              timelock: vault.timelock,
            })
          ),
        },
      },
      tokens: Object.entries(marketData.tokens).map(
        ([address, token]: [string, (typeof marketData.tokens)[string]]) => ({
          address,
          price: token.price,
          decimals: token.decimals,
          symbol: token.symbol,
          totalSupply: token.totalSupply.toString(),
        })
      ),
      metrics: Object.entries(marketData.riskMetrics).map(
        ([address, metrics]: [
          string,
          (typeof marketData.riskMetrics)[string],
        ]) => ({
          address,
          tvlUSD: metrics.tvlUSD,
          volume24hUSD: metrics.volume24hUSD,
          uniqueUsers24h: metrics.uniqueUsers24h,
          healthFactor: metrics.healthFactor,
          lastUpdate: metrics.lastUpdate,
        })
      ),
    };
  }

  private async validateStrategy(
    strategy: GeneratedStrategy,
    assetType: keyof typeof STRATEGY_CONFIG
  ): Promise<void> {
    const constraints = STRATEGY_CONFIG[assetType];
    const errors: string[] = [];

    // Check protocol count
    const uniqueProtocols = new Set(strategy.steps.map((s) => s.connector));
    if (uniqueProtocols.size > constraints.maxProtocols) {
      errors.push(`Too many protocols used: ${uniqueProtocols.size}`);
    }

    if (assetType === "usdc") {
      await this.validateUSDCStrategy(strategy, errors);
    } else {
      await this.validateWETHStrategy(strategy, errors);
    }

    await this.performSafetyChecks(strategy, errors);

    if (errors.length > 0) {
      throw new Error(`Strategy validation failed: ${errors.join(", ")}`);
    }
  }

  private async validateUSDCStrategy(
    strategy: GeneratedStrategy,
    errors: string[]
  ): Promise<void> {
    const constraints = STRATEGY_CONFIG.usdc.constraints;

    const lendingRatio = this.calculateLendingRatio(strategy);
    if (lendingRatio < constraints.minLendingRatio) {
      errors.push(`Insufficient lending ratio: ${lendingRatio}`);
    }

    const stableRatio = this.calculateStablecoinExposure(strategy);
    if (stableRatio < constraints.minStablecoinExposure) {
      errors.push(`Insufficient stablecoin exposure: ${stableRatio}`);
    }
  }

  private async validateWETHStrategy(
    strategy: GeneratedStrategy,
    errors: string[]
  ): Promise<void> {
    const constraints = STRATEGY_CONFIG.weth.constraints;

    const leverage = this.calculateLeverage(strategy);
    if (leverage > constraints.maxLeverage) {
      errors.push(`Excessive leverage: ${leverage}x`);
    }

    const lendingRatio = this.calculateLendingRatio(strategy);
    if (lendingRatio < constraints.minLendingRatio) {
      errors.push(`Insufficient lending ratio: ${lendingRatio}`);
    }
  }

  private async performSafetyChecks(
    strategy: GeneratedStrategy,
    errors: string[]
  ): Promise<void> {
    for (const step of strategy.steps) {
      const tvl = await this.getProtocolTVL(step.connector);
      if (tvl < SAFETY_CONFIG.minTVL) {
        errors.push(`Protocol TVL too low: ${step.connector}`);
      }
    }

    const gasEstimate = await this.estimateGasCosts(strategy);
    if (gasEstimate > SAFETY_CONFIG.maxGasEstimate) {
      errors.push(`Gas estimate too high: ${gasEstimate}`);
    }
  }

  private calculateLendingRatio(strategy: GeneratedStrategy): number {
    const lendingSteps = strategy.steps.filter((s) => s.actionType === 0);
    const totalRatio = strategy.steps.reduce(
      (sum, s) => sum + Number(s.amountRatio),
      0
    );
    const lendingRatio = lendingSteps.reduce(
      (sum, s) => sum + Number(s.amountRatio),
      0
    );
    return lendingRatio / totalRatio;
  }

  private calculateStablecoinExposure(strategy: GeneratedStrategy): number {
    const stableSteps = strategy.steps.filter((s) =>
      STRATEGY_CONFIG.usdc.constraints.supportedStables.includes(s.assetOut)
    );
    const totalRatio = strategy.steps.reduce(
      (sum, s) => sum + Number(s.amountRatio),
      0
    );
    const stableRatio = stableSteps.reduce(
      (sum, s) => sum + Number(s.amountRatio),
      0
    );
    return stableRatio / totalRatio;
  }

  private calculateLeverage(strategy: GeneratedStrategy): number {
    const borrowSteps = strategy.steps.filter((s) => s.actionType === 1);
    const totalBorrow = borrowSteps.reduce(
      (sum, s) => sum + Number(s.amountRatio),
      0
    );
    const totalSupply = strategy.steps.reduce(
      (sum, s) => sum + Number(s.amountRatio),
      0
    );
    return 1 + totalBorrow / totalSupply;
  }

  private async getProtocolTVL(address: string): Promise<bigint> {
    return BigInt(0);
  }

  private async estimateGasCosts(strategy: GeneratedStrategy): Promise<number> {
    return 0;
  }

  private parseStrategyResponse(response: string): GeneratedStrategy {
    try {
      const parsed = JSON.parse(response);

      if (!parsed.name || !parsed.description || !Array.isArray(parsed.steps)) {
        throw new Error("Invalid strategy response format");
      }

      const steps = parsed.steps.map((step: any): StrategyStep => {
        if (
          !step.protocol ||
          !step.actionType ||
          !Array.isArray(step.assetsIn) ||
          !step.assetsIn ||
          !step.assetOut ||
          !step.amountRatio ||
          !step.data
        ) {
          throw new Error("Invalid strategy step format");
        }

        return {
          connector: step.protocol as `0x${string}`,
          actionType: step.actionType,
          assetsIn: step.assetsIn as `0x${string}`[],
          assetOut: step.assetOut as `0x${string}`,
          amountRatio: BigInt(step.amountRatio),
          data: step.data as `0x${string}`,
        };
      });

      return {
        name: parsed.name,
        description: parsed.description,
        steps,
        minDeposit: BigInt(parsed.minDeposit),
      };
    } catch (error) {
      throw new Error(`Failed to parse strategy response: ${error}`);
    }
  }
}
