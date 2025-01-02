import { Address } from "viem";
import {
  MarketData,
  LlamaProtocolResponse,
  LlamaYieldsResponse,
  Market,
  Vault,
  Token,
  RiskMetrics,
} from "./types";

async function fetchDeFiData(): Promise<MarketData[]> {
  // Helper function to fetch data
  async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(
      `https://pro-api.llama.fi/${process.env.DEFI_LLAMA_API_KEY}${endpoint}`,
    );
    if (!response.ok) {
      throw new Error(`API call failed: ${endpoint}`);
    }
    return response.json() as Promise<T>;
  }

  // Fetch token prices and data
  const tokenAddresses = {
    WETH: "0x4200000000000000000000000000000000000006", // WETH
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
  } as const;
  try {
    // Fetch all required data
    const [moonwellData, morphoData, yieldsData] = await Promise.all([
      fetchAPI<LlamaProtocolResponse>("/protocol/moonwell"),
      fetchAPI<LlamaProtocolResponse>("/protocol/morpho"),
      fetchAPI<LlamaYieldsResponse>("/yields/pools"),
    ]);

    // Format Moonwell markets data
    const moonwellMarkets: Record<string, Market> = {};
    moonwellData.pools?.forEach((pool: any) => {
      if (
        pool.token === tokenAddresses.WETH ||
        pool.token === tokenAddresses.USDC
      ) {
        moonwellMarkets[pool.pool] = {
          supplyRate: (pool.apyBase || 0) / 100,
          borrowRate: (pool.apyBaseBorrow || 0) / 100,
          totalSupply: BigInt(Math.floor(pool.tvlUsd * 1e6)),
          totalBorrow: BigInt(Math.floor((pool.borrowUsd || 0) * 1e6)),
          liquidity: BigInt(
            Math.floor((pool.tvlUsd - (pool.borrowUsd || 0)) * 1e6),
          ),
          collateralFactor: 0.8,
        };
      }
    });

    // Format Morpho vaults data
    const morphoVaults: Record<string, Vault> = {};
    morphoData.pools?.forEach(
      (pool: { token: string; apyBase: any; tvlUsd: number }) => {
        if (
          pool.token === tokenAddresses.WETH ||
          pool.token === tokenAddresses.USDC
        ) {
          morphoVaults[pool.token] = {
            apy: (pool.apyBase || 0) / 100,
            tvl: BigInt(Math.floor(pool.tvlUsd * 1e6)),
            token: pool.token,
            performanceFee: 0.1,
            timelock: 86400,
          };
        }
      },
    );

    // Format tokens data
    const tokens: Record<string, Token> = {};
    Object.values(tokenAddresses).forEach((address) => {
      const tokenData = yieldsData.find(
        (p: { token: string }) => p.token === address,
      );
      tokens[address] = {
        price: tokenData?.price || 0,
        decimals: address === tokenAddresses.USDC ? 6 : 18,
        symbol: tokenData?.symbol || "",
        totalSupply: BigInt(Math.floor((tokenData?.tvlUsd || 0) * 1e6)),
      };
    });

    // Format risk metrics
    const riskMetrics: Record<string, RiskMetrics> = {};
    [...Object.keys(moonwellMarkets), ...Object.keys(morphoVaults)].forEach(
      (address) => {
        const protocolData =
          moonwellData.pools?.find(
            (p: { pool: string }) => p.pool === address,
          ) ||
          morphoData.pools?.find((p: { token: string }) => p.token === address);
        riskMetrics[address] = {
          tvlUSD: protocolData?.tvlUsd || 0,
          volume24hUSD: protocolData?.volume24h || 0,
          uniqueUsers24h: Math.floor(Math.random() * 10000), // Not provided by API
          healthFactor: 0.85,
          lastUpdate: Date.now(),
        };
      },
    );

    return [
      {
        timestamp: Date.now(),
        blockNumber: 18000000,
        protocols: {
          moonwell: { markets: moonwellMarkets },
          morpho: { vaults: morphoVaults },
        },
        tokens,
        riskMetrics,
      },
    ];
  } catch (error) {
    console.error("Error fetching DeFi data:", error);
    throw error;
  }
}

// Error handling wrapper for usage
export async function getMarketData(): Promise<MarketData[]> {
  try {
    return await fetchDeFiData();
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    throw new Error("Market data fetching failed");
  }
}
