import { STRATEGY_PROMPT } from "./prompts";
import { MoonwellConfig } from "./types";

const bank_id = "base_market_data";
export const AGENT_CONFIG = {
  enable_session_persistence: false,
  instructions: STRATEGY_PROMPT,
  model: "meta-llama/Llama-3.1-70B-Instruct",
  max_infer_iters: 100,
  tools: [
    {
      max_chunks: 1000,
      max_tokens_in_context: 8192,
      memory_bank_configs: [
        {
          bank_id,
          type: "vector",
        },
      ],
      type: "memory",
      query_generator_config: {
        sep: "",
        type: "default",
      },
    },
    {
      type: "code_interpreter",
      enable_inline_code_execution: true,
    },
  ],
};
// Strategy Generation Configuration
export const STRATEGY_CONFIG = {
  usdc: {
    steps: 1,
    maxProtocols: 3,
    minYield: 4.0, // 4% APY
    maxRiskScore: 7, // 1-10 scale
    supportedProtocols: ["moonwell"],
    constraints: {
      minLendingRatio: 0.8, // 80% minimum in lending protocols
      minStablecoinExposure: 0.95, // 95% minimum stablecoin exposure
      supportedStables: [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      ],
    },
  },
  weth: {
    steps: 1,
    maxProtocols: 3,
    minYield: 3.0, // 3% APY
    maxRiskScore: 8,
    supportedProtocols: ["moonwell"],
    constraints: {
      minLendingRatio: 0.6, // 60% minimum in lending protocols
      supportedTokens: [
        "0x4200000000000000000000000000000000000006", //WETH
      ],
    },
  },
} as const;

// Memory Bank Configuration
export const MEMORY_CONFIG = {
  bankId: bank_id,
  retentionPeriod: 30 * 24 * 60 * 60, // 30 days in seconds
  updateInterval: 60 * 60, // 1 hour in seconds
};

// Update Frequency
export const UPDATE_CONFIG = {
  strategyGeneration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  marketData: 60 * 60 * 1000, // 1 hour in milliseconds
  retryDelay: 60 * 60 * 1000, // 1 hour in milliseconds
} as const;

// Safety Thresholds
export const SAFETY_CONFIG = {
  minTVL: BigInt(1_000_000), // $1M minimum TVL
  maxExposurePerProtocol: 0.4, // max 40% in one protocol
  minProtocolAge: 90 * 24 * 60 * 60, // 90 days minimum protocol age
  maxGasEstimate: 1_000_000, // maximum gas units
} as const;

export const MOONWELL_CONFIG: MoonwellConfig = {
  name: "Moonwell",
  type: "LENDING",
  addresses: {
    comptroller: "0xfBb21d0380beE3312B33c4353c8936a0F13EF26C",
    markets: {
      mWETH: "0x628ff693426583D9a7FB391E54366292F509D457",
      USDbC: "0x703843C3379b52F9FF486c9f5892218d2a065cC8",
      DAI: "0x73b06D8d18De422E269645eaCe15400DE7462417",
      cbBTC: "0xF877ACaFA28c19b96727966690b2f44d35aD5976",
      EUROC: "0xb682c840B5F4FC58B20769E691A6fa1305A501a2",
      "mwUSDC Morpho Vault": "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
      "mwETH Morpho Vault": "0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1",
      "mwEURC Morpho Vault": "0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026",
      "mwcbBTC Morpho Vault": "0x543257ef2161176d7c8cd90ba65c2d4caef5a796",
    },
  },
  supportedActions: ["SUPPLY", "WITHDRAW", "BORROW", "REPAY"],
};

export const BASE_TOKENS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  WETH: "0x4200000000000000000000000000000000000006",
};

export const MIN_DEPOSITS = {
  WETH: "100000000000000000",
  USDC: "100000000",
};
