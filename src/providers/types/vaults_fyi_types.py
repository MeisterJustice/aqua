# vaults_fyi_types.py
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class TvlDetails:
    tvlNative: str
    tvlUsd: str
    lockedNative: str
    lockedUsd: str
    liquidNative: str
    liquidUsd: str

@dataclass
class Holder:
    address: str
    balance: str

@dataclass
class TokenData:
    name: str
    assetAddress: str
    symbol: str
    decimals: int

@dataclass
class ApyPeriod:
    day_1: float
    day_7: float
    day_30: float

@dataclass
class ApyBreakdown:
    base: ApyPeriod
    rewards: ApyPeriod
    total: ApyPeriod

@dataclass
class RewardAsset:
    name: str
    assetAddress: str
    symbol: str
    decimals: int

@dataclass
class Reward:
    apy: ApyPeriod
    assetPriceInUsd: float
    asset: RewardAsset

@dataclass
class VaultResponse:
    name: str
    address: str
    network: str
    protocol: str
    tvlDetails: TvlDetails
    numberOfHolders: int
    topHolders: List[Holder]
    lendLink: str
    tags: List[str]
    token: TokenData
    apy: ApyBreakdown
    description: str
    rewards: List[Reward]
    tvl: Optional[str] = None 
    liquid: Optional[str] = None 
    locked: Optional[str] = None 
    isTransactional: Optional[bool] = None
    assetPriceInUsd: Optional[int] = None
    holdersTotalBalance: Optional[str] = None


@dataclass
class VaultApyResponse:
    base: float
    rewards: float
    total: float

@dataclass
class VaultHistoricalTvlDetails:
    tvlNative: str
    tvlUsd: str
    lockedNative: str
    lockedUsd: str
    liquidNative: str
    liquidUsd: str

@dataclass
class VaultHistoricalTvlResponse:
    timestamp: int
    blockNumber: int
    tvlDetails: VaultHistoricalTvlDetails

@dataclass
class VaultHistoricalApyDetails:
    base: float
    rewards: float
    total: float

@dataclass
class VaultHistoricalApyResponse:
    timestamp: int
    blockNumber: int
    apy: VaultHistoricalApyDetails

@dataclass
class VaultHolderTotalValuesResponse:
    usd: float
    native: float

@dataclass
class Amount:
    usd: float
    native: str

@dataclass
class PositionValue:
    usd: float
    native: str
@dataclass
class VaultHolderEvents:
    activity: str
    timestamp: int
    amount: Amount
    positionValue: PositionValue

@dataclass
class VaultHolderEventsResponse:
   events: List[VaultHolderEvents]