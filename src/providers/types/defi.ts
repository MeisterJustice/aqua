type VaultTvlDetails = {
  tvlNative: string;
  tvlUsd: string;
  lockedNative: string;
  lockedUsd: string;
  liquidNative: string;
  liquidUsd: string;
};

type VaultHolder = {
  address: string;
  balance: string;
};

type VaultTokenData = {
  name: string;
  assetAddress: string;
  symbol: string;
  decimals: number;
};

type VaultApyPeriod = {
  day_1: number;
  day_7: number;
  day_30: number;
};

type VaultApyBreakdown = {
  base: VaultApyPeriod;
  rewards: VaultApyPeriod;
  total: VaultApyPeriod;
};

type VaultRewardAsset = {
  name: string;
  assetAddress: string;
  symbol: string;
  decimals: number;
};

type VaultReward = {
  apy: VaultApyPeriod;
  assetPriceInUsd: number;
  asset: VaultRewardAsset;
};

type VaultResponse = {
  name: string;
  address: string;
  network: string;
  protocol: string;
  tvlDetails: VaultTvlDetails;
  numberOfHolders: number;
  topHolders: VaultHolder[];
  lendLink: string;
  tags: string[];
  token: VaultTokenData;
  apy: VaultApyBreakdown;
  description: string;
  rewards: VaultReward[];
  tvl?: string;
  liquid?: string;
  locked?: string;
  isTransactional?: boolean;
  assetPriceInUsd?: number;
  holdersTotalBalance?: string;
};

type VaultApyResponse = {
  base: number;
  rewards: number;
  total: number;
};

type VaultHistoricalTvlDetails = {
  tvlNative: string;
  tvlUsd: string;
  lockedNative: string;
  lockedUsd: string;
  liquidNative: string;
  liquidUsd: string;
};

type VaultHistoricalTvlResponse = {
  timestamp: number;
  blockNumber: number;
  tvlDetails: VaultHistoricalTvlDetails;
};

type VaultHistoricalApyDetails = {
  base: number;
  rewards: number;
  total: number;
};

type VaultHistoricalApyResponse = {
  timestamp: number;
  blockNumber: number;
  apy: VaultHistoricalApyDetails;
};

type VaultHolderTotalValuesResponse = {
  usd: number;
  native: number;
};

type VaultAmount = {
  usd: number;
  native: string;
};

type VaultPositionValue = {
  usd: number;
  native: string;
};

type VaultHolderEvents = {
  activity: string;
  timestamp: number;
  amount: VaultAmount;
  positionValue: VaultPositionValue;
};

type VaultHolderEventsResponse = {
  events: VaultHolderEvents[];
};

type VaultNetworkOptions =
  | "mainnet"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "gnosis";
