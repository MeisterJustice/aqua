import os
import logging
from typing import List
from src.utils.api_client import fetch_with_retry
from src.providers.types.vaults_fyi_types import VaultResponse, ApyPeriod, ApyBreakdown, VaultApyResponse, VaultHistoricalTvlDetails, VaultHistoricalTvlResponse, VaultHistoricalApyDetails, VaultHistoricalApyResponse, VaultHolderTotalValuesResponse, Amount, PositionValue, VaultHolderEvents, VaultHolderEventsResponse
from dotenv import load_dotenv

load_dotenv()

API_ENDPOINTS = {
    "VAULTS_FYI": "https://api.vaults.fyi/v1",
}

logger = logging.getLogger("VAULTS_FYI_PROVIDER")
VAULTS_FYI_API_KEY = os.getenv("VAULTS_FYI_API_KEY", "").strip()

if VAULTS_FYI_API_KEY:
    logger.info("VAULTS_FYI_API_KEY loaded successfully", VAULTS_FYI_API_KEY)
else:
    logger.error("VAULTS_FYI_API_KEY not found")
    raise ValueError("VAULTS_FYI_API_KEY is not set")

HEADERS = {
    "x-api-key": f"{VAULTS_FYI_API_KEY}",
    "Content-Type": "application/json",
}


async def get_vault_details(network: str, vault_address: str) -> VaultResponse:
    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}"
    
    try:
        raw_data = await fetch_with_retry(url, headers=HEADERS)
        
        #    Manually parse the JSON into VaultResponse
        #    Because we have "1day", "7day", "30day" in the JSON,
        #    we must convert them to day_1, day_7, day_30, etc.
        
        # Example of how to parse "apy.base.1day -> day_1" etc:
        def parse_apy_period(obj) -> ApyPeriod:
            return ApyPeriod(
                day_1=obj.get("1day", 0.0),
                day_7=obj.get("7day", 0.0),
                day_30=obj.get("30day", 0.0),
            )
        
        vault_response = VaultResponse(
            name=raw_data.get("name"),
            address=raw_data.get("address"),
            network=raw_data.get("network"),
            protocol=raw_data.get("protocol"),
            tvlDetails=(
                type(raw_data["tvlDetails"])(
                    **raw_data["tvlDetails"]
                )
            ),
            numberOfHolders=raw_data["numberOfHolders"],
            topHolders=[
                type(h)(**h) for h in raw_data["topHolders"]
            ],
            lendLink=raw_data["lendLink"],
            tags=raw_data["tags"],
            token=type(raw_data["token"])(**raw_data["token"]),
            apy=ApyBreakdown(
                base=parse_apy_period(raw_data["apy"]["base"]),
                rewards=parse_apy_period(raw_data["apy"]["rewards"]),
                total=parse_apy_period(raw_data["apy"]["total"])
            ),
            description=raw_data["description"],
            rewards=[
                type(r)(
                    apy=parse_apy_period(r["apy"]),
                    assetPriceInUsd=r["assetPriceInUsd"],
                    asset=type(r["asset"])(**r["asset"])
                )
                for r in raw_data["rewards"]
            ],
            tvl=raw_data.get("tvl"),
            liquid=raw_data.get("liquid"),
            locked=raw_data.get("locked"),
            isTransactional=raw_data.get("isTransactional"),
            assetPriceInUsd=raw_data.get("assetPriceInUsd"),
            holdersTotalBalance=raw_data.get("holdersTotalBalance")
        )

        return vault_response

    except Exception as e:
        logger.error(f"Failed to fetch or parse vault details for {vault_address}: {e}")
        raise

async def get_vault_apy(network: str, vault_address: str, interval: str = '1day') -> VaultApyResponse:
    valid_intervals = ['1day', '7day', '30day']
    if interval not in valid_intervals:
        logger.error(f"Invalid interval '{interval}'. Must be one of {valid_intervals}.")
        raise ValueError(f"Invalid interval '{interval}'. Must be one of {valid_intervals}.")

    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}/apy"
    params = {'interval': interval}

    try:
        logger.debug(f"Fetching vault APY with URL: {url} and params: {params}")
        
        raw_data = await fetch_with_retry(url, headers=HEADERS, params=params)
        
        logger.debug(f"Raw APY Data Received: {raw_data}")
        
        base_apy = raw_data.get("base", 0.0)
        rewards_apy = raw_data.get("rewards", 0.0)
        total_apy = raw_data.get("total", 0.0)
        
        vault_apy_response = VaultApyResponse(
            base=float(base_apy),
            rewards=float(rewards_apy),
            total=float(total_apy)
        )

        return vault_apy_response

    except KeyError as ke:
        logger.error(f"Missing key in APY response: {ke}. Raw Data: {raw_data}")
        raise
    except Exception as e:
        logger.error(f"Failed to fetch or parse APY data for vault {vault_address}: {e}")
        raise

