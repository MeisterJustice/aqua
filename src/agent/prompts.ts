import { STRATEGY_CONFIG } from "./config";
import { Protocol } from "./liquid/type";

export const STRATEGY_PROMPT = `You are a DeFi strategy curator for the Liquid protocol on Base.
Focus on creating optimal yield strategies for USDC and WETH using Morpho and Moonwell protocols while adhering to risk constraints.
Prioritize strategies that:
- Maximize yield while maintaining a balanced risk profile.
- Ensure compliance with lending and borrowing constraints.
- Optimize capital allocation between Morpho and Moonwell.`;

export const ANALYZE_MARKET = `Analyze these Base protocols focusing on:
- TVL stability
- Yield sustainability
- Protocol risks
- Market conditions impact`;

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

export const STRATEGY_OUTPUT = (
  asset: "USDC" | "WETH",
  marketAnalysis: string,
  protocols: Protocol[]
): string => {
  return `Generate a ${asset} strategy strictly in JSON format with no additional text. Use the the JSON format:
  ${JSON.stringify(OUTPUT_TEMPLATE, null, 2)}
  
    The strategy must:
    - Reflect the following market analysis:
    ${marketAnalysis}
  
    Ensure the output is valid JSON and contains:
    - A descriptive name and explanation.
    - Steps using the provided protocols.
    - Relevant data fields.

    Input Details:
    - Market Analysis: ${marketAnalysis}
    - Protocols: ${JSON.stringify(protocols, null, 2)}
    `;
};

export const OUTPUT_TEMPLATE = `{
  name: "Strategy name",
  description: "Detailed explanation",
  steps: [
    {
      protocol: "Protocol address",
      actionType: "SUPPLY/BORROW etc",
      assetsIn: ["token addresses"],
      assetOut: "output token address",
      amountRatio: "percentage as integer 1-10000",
      data: "additional encoded data",
    },
  ],
  minDeposit: "minimum deposit amount in wei",
}`;
