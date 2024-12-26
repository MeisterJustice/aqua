// Watches DeFi protocols
// Has AI analyze the data
// Creates yield strategies
// Deploys them on-chain

// This file is the main entry point of our AI Curator system. It runs two main continuous processes:

// * 1. Market Data Loop (Runs Every Hour):
// - Fetches latest data from Base protocols (Moonwell, Morpho)
// - Stores data in LlamaStack memory for AI analysis 
// - Updates prices, TVL, yields, etc.

// * 2. Strategy Generation Loop  (Runs Weekly):
// - Uses LlamaStack AI to analyze stored market data
// - Generates optimal yield strategies for USDC and WETH
// - Validates strategies meet our requirements:
//   * USDC: 80% in lending, 95% stablecoin exposure
//   * WETH: 60% in lending, up to 2x leverage
// - Deploys valid strategies to Liquid Protocol on Base

