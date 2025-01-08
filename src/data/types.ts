// types.ts

// Llama API Response Types
export interface LlamaYieldResponse {
  status: string;
  data: LlamaPool[];
}
export interface LlamaProtocolResponse {
  id: string;
  name: string;
  url: string;
  description: string;
  logo: string;
  chains: string[];
  gecko_id: string;
  cmcId: string;
  treasury?: string;
  twitter?: string;
  governanceID?: string[];
  currentChainTvls: Record<string, number>;
  chainTvls: {
    [chain: string]: {
      tvl: number;
      borrowed?: number;
      staking?: number;
      pool2?: number;
    };
  };
}

export interface LlamaPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apyReward: number | null;
  apy: number;
  rewardTokens: string[] | null;
  pool: string;
  apyPct1D: number | null;
  apyPct7D: number | null;
  apyPct30D: number | null;
  stablecoin: boolean;
  ilRisk: string;
  exposure: string;
  predictions: LlamaPredictions;
  poolMeta: string | null;
  mu: number;
  sigma: number;
  count: number;
  outlier: boolean;
  underlyingTokens: string[];
  il7d: number | null;
  apyBase7d: number | null;
  apyMean30d: number | null;
  volumeUsd1d: number | null;
  volumeUsd7d: number | null;
  apyBaseInception: number | null;
}

export interface LlamaPredictions {
  predictedClass: string | null;
  predictedProbability: number | null;
  binnedConfidence: number | null;
}

// Application Data Types
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

export interface RiskMetrics {
  tvlUSD: number;
  volume24hUSD: number;
  uniqueUsers24h: number;
  healthFactor: number;
  lastUpdate: number;
}

export interface PriceChange {
  "24h": number;
  "7d": number;
  "30d": number;
}

export interface Token {
  price: number;
  priceChange: PriceChange;
  decimals: number;
  symbol: string;
  totalSupply: bigint;
}

export interface CoinsResponse {
  coins: Record<
    string,
    {
      totalSupply: any;
      price: number;
      symbol: string;
      timestamp: number;
      confidence?: number;
    }
  >;
}

export interface PriceChangeResponse {
  coins: Record<
    string,
    {
      percentage: number;
      timestamp: number;
    }
  >;
}

export interface MarketData {
  timestamp: number;
  blockNumber: number;
  protocols: {
    moonwell: {
      markets: Record<string, Market>;
    };
    // morpho: {
    //   vaults: Record<string, Vault>;
    // };
  };
  tokens: Record<string, Token>;
  riskMetrics: Record<string, RiskMetrics>;
}
