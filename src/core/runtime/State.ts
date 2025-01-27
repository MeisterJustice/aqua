import { RiskSettings, Position, PersonaContext } from "./types";

/**
 * Maintains the runtime state of a Liquid agent
 */
export class State {
  public readonly agentId: number;
  public walletAddress?: string;
  public riskSettings?: RiskSettings;
  public positions: Position[] = [];
  public personaContext?: PersonaContext;
  public lastUpdated: number;
  private balances: Map<string, number> = new Map();

  constructor(agentId: number, config?: {
    walletAddress?: string;
    riskSettings?: RiskSettings;
    personaContext?: PersonaContext;
  }) {
    this.agentId = agentId;
    this.walletAddress = config?.walletAddress;
    this.riskSettings = config?.riskSettings;
    this.personaContext = config?.personaContext;
    this.lastUpdated = Date.now();
  }

  /**
   * Updates the balance for a specific asset
   */
  public updateBalance(asset: string, amount: number): void {
    this.balances.set(asset, amount);
    this.lastUpdated = Date.now();
  }

  /**
   * Gets the current balance for an asset
   */
  public getBalance(asset: string): number {
    return this.balances.get(asset) || 0;
  }

  /**
   * Adds a new position to the state
   */
  public addPosition(position: Position): void {
    this.positions.push(position);
    this.lastUpdated = Date.now();
  }

  /**
   * Removes a position by ID
   */
  public removePosition(positionId: string): void {
    this.positions = this.positions.filter(p => p.id !== positionId);
    this.lastUpdated = Date.now();
  }
}
