function generateMockMarketData() {
  const moonwellMarkets = {
    "0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D": {
      supplyRate: Math.random() * 0.1, // 0-10% APY
      borrowRate: Math.random() * 0.15, // 0-15% APY
      totalSupply: BigInt(Math.floor(Math.random() * 1000000) * 1e18),
      totalBorrow: BigInt(Math.floor(Math.random() * 500000) * 1e18),
      liquidity: BigInt(Math.floor(Math.random() * 200000) * 1e18),
      collateralFactor: 0.8,
    },
    "0x8B3f33234ABD88493c0Cd28De33D583B70beDe35": {
      supplyRate: Math.random() * 0.1,
      borrowRate: Math.random() * 0.15,
      totalSupply: BigInt(Math.floor(Math.random() * 1000000) * 1e18),
      totalBorrow: BigInt(Math.floor(Math.random() * 500000) * 1e18),
      liquidity: BigInt(Math.floor(Math.random() * 200000) * 1e18),
      collateralFactor: 0.75,
    },
  };

  const morphoVaults = {
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
      apy: Math.random() * 0.12, // 0-12% APY
      tvl: BigInt(Math.floor(Math.random() * 2000000) * 1e18),
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      performanceFee: 0.1,
      timelock: 86400, // 1 day in seconds
    },
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
      apy: Math.random() * 0.08, // 0-8% APY
      tvl: BigInt(Math.floor(Math.random() * 5000000) * 1e6), // USDC has 6 decimals
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      performanceFee: 0.1,
      timelock: 86400,
    },
  };

  const tokens = {
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
      price: 2000 + Math.random() * 200, // ETH price $2000-2200
      decimals: 18,
      symbol: "WETH",
      totalSupply: BigInt(Math.floor(Math.random() * 1000000) * 1e18),
    },
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
      price: 1, // USDC
      decimals: 6,
      symbol: "USDC",
      totalSupply: BigInt(Math.floor(Math.random() * 10000000000) * 1e6),
    },
  };

  const riskMetrics = {
    "0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D": {
      tvlUSD: Math.random() * 1000000000, // Up to $1B TVL
      volume24hUSD: Math.random() * 100000000, // Up to $100M volume
      uniqueUsers24h: Math.floor(Math.random() * 10000),
      healthFactor: 0.7 + Math.random() * 0.3, // 0.7-1.0
      lastUpdate: Date.now() - Math.floor(Math.random() * 3600000), // Last hour
    },
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
      tvlUSD: Math.random() * 1000000000,
      volume24hUSD: Math.random() * 100000000,
      uniqueUsers24h: Math.floor(Math.random() * 10000),
      healthFactor: 0.7 + Math.random() * 0.3,
      lastUpdate: Date.now() - Math.floor(Math.random() * 3600000),
    },
  };

  return [
    {
      timestamp: Date.now(),
      blockNumber: 18000000 + Math.floor(Math.random() * 1000), // Recent Base block
      protocols: {
        moonwell: { markets: moonwellMarkets },
        morpho: { vaults: morphoVaults },
      },
      tokens,
      riskMetrics,
    },
  ];
}

export const mockMarketData = generateMockMarketData();
