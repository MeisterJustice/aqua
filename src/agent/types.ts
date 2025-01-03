export interface StrategyStep {
  connector: `0x${string}`;
  actionType: 0 | 1 | 2 | 3 | 4 | 5;
  assetsIn: `0x${string}`[];
  assetOut: `0x${string}`;
  amountRatio: bigint;
  data: `0x${string}`;
}

export interface GeneratedStrategy {
  name: string;
  description: string;
  steps: StrategyStep[];
  minDeposit: bigint;
}

export interface StrategyOutput {
  name: string;
  description: string;
  steps: StrategyStep[];
  minDeposit: string;
}

export interface StrategyConfig {
  maxProtocols: number;
  minYield: number;
  maxRiskScore: number;
  supportedProtocols: string[];
  constraints: {
    minLendingRatio: number;
    minStablecoinExposure?: number;
    supportedStables?: string[];
    maxLeverage?: number;
  };
}


interface Protocol {
  name: string;
  tvl: number;
  apy: number;
  risk_score: number;
  supported_assets: string[];
}

interface Strategy {
  id: string;
  asset: 'USDC' | 'WETH';
  allocations: {
      protocol: string;
      percentage: number;
      leverage?: number;
  }[];
  estimated_apy: number;
  risk_level: string;
  timestamp: string;
}

interface MarketCondition {
  protocols: Protocol[];
  market_risk: number;
  gas_prices: number;
  timestamp: string;
}