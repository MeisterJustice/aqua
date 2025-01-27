/**
 * Interface defining the core functionality of a Liquid agent runtime.
 * Handles agent lifecycle, state management, and action execution.
 */

export interface IAgentRuntime {
  /**
   * Starts the agent's execution cycle. If intervalMs is provided,
   * begins periodic checks at that interval.
   * @param intervalMs Optional interval in milliseconds for periodic execution
   */
  start(intervalMs?: number): void;

  /**
   * Stops the agent's execution cycle and cleans up resources.
   */
  stop(): void;

  /**
   * Executes a DeFi action while maintaining agent state.
   * @param action The action to execute (buy, sell, provide liquidity, invest in DeFi, etc.)
   * @returns Promise that resolves when the action is complete
   */
  execute(action: any): Promise<void>;

  /**
   * Current state of the agent.
   */
  readonly state: State;
}