export interface Protocol {
  name: string;
  tvl: number;
  apy: number;
  risk_score: number;
  supported_assets: string[];
}

export interface Strategy {
  id: string;
  asset: "USDC" | "WETH";
  allocations: {
    protocol: string;
    percentage: number;
    leverage?: number;
  }[];
  estimated_apy: number;
  risk_level: string;
  timestamp: string;
}

export interface MarketCondition {
  protocols: Protocol[];
  market_risk: number;
  gas_prices: number;
  timestamp: string;
}

export enum Asset {
  USDC = "USDC",
  WETH = "WETH",
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface ChunkMessage {
  messages: Array<{ content: string }>;
}

export interface Step {
  step_type: string;
  model_response?: {
    content?: string;
  };
}
export type AllocationMap = Record<string, number>;
