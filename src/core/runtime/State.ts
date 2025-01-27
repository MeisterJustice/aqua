/**
 * Represents possible risk levels for agent operations
 */
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Collateral ratio requirements for lending protocols
 */
export interface CollateralRequirements {
  minCollateralRatio: number;     // e.g., 150% for lending
  targetCollateralRatio: number;  // e.g., 200% for safe margin
  maxLeverage: number;            // e.g., 2x, 3x, etc.
}

/**
 * Slippage and price impact settings
 */
export interface SlippageSettings {
  maxSlippageBps: number;        // e.g., 100 = 1% maximum slippage
  maxPriceImpactBps: number;     // e.g., 200 = 2% maximum price impact
  minLiquidityUsd: number;       // Minimum pool liquidity required
}

/**
 * Protocol-specific risk parameters
 */
export interface ProtocolRiskParams {
  maxTvlShare: number;           // Maximum % of protocol's TVL to deploy
  minProtocolAge: number;        // Minimum time protocol has been live (in days)
  requireAudit: boolean;         // Whether to require formal audits
  maxUtilizationRate: number;    // Maximum pool utilization rate (e.g., 0.8 = 80%)
  whitelistedProtocols?: string[]; // List of approved protocols
}


/**
 * Risk settings configuration for an agent
 */
export interface RiskSettings {
  // General risk parameters
  riskLevel: RiskLevel;
  maxDrawdownBps: number;        // Maximum drawdown in basis points
  maxPortfolioShare: number;     // Maximum % of portfolio in single position
  
  // Position management
  maxPositionSize: number;       // Maximum size of any single position
  minPositionSize: number;       // Minimum position size to avoid dust
  maxPositionsCount: number;     // Maximum number of concurrent positions
  
  // Stop loss and take profit
  stopLossPercentage: number;    // Stop loss level
  takeProfitPercentage: number;  // Take profit level
  trailingStopBps?: number;      // Optional trailing stop in basis points
  
  // Time-based constraints
  maxPositionDuration: number;   // Maximum time to hold position (in seconds)
  minTimeBetweenTrades: number;  // Minimum time between trades (in seconds)
  tradingHours?: {              // Optional trading hours restrictions
    start: number;              // Hour of day to start (0-23)
    end: number;               // Hour of day to end (0-23)
  };

  // Token-specific requirements
  minMarketCap?: number;         // Minimum market capitalization in USD
  maxMarketCap?: number;         // Maximum market capitalization in USD
  minVolume24h?: number;         // Minimum 24h trading volume in USD
  minLiquidityUsd?: number;      // Minimum liquidity in USD
  minTokenHolders?: number;      // Minimum number of token holders
  
  // Protocol interaction settings
  collateral: CollateralRequirements;
  slippage: SlippageSettings;
  protocol: ProtocolRiskParams;
  
  // Emergency controls
  emergencyShutdownThresholdBps: number;  // Auto-shutdown if losses exceed this
  maxEmergencyExitSlippageBps: number;    // Max slippage during emergency exit
}

/**
 * Type of position
 */
export enum PositionType {
  SPOT = 'SPOT',                 // Regular token holding
  LENDING = 'LENDING',           // Lending position
  BORROWING = 'BORROWING',       // Borrowing position
  LIQUIDITY = 'LIQUIDITY',       // Liquidity provision
  STAKING = 'STAKING',          // Staking position
  FARMING = 'FARMING'           // Yield farming position
}

/**
 * Fee information for a position
 */
export interface PositionFees {
  gasFees: number;              // Total gas fees paid
  tradingFees: number;          // Trading/swap fees
  borrowingFees?: number;       // For borrowing positions
  liquidityFees?: number;       // For LP positions
  otherFees: number;           // Any other fees
}

/**
 * Performance metrics for a position
 */
export interface PositionMetrics {
  unrealizedPnL: number;        // Current unrealized profit/loss
  realizedPnL: number;          // Realized profit/loss from partial exits
  totalPnL: number;             // Total profit/loss (realized + unrealized)
  pnlPercentage: number;        // Percentage return
  averageEntryPrice: number;    // Average entry price (for multiple entries)
  averageExitPrice?: number;    // Average exit price (for partial exits)
  highestPrice: number;         // Highest price since entry
  lowestPrice: number;          // Lowest price since entry
  currentPrice: number;         // Latest price
  maxDrawdown: number;          // Maximum drawdown experienced
}

/**
 * Additional metrics for DeFi positions
 */
export interface DeFiMetrics {
  apy?: number;                 // Current APY for lending/farming
  apr?: number;                 // Current APR
  rewardTokens?: {             // For positions earning rewards
    token: string;
    amount: number;
    value: number;
  }[];
  impermanentLoss?: number;    // For LP positions
  collateralRatio?: number;    // For lending/borrowing
  utilizationRate?: number;    // For lending/borrowing
  liquidationPrice?: number;   // For leveraged positions
}

/**
 * Represents a trading or DeFi position
 */
export interface Position {
  // Basic information
  id: string;
  type: PositionType;
  asset: string;
  protocol?: string;           // DeFi protocol name if applicable
  
  // Size and value
  amount: number;              // Position size in token amount
  amountUsd: number;          // Position size in USD
  leverage?: number;          // If leveraged position
  
  // Timing
  entryTimestamp: number;     // When position was opened
  lastUpdateTimestamp: number; // Last position update
  exitTimestamp?: number;     // When position was closed (if closed)
  duration?: number;          // Position duration in seconds
  
  // Status
  isOpen: boolean;            // Whether position is currently open
  isLiquidated: boolean;      // Whether position was liquidated
  healthFactor?: number;      // Position health (for lending/borrowing)
  
  // Financial metrics
  metrics: PositionMetrics;
  fees: PositionFees;
  defiMetrics?: DeFiMetrics;  // Additional DeFi-specific metrics
  
  // Transaction history
  entries: {                  // Entry transactions
    timestamp: number;
    amount: number;
    price: number;
    fees: PositionFees;
  }[];
  exits: {                    // Exit transactions
    timestamp: number;
    amount: number;
    price: number;
    fees: PositionFees;
  }[];
  
  // Risk management
  stopLoss?: number;          // Stop loss level
  takeProfit?: number;        // Take profit level
  
  // Custom metadata
  tags?: string[];           // Custom tags for position
  notes?: string;            // Any notes about the position
}

/**
 * Represents contextual information for agent persona
 */
export interface PersonaContext {
  tradingStyle: string;
  preferredAssets: string[];
  timeHorizon: string;
  customParameters: Record<string, any>;
}
