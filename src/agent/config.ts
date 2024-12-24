// src/agent/config.ts

// Llama Stack Agent Configuration
export const AGENT_CONFIG = {
  model: "Llama3.2-3B-Instruct",
  tools: [
    {
      type: "memory",
      memoryBankConfigs: [{
        type: "vector",
        bankId: "defi_market_data",
        embeddingModel: "all-MiniLM-L6-v2",
        chunkSizeInTokens: 512
      }],
      maxTokensInContext: 4096
    },
    {
      type: "code_interpreter",
      enableInlineCodeExecution: true
    }
  ],
  inputShields: ["content_safety"],
  outputShields: ["content_safety"],
  maxInferIters: 5,
  samplingParams: {
    temperature: 0.7,
    maxTokens: 2048
  }
} as const

// Strategy Generation Configuration
export const STRATEGY_CONFIG = {
  usdc: {
    maxProtocols: 3,
    minYield: 4.0, // 4% APY
    maxRiskScore: 7, // 1-10 scale
    supportedProtocols: [
      'moonwell',
      'morpho',
    ]
  },
  weth: {
    maxProtocols: 3,
    minYield: 3.0, // 3% APY
    maxRiskScore: 8,
    supportedProtocols: [
      'moonwell',
      'morpho',
    ]
  }
} as const

// Memory Bank Configuration
export const MEMORY_CONFIG = {
  bankId: "defi_market_data",
  retentionPeriod: 30 * 24 * 60 * 60, // 30 days in seconds
  updateInterval: 60 * 60, // 1 hour in seconds
}

// Update Frequency
export const UPDATE_CONFIG = {
  strategyGeneration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  marketData: 60 * 60 * 1000, // 1 hour in milliseconds
  retryDelay: 60 * 60 * 1000 // 1 hour in milliseconds
} as const

// Safety Thresholds
export const SAFETY_CONFIG = {
  minTVL: BigInt(1_000_000), // $1M minimum TVL
  maxExposurePerProtocol: 0.4, // max 40% in one protocol
  minProtocolAge: 90 * 24 * 60 * 60, // 90 days minimum protocol age
  maxGasEstimate: 1_000_000 // maximum gas units
} as const