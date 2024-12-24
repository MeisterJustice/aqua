export interface StrategyStep {
  protocol: string;
  actionType: "SUPPLY" | "WITHDRAW" | "BORROW" | "REPAY" | "STAKE" | "UNSTAKE";
  assetsIn: `0x${string}`[];
  assetOut: `0x${string}`;
  amountRatio: number;
  data: `0x${string}`;
}

export interface GeneratedStrategy {
  name: string;
  description: string;
  steps: StrategyStep[];
  minDeposit: bigint;
}
