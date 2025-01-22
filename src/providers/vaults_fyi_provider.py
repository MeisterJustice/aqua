import os
import asyncio
import logging
from typing import List
from src.utils.api_client import fetch_with_retry
from src.providers.types.vaults_fyi_types import VaultResponse, ApyPeriod, ApyBreakdown, VaultApyResponse
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

# Example usage:
async def main():
    network = "base"
    vault_addr = "0x1234abcd..."  # Example vault address
    vault = await get_vault_details(network, vault_addr)
    print(vault)

if __name__ == "__main__":
    asyncio.run(main())
