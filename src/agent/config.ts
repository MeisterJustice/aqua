// - Configures LlamaStack agent settings
// - Contains strategy constraints (USDC/WETH rules)
// - Defines safety thresholds and update frequencies

import { STRATEGY_PROMPT } from "./prompts";

// Llama Stack Agent Configuration
// export const AGENT_CONFIG = {
//   model: "Llama3.2-3B-Instruct",
//   tools: [
//     {
//       type: "memory",
//       memoryBankConfigs: [
//         {
//           type: "vector",
//           bankId: "defi_market_data",
//           embeddingModel: "all-MiniLM-L6-v2",
//           chunkSizeInTokens: 512,
//         },
//       ],
//       maxTokensInContext: 4096,
//     },
//     {
//       type: "code_interpreter",
//       enableInlineCodeExecution: true,
//     },
//   ],
//   inputShields: ["content_safety"],
//   outputShields: ["content_safety"],
//   maxInferIters: 5,
//   samplingParams: {
//     temperature: 0.7,
//     maxTokens: 2048,
//   },
// } as const;
const bank_id = "base_defi_market_data";
export const AGENT_CONFIG = {
  enable_session_persistence: false,
  instructions: STRATEGY_PROMPT,
  model: "meta-llama/Llama-3.1-405B-Instruct-FP8",
  max_infer_iters: 100,
  tools: [
    {
      max_chunks: 1000,
      max_tokens_in_context: 4096,
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
    maxProtocols: 3,
    minYield: 4.0, // 4% APY
    maxRiskScore: 7, // 1-10 scale
    supportedProtocols: ["moonwell", "morpho"],
    constraints: {
      minLendingRatio: 0.8, // 80% minimum in lending protocols
      minStablecoinExposure: 0.95, // 95% minimum stablecoin exposure
      supportedStables: [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
      ],
    },
  },
  weth: {
    maxProtocols: 3,
    minYield: 3.0, // 3% APY
    maxRiskScore: 8,
    supportedProtocols: ["moonwell", "morpho"],
    constraints: {
      minLendingRatio: 0.6, // 60% minimum in lending protocols
      maxLeverage: 2, // 2x max leverage
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
