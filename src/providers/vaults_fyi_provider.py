import asyncio
import logging
from typing import List
from src.utils.api_client import fetch_with_retry
from src.providers.types.vaults_fyi_types import VaultResponse, ApyPeriod, ApyBreakdown

API_ENDPOINTS = {
    "VAULTS_FYI": "https://api.vaults.fyi/v1",
}

logger = logging.getLogger("VAULTS_FYI_PROVIDER")


async def get_vault_details(network: str, vault_address: str) -> VaultResponse:
    url = f"{API_ENDPOINTS['VAULTS_FYI']}/vaults/{network}/{vault_address}"
    
    try:
        raw_data = await fetch_with_retry(url)
        
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
            name=raw_data["name"],
            address=raw_data["address"],
            network=raw_data["network"],
            protocol=raw_data["protocol"],
            tvlDetails=(
                type(raw_data["tvlDetails"])(
                    **raw_data["tvlDetails"]
                )
            ),
            tvl=raw_data["tvl"],
            liquid=raw_data["liquid"],
            locked=raw_data["locked"],
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
            ]
        )

        return vault_response

    except Exception as e:
        logger.error(f"Failed to fetch or parse vault details for {vault_address}: {e}")
        raise

# Example usage:
async def main():
    network = "base"
    vault_addr = "0x1234abcd..."  # Example vault address
    vault = await get_vault_details(network, vault_addr)
    print(vault)

if __name__ == "__main__":
    asyncio.run(main())