async def get_vault_historical_tvl(network: str, vault_address: str, timestamp: int) -> VaultHistoricalTvlResponse:
    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}/historical-tvl/{timestamp}"
    
    try:
        logger.debug(f"Fetching historical TVL with URL: {url}")
        
        raw_data = await fetch_with_retry(url, headers=HEADERS)
        
        logger.debug(f"Raw Historical TVL Data Received: {raw_data}")
        
        historical_tvl_response = VaultHistoricalTvlResponse(
            timestamp=raw_data.get("timestamp", 0),
            blockNumber=raw_data.get("blockNumber", 0),
            tvlDetails=VaultHistoricalTvlDetails(
                tvlNative=raw_data["tvlDetails"].get("tvlNative", "0"),
                tvlUsd=raw_data["tvlDetails"].get("tvlUsd", "0"),
                lockedNative=raw_data["tvlDetails"].get("lockedNative", "0"),
                lockedUsd=raw_data["tvlDetails"].get("lockedUsd", "0"),
                liquidNative=raw_data["tvlDetails"].get("liquidNative", "0"),
                liquidUsd=raw_data["tvlDetails"].get("liquidUsd", "0"),
            )
        )
        
        return historical_tvl_response

    except KeyError as ke:
        logger.error(f"Missing key in historical TVL response: {ke}. Raw Data: {raw_data}")
        raise
    except Exception as e:
        logger.error(f"Failed to fetch or parse historical TVL data for vault {vault_address} at timestamp {timestamp}: {e}")
        raise

async def get_vault_historical_apy(network: str, vault_address: str, timestamp: int, interval: str = "1day") -> VaultHistoricalTvlResponse:
    valid_intervals = ['1day', '7day', '30day']
    if interval not in valid_intervals:
        logger.error(f"Invalid interval '{interval}'. Must be one of {valid_intervals}.")
        raise ValueError(f"Invalid interval '{interval}'. Must be one of {valid_intervals}.")
    
    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}/historical-apy/{timestamp}"
    params = {'interval': interval}
    
    try:
        logger.debug(f"Fetching historical APY with URL: {url}")
        
        raw_data = await fetch_with_retry(url, headers=HEADERS, params=params)
        
        logger.debug(f"Raw Historical APY Data Received: {raw_data}")
        
        historical_apy_response = VaultHistoricalApyResponse(
            timestamp=raw_data.get("timestamp", 0),
            blockNumber=raw_data.get("blockNumber", 0),
            apy=VaultHistoricalApyDetails(
                base=raw_data["apy"].get("base", 0.0),
                rewards=raw_data["apy"].get("rewards", 0.0),
                total=raw_data["apy"].get("total", 0.0),
            )
        )
        
        return historical_apy_response

    except KeyError as ke:
        logger.error(f"Missing key in historical APY response: {ke}. Raw Data: {raw_data}")
        raise
    except Exception as e:
        logger.error(f"Failed to fetch or parse historical APY data for vault {vault_address} at timestamp {timestamp}: {e}")
        raise

async def get_vault_holder_total_returns(network: str, vault_address: str, holder: str) -> VaultHolderTotalValuesResponse:
    
    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}/holder-total-returns/{holder}"
    
    try:
        logger.debug(f"Fetching Holder Total Returns with URL: {url}")
        
        raw_data = await fetch_with_retry(url, headers=HEADERS)
        
        logger.debug(f"Raw Holder Total Returns Data Received: {raw_data}")
        
        holder_total_returns = VaultHolderTotalValuesResponse(
            usd=raw_data.get("usd", 0.0),
            native=raw_data.get("native", 0.0),
        )
        
        return holder_total_returns

    except KeyError as ke:
        logger.error(f"Missing key in Holder Total Returns response: {ke}. Raw Data: {raw_data}")
        raise
    except Exception as e:
        logger.error(f"Failed to fetch or parse Holder Total Returns data for vault {vault_address}: {e}")
        raise

async def get_vault_holder_events(network: str, vault_address: str, holder: str) -> VaultHolderTotalValuesResponse:
    
    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}/holder-events/{holder}"
    
    try:
        logger.debug(f"Fetching Holder Events with URL: {url}")
        
        raw_data = await fetch_with_retry(url, headers=HEADERS)
        
        logger.debug(f"Raw Holder Events Data Received: {raw_data}")
        
        holder_events = VaultHolderEventsResponse(
            events=[
                VaultHolderEvents(
                    activity=data.get("activity", ""),
                    timestamp=data.get("timestamp", 0),
                    amount=Amount(
                        usd=data["amount"].get("usd", 0.0),
                        native=data["amount"].get("native", "0"),
                    ),
                    positionValue=PositionValue(
                        usd=data["positionValue"].get("usd", 0.0),
                        native=data["positionValue"].get("native", "0"),
                    )
                )
                for data in raw_data["events"]
            ]
        )
        
        return holder_events

    except KeyError as ke:
        logger.error(f"Missing key in Holder Events response: {ke}. Raw Data: {raw_data}")
        raise
    except Exception as e:
        logger.error(f"Failed to fetch or parse Holder Events data for vault {vault_address}: {e}")
        raise

