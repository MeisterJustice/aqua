export interface StrategyStep {
  connector: `0x${string}`;
  actionType: 0 | 1 | 2 | 3 | 4 | 5;
  assetsIn: `0x${string}`[];
  assetOut: `0x${string}`;
  amountRatio: bigint;
  data: `0x${string}`;
}

export interface GeneratedStrategy {
  name: string;
  description: string;
  steps: StrategyStep[];
  minDeposit: bigint;
}
