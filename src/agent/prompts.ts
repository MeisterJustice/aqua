import {
  MOONWELL_CONNECTOR,
  MORPHO_CONNECTOR,
} from "../evm/contracts/addresses";
import { STRATEGY_CONFIG } from "./config";

export const STRATEGY_PROMPT = `You are a DeFi strategy curator for the Liquid protocol on Base.
Focus on creating optimal yield strategies for USDC and WETH using Morpho and Moonwell protocols while adhering to risk constraints.
Prioritize strategies that:
- Maximize yield while maintaining a balanced risk profile.
- Ensure compliance with lending and borrowing constraints.
- Optimize capital allocation between Morpho and Moonwell.
- No code please`;

export const ANALYZE_MARKET = `Based on the available in-memory data, analyze:
- TVL trends and stability metrics
- Current yield rates and sustainability factors
- Identified protocol risk factors
- Market condition impacts and correlations`;

export const GENERATE_STRATEGY = (
  asset: "USDC" | "WETH",
  marketAnalysis: string
): string => {
  const config =
    STRATEGY_CONFIG[asset.toLowerCase() as keyof typeof STRATEGY_CONFIG];
  const constraints = Object.entries(config.constraints)
    .map(([key, value]) =>
      Array.isArray(value)
        ? `- ${key.replace(/([A-Z])/g, " $1")}: ${value.join(", ")}`
        : `- ${key.replace(/([A-Z])/g, " $1")}: ${value}`
    )
    .join("\n");

  return `Create a ${asset} strategy following these rules:
  
  Constraints:
  - Number of steps allowed: ${config.steps}
  - Maximum number of protocols: ${config.maxProtocols}
  - Minimum yield: ${config.minYield}%
  - Maximum risk score: ${config.maxRiskScore}/10
  
  Specific Constraints:
  ${constraints}
  
  Previous Market Analysis:
  ${marketAnalysis}`;
};

export const MONITOR_STRATEGY = (asset: string): string => {
  return `Monitor this ${asset} strategy:
    - Check allocation health
    - Verify constraint compliance
    - Assess market impact
    - Identify risk changes
  
    Provide clear monitoring status.`;
};

export const REVIEW_STRATEGY = (asset: string): string => {
  return `Review and update ${asset} strategy:
    - Assess performance
    - Check market changes
    - Validate constraints
    - Propose adjustments if needed
  
    Return updated strategy maintaining risk parameters.`;
};

export const STRATEGY_OUTPUT = (strategy: string): string => {
  return `Generate a JSON strategy for ${strategy} strictly in JSON format with no additional text. Use the the JSON format:
  ${JSON.stringify(OUTPUT_TEMPLATE, null, 2)}
  
    Ensure the output is valid JSON and contains:
    - A descriptive name and explanation.
    - Steps using the provided protocols.
    - Relevant data fields.
    `;
};

export const OUTPUT_TEMPLATE = `{
  name: "Strategy name",
  description: "Detailed explanation about the strategy",
  "steps": [
    {
      "connector": "${MOONWELL_CONNECTOR} if protocol is Moonwell, ${MORPHO_CONNECTOR} if protocol is Morpho",
      "actionType": "SUPPLY/BORROW/REPAY/STAKE/UNSTAKE",
      assetsIn: ["token addresses"],
      assetOut: "output token address",
      amountRatio: "percentage as integer 1-10000",
      data: "0x"
    }
  ],
  minDeposit: "100000000000000000"
}`;
