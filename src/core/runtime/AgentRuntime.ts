import { IAgentRuntime } from './IAgentRuntime';
import { State } from './State';
import { RiskSettings } from './types';
// Placeholder imports for demonstration
import { RiskEvaluator } from '../../services/risk/RiskEvaluator';
import { Logger } from '../../utils/Logger';
import { PriceData } from '../../services/market/PriceData';

/**
 * Implements the core runtime functionality for an agent.
 * Manages lifecycle, state, and action execution.
 */
export class AgentRuntime implements IAgentRuntime {
  private _state: State;
  private _isRunning: boolean = false;
  private _intervalId?: NodeJS.Timeout;
  private readonly logger: Logger;
  private readonly riskEvaluator: RiskEvaluator;

  constructor(
    agentId: number,
    initialConfig?: {
      walletAddress?: string;
      riskSettings?: RiskSettings;
    }
  ) {
    this._state = new State(agentId, initialConfig);
    this.logger = new Logger(`AgentRuntime-${agentId}`);
    this.riskEvaluator = new RiskEvaluator();
  }

  /**
   * Gets the current state of the agent
   */
  public get state(): State {
    return this._state;
  }

  /**
   * Starts the agent's execution cycle
   */
  public start(intervalMs: number = 60000): void {
    if (this._isRunning) {
      this.logger.warn('Agent already running');
      return;
    }

    this._isRunning = true;
    this.logger.info('Starting agent runtime');

    // Start periodic checks if interval is provided
    if (intervalMs > 0) {
      this._intervalId = setInterval(() => this.tick(), intervalMs);
    }
  }

  /**
   * Stops the agent's execution cycle
   */
  public stop(): void {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = undefined;
    }

    this.logger.info('Stopped agent runtime');
  }

  /**
   * Executes an action after performing risk checks
   */
  public async execute(action: any): Promise<void> {
    if (!this._isRunning) {
      throw new Error('Agent runtime not started');
    }

    try {
      // Perform risk evaluation before executing action
      const riskAssessment = await this.riskEvaluator.evaluate(
        action,
        this._state.riskSettings
      );

      if (!riskAssessment.isAcceptable) {
        throw new Error(`Risk check failed: ${riskAssessment.reason}`);
      }

      // Execute the action
      await action.run(this._state);

      // Update state and log success
      this._state.lastUpdated = Date.now();
      this.logger.info(`Successfully executed action: ${action.type}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Action execution failed: ${error.message}`);
      } else {
        this.logger.error('Action execution failed with unknown error');
      }
      throw error;
    }
  }

  /**
   * Periodic check function that runs on the specified interval
   */
  private async tick(): Promise<void> {
    try {
      // Example: Check if any positions need rebalancing
      const currentPrices = await PriceData.getCurrentPrices();
      
      for (const position of this._state.positions) {
        const currentPrice = currentPrices[position.asset];
        // Calculate price change using latest entry price from entries array
        const latestEntry = position.entries[position.entries.length - 1];
        const priceChange = (currentPrice - latestEntry.price) / latestEntry.price;
        // Check against configured stop loss and take profit levels
        const { stopLossPercentage, takeProfitPercentage, trailingStopBps } = this._state.riskSettings ?? {};
        
        if (stopLossPercentage && priceChange <= -stopLossPercentage) {
          this.logger.info(`Stop loss triggered for position ${position.id} at ${priceChange.toFixed(2)}%`);
          // Create and execute a close position action
          // const closeAction = new ClosePositionAction(position.id);
          // await this.execute(closeAction);
        } else if (takeProfitPercentage && priceChange >= takeProfitPercentage) {
          this.logger.info(`Take profit triggered for position ${position.id} at ${priceChange.toFixed(2)}%`);
          // const closeAction = new ClosePositionAction(position.id);
          // await this.execute(closeAction);
        } else if (trailingStopBps) {
          // Check if price has dropped more than the trailing stop from its highest point
          const highestPrice = Math.max(...position.entries.map(entry => entry.price));
          const trailingStopPercent = trailingStopBps / 10000; // Convert basis points to percentage
          const priceChangeFromHigh = (currentPrice - highestPrice) / highestPrice;
          
          if (priceChangeFromHigh <= -trailingStopPercent) {
            this.logger.info(`Trailing stop triggered for position ${position.id} at ${priceChangeFromHigh.toFixed(2)}%`);
            // const closeAction = new ClosePositionAction(position.id);
            // await this.execute(closeAction);
          }
        }
      }

      // Example: Check if new opportunities exist based on persona
      if (this._state.personaContext?.tradingStyle === 'momentum') {
        // Check for momentum signals
        // const signals = await MomentumAnalyzer.analyze(currentPrices);
        // if (signals.length > 0) {
        //   const buyAction = new BuyAction(signals[0].asset);
        //   await this.execute(buyAction);
        // }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Tick execution failed: ${errorMessage}`);
    }
  }
}