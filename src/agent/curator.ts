//- Core strategy generation logic
// - Creates and manages the AI agent
// - Generates prompts based on market conditions

import { GeneratedStrategy } from "./types";
import { AGENT_CONFIG, STRATEGY_CONFIG, SAFETY_CONFIG } from "./config";
import { MarketData } from "../memory/types";
import { llamaService } from "../provider/llama";

export class Curator {
  constructor() {}

  async generateStrategy(
    assetType: keyof typeof STRATEGY_CONFIG,
    amount: bigint
  ): Promise<GeneratedStrategy> {
    const strategy = await this.createOptimalStrategy(assetType, amount);
    //TEST WITH REAL DATA LATER
    // await this.validateStrategy(strategy, assetType);

    return strategy;
  }

  private async createOptimalStrategy(
    assetType: keyof typeof STRATEGY_CONFIG,
    amount: bigint
  ): Promise<GeneratedStrategy> {
    const { client, agent, session } = await this.initializeAgent();

    const response = await client.agents.turns.create({
      agent_id: agent.agent_id,
      session_id: session.session_id,
      stream: true,
      messages: [
        {
          role: "user",
          content: `Thoroughly analyse the data for financial use and give me 1 strategy with 1 steps each i can invest for ${assetType.toUpperCase()}. json format only please and no other content`,
        },
      ],
    });

    const stream = response.toReadableStream();
    const reader = stream.getReader();
    return await this.processStream(reader);
  }

  private async initializeAgent() {
    const client = llamaService.getClient();
    const agent = await client.agents.create({
      // @ts-ignore
      agent_config: AGENT_CONFIG,
    });

    const session = await client.agents.sessions.create({
      agent_id: agent.agent_id,
      session_name: agent.agent_id,
    });

    return { client, agent, session };
  }

  private async processStream(
    reader: ReadableStreamDefaultReader
  ): Promise<any> {
    let fullText = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      if (!value) continue;

      const chunk = new TextDecoder().decode(value);
      try {
        const parsedChunk = JSON.parse(chunk);

        if (parsedChunk?.event?.payload?.text_delta)
          fullText += parsedChunk.event.payload.text_delta;

        if (parsedChunk?.event?.payload?.event_type === "turn_complete") {
          const turnData = parsedChunk.event.payload.turn;
          const modelResponse = turnData.steps.find(
            (step: { step_type: string }) => step.step_type === "inference"
          )?.model_response;

          if (modelResponse?.content)
            return JSON.parse(
              modelResponse.content.replace(/```\n?j?s?o?n?\n?/g, "")
            );
        }
      } catch (error) {
        console.error("Error processing chunk:", error);
        continue;
      }
    }
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
    // const stableSteps = strategy.steps.filter((s) =>
    //   STRATEGY_CONFIG.usdc.constraints.supportedStables.includes(s.assetOut)
    // );
    // const totalRatio = strategy.steps.reduce(
    //   (sum, s) => sum + Number(s.amountRatio),
    //   0
    // );
    // const stableRatio = stableSteps.reduce(
    //   (sum, s) => sum + Number(s.amountRatio),
    //   0
    // );
    // return stableRatio / totalRatio;
    return 0;
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
}
