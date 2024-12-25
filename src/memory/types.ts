export interface ProtocolData {
  // Moonwell data
  moonwell: {
    markets: {
      [tokenAddress: string]: {
        supplyRate: number;
        borrowRate: number;
        totalSupply: bigint;
        totalBorrow: bigint;
        liquidity: bigint;
        collateralFactor: number;
      };
    };
  };

  // Morpho data
  morpho: {
    vaults: {
      [vaultAddress: string]: {
        apy: number;
        tvl: bigint;
        token: string;
        performanceFee: number;
        timelock: number;
      };
    };
  };
}
// Combined market data snapshot
export interface MarketData {
  timestamp: number;
  blockNumber: number;

  // Protocol data
  protocols: ProtocolData;

  // Token prices and data
  tokens: {
    [tokenAddress: string]: {
      price: number;
      decimals: number;
      symbol: string;
      totalSupply: bigint;
    };
  };

  // Risk metrics
  riskMetrics: {
    [protocolAddress: string]: {
      tvlUSD: number;
      volume24hUSD: number;
      uniqueUsers24h: number;
      healthFactor: number; // 0-1 score
      lastUpdate: number;
    };
  };
}
