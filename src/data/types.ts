// Protocol Types
export interface Market {
  supplyRate: number;
  borrowRate: number;
  totalSupply: bigint;
  totalBorrow: bigint;
  liquidity: bigint;
  collateralFactor: number;
}

export interface Vault {
  apy: number;
  tvl: bigint;
  token: string;
  performanceFee: number;
  timelock: number;
}

export interface Token {
  price: number;
  decimals: number;
  symbol: string;
  totalSupply: bigint;
}

export interface RiskMetrics {
  tvlUSD: number;
  volume24hUSD: number;
  uniqueUsers24h: number;
  healthFactor: number;
  lastUpdate: number;
}

export interface MarketData {
  timestamp: number;
  blockNumber: number;
  protocols: {
    moonwell: {
      markets: Record<string, Market>;
    };
    morpho: {
      vaults: Record<string, Vault>;
    };
  };
  tokens: Record<string, Token>;
  riskMetrics: Record<string, RiskMetrics>;
}

// DeFiLlama API Response Types
export interface LlamaPool {
  pool: string;
  token: string;
  tvlUsd: number;
  apyBase: number;
  apyBaseBorrow?: number;
  borrowUsd?: number;
  symbol: string;
  price?: number;
  volume24h?: number;
}

export interface LlamaProtocolResponse {
  pools?: LlamaPool[];
}

export interface LlamaYieldsResponse extends Array<LlamaPool> {}