export enum TokenActionType {
  BUY = "BUY",
  SELL = "SELL",
  SKIP = "SKIP",
}

type Argument = {
  Name: string;
  Type: string;
  Value: {
    address?: string;
    bool?: boolean;
    bigInteger?: string;
  };
};

type Block = {
  Time: string;
};

type Log = {
  Signature: {
    Name: string;
  };
};

type Transaction = {
  Hash: string;
};

export type TokenEVMData = {
  Arguments: Argument[];
  Block: Block;
  Log: Log;
  Transaction: Transaction;
};

export type TokenSolanaData = {
  Instruction: {
    Accounts: {
      Address: string;
    }[];
  };
};

export type TokenAttributes = {
  address: string;
  name: string;
  symbol: string;
  image_url: string;
  coingecko_coin_id: string;
  decimals: number;
  total_supply: string;
  price_usd: string;
  fdv_usd: string;
  total_reserve_in_usd: string;
  volume_usd: {
    h24: string;
  };
  market_cap_usd: string;
};

type PoolAttributes = {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;
  address: string;
  name: string;
  pool_created_at: string;
  token_price_usd: string;
  fdv_usd: string;
  market_cap_usd: string;
  price_change_percentage: {
    m5: string;
    h1: string;
    h6: string;
    h24: string;
  };
  transactions: {
    m5: {
      buys: number;
      sells: number;
      buyers: string | null;
      sellers: string | null;
    };
    m15: {
      buys: number;
      sells: number;
      buyers: string | null;
      sellers: string | null;
    };
    m30: {
      buys: number;
      sells: number;
      buyers: string | null;
      sellers: string | null;
    };
    h1: {
      buys: number;
      sells: number;
      buyers: string | null;
      sellers: string | null;
    };
    h24: {
      buys: number;
      sells: number;
      buyers: string | null;
      sellers: string | null;
    };
  };
  volume_usd: {
    m5: string;
    h1: string;
    h6: string;
    h24: string;
  };
  reserve_in_usd: string;
};

type RelationshipData = {
  id: string;
  type: string;
};

type Relationships = {
  top_pools: {
    data: RelationshipData[];
  };
  base_token?: {
    data: RelationshipData;
  };
  quote_token?: {
    data: RelationshipData;
  };
  dex?: {
    data: RelationshipData;
  };
};

type TokenData = {
  id: string;
  type: string;
  attributes: TokenAttributes;
  relationships: Relationships;
};

type IncludedData = {
  id: string;
  type: string;
  attributes: PoolAttributes;
  relationships: Relationships;
};

export type TokenInformation = {
  data: TokenData;
  included?: IncludedData[];
};
