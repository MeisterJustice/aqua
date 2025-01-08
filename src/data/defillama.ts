import { Address } from "viem";
import {
  MarketData,
  Market,
  Vault,
  Token,
  RiskMetrics,
  CoinsResponse,
  PriceChangeResponse,
  PriceChange,
  LlamaYieldResponse,
  LlamaProtocolResponse,
} from "./types";

const API_ENDPOINTS = {
  DEFI_LLAMA: "https://api.llama.fi",
  COINS_API: "https://coins.llama.fi",
  YIELDS_API: "https://yields.llama.fi",
} as const;

const TOKEN_ADDRESSES = {
  WETH: "0x4200000000000000000000000000000000000006", // WETH on Base
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
} as const;

async function fetchAPI<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`API call failed: ${url}, status: ${response.status}`);
    throw new Error(`API call failed: ${url}`);
  }
  const data = await response.json();
  return data as T;
}

async function fetchTokenPricesAndChanges(tokens: string[]): Promise<{
  prices: CoinsResponse;
  changes: Record<string, PriceChange>;
}> {
  const tokenIds = tokens.map((address) => `base:${address}`).join(",");
  const [prices, day, week, month] = await Promise.all([
    fetchAPI<CoinsResponse>(
      `${API_ENDPOINTS.COINS_API}/prices/current/${tokenIds}`
    ),
    fetchAPI<PriceChangeResponse>(
      `${API_ENDPOINTS.COINS_API}/percentage/${tokenIds}?period=24h`
    ),
    fetchAPI<PriceChangeResponse>(
      `${API_ENDPOINTS.COINS_API}/percentage/${tokenIds}?period=7d`
    ),
    fetchAPI<PriceChangeResponse>(
      `${API_ENDPOINTS.COINS_API}/percentage/${tokenIds}?period=30d`
    ),
  ]);

  const changes: Record<string, PriceChange> = {};
  tokens.forEach((token) => {
    const key = `base:${token}`;
    changes[token] = {
      "24h": day.coins[key]?.percentage || 0,
      "7d": week.coins[key]?.percentage || 0,
      "30d": month.coins[key]?.percentage || 0,
    };
  });

  return { prices, changes };
}

async function fetchDeFiData(): Promise<MarketData[]> {
  try {
    const [moonwellProtocol, morphoProtocol, yieldsData] = await Promise.all([
      fetchAPI<LlamaProtocolResponse>(
        `${API_ENDPOINTS.DEFI_LLAMA}/protocol/moonwell`
      ),
      fetchAPI<LlamaProtocolResponse>(
        `${API_ENDPOINTS.DEFI_LLAMA}/protocol/morpho`
      ),
      fetchAPI<LlamaYieldResponse>(`${API_ENDPOINTS.YIELDS_API}/pools`),
    ]);

    const baseYields = yieldsData.data.filter(
      (pool) =>
        pool.chain === "Base" &&
        (pool.project === "moonwell" || pool.project === "morpho")
    );

    const tokenAddresses = Object.values(TOKEN_ADDRESSES);
    const { prices, changes } =
      await fetchTokenPricesAndChanges(tokenAddresses);

    const moonwellMarkets: Record<string, Market> = {};
    baseYields
      .filter((pool) => pool.project === "moonwell")
      .forEach((pool) => {
        const underlyingToken = pool.underlyingTokens[0];
        if (
          underlyingToken &&
          Object.values(TOKEN_ADDRESSES).includes(
            underlyingToken as (typeof TOKEN_ADDRESSES)[keyof typeof TOKEN_ADDRESSES]
          )
        ) {
          moonwellMarkets[underlyingToken] = {
            supplyRate: pool.apyBase,
            borrowRate: pool.apy - pool.apyBase || 0,
            totalSupply: BigInt(
              Math.floor(moonwellProtocol.currentChainTvls["Base"] || 0)
            ),
            totalBorrow: BigInt(
              Math.floor(
                moonwellProtocol.currentChainTvls["Base-borrowed"] || 0
              )
            ),
            liquidity:
              BigInt(
                Math.floor(moonwellProtocol.currentChainTvls["Base"] || 0)
              ) -
              BigInt(
                Math.floor(
                  moonwellProtocol.currentChainTvls["Base-borrowed"] || 0
                )
              ),
            collateralFactor: 0.8,
          };
        }
      });

    const morphoVaults: Record<string, Vault> = {};
    baseYields
      .filter((pool) => pool.project === "morpho")
      .forEach((pool) => {
        if (
          pool.underlyingTokens[0] &&
          Object.values(TOKEN_ADDRESSES).includes(
            pool
              .underlyingTokens[0] as (typeof TOKEN_ADDRESSES)[keyof typeof TOKEN_ADDRESSES]
          )
        ) {
          morphoVaults[pool.underlyingTokens[0]] = {
            apy: pool.apy,
            tvl: BigInt(morphoProtocol.currentChainTvls["Base"] || 0),
            token: pool.underlyingTokens[0],
            performanceFee: 0.1,
            timelock: 86400,
          };
        }
      });

    const tokens: Record<string, Token> = {};
    Object.values(TOKEN_ADDRESSES).forEach((address) => {
      const priceData = prices.coins[`base:${address}`];
      const priceChange = changes[address];
      tokens[address] = {
        price: priceData?.price || 0,
        priceChange: priceChange || { "24h": 0, "7d": 0, "30d": 0 },
        decimals: address === TOKEN_ADDRESSES.USDC ? 6 : 18,
        symbol: priceData?.symbol || "",
        totalSupply: BigInt(0),
      };
    });

    const riskMetrics: Record<string, RiskMetrics> = {};
    Object.keys(moonwellMarkets).forEach((address) => {
      riskMetrics[address] = {
        tvlUSD: 0,
        volume24hUSD: 0,
        uniqueUsers24h: 0,
        healthFactor: 0.85,
        lastUpdate: Date.now(),
      };
    });

    const result: MarketData[] = [
      {
        timestamp: Date.now(),
        blockNumber: 18000000,
        protocols: {
          moonwell: { markets: moonwellMarkets },
          // morpho: { vaults: morphoVaults },
        },
        tokens,
        riskMetrics,
      },
    ];

    return result;
  } catch (error) {
    console.error("Error fetching DeFi data:", error);
    throw error;
  }
}

export async function getMarketData(): Promise<MarketData[]> {
  try {
    return await fetchDeFiData();
  } catch (error) {
    console.error("Failed to fetch market data:", error);
    throw error;
  }
}
