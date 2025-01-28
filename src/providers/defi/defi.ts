async function fetchWithRetry(url: string, options: any = {}): Promise<any> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

/**
 * DefiProvider class for interacting with Vaults.FYI-like endpoints.
 */
export class DefiProvider {
  private readonly BASE_URL: string;
  private readonly API_KEY: string;
  private readonly HEADERS: Record<string, string>;

  /**
   * Create a new DefiProvider instance.
   * @param apiKey - Your Vaults.FYI API key.
   */
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("VAULTS_FYI_API_KEY is not set");
    }

    this.API_KEY = apiKey;
    this.BASE_URL = "https://api.vaults.fyi/v1";

    this.HEADERS = {
      "x-api-key": this.API_KEY,
      "Content-Type": "application/json",
    };
  }

  /**
   * Fetch full vault details by network and vault address.
   * @param network - e.g. "mainnet" | "polygon" | "arbitrum" | "optimism" | "base" | "gnosis"
   * @param vaultAddress - The vault contract address.
   * @returns Promise that resolves to a VaultVaultResponse object.
   */
  public async getVaultDetails(
    network: VaultNetworkOptions,
    vaultAddress: string
  ): Promise<VaultResponse> {
    const url = `${this.BASE_URL}/vaults/${network}/${vaultAddress}`;

    try {
      const response: VaultResponse = await fetchWithRetry(url, {
        headers: this.HEADERS,
      });

      // Convert JSON to VaultVaultResponse structure.
      const vaultResponse: VaultResponse = {
        ...response,
        apy: {
          base: this._parseApyPeriod(response.apy?.base),
          rewards: this._parseApyPeriod(response.apy?.rewards),
          total: this._parseApyPeriod(response.apy?.total),
        },
        rewards: (response.rewards || []).map((r: any) => {
          return {
            apy: this._parseApyPeriod(r.apy),
            assetPriceInUsd: r?.assetPriceInUsd ?? 0,
            asset: {
              name: r?.asset?.name,
              assetAddress: r?.asset?.assetAddress,
              symbol: r?.asset?.symbol,
              decimals: r?.asset?.decimals,
            },
          };
        }),
      };

      return vaultResponse;
    } catch (err) {
      console.error(`Failed to fetch or parse vault details:`, err);
      throw err;
    }
  }

  /**
   * Fetch vault APY by network and vault address, with optional interval.
   * @param network - e.g. "mainnet" | "polygon" | "arbitrum" | "optimism" | "base" | "gnosis"
   * @param vaultAddress - The vault contract address.
   * @param interval - One of "1day", "7day", "30day".
   * @returns Promise that resolves to a VaultApyResponse.
   */
  public async getVaultApy(
    network: string,
    vaultAddress: string,
    interval: "1day" | "7day" | "30day" = "1day"
  ): Promise<VaultApyResponse> {
    const validIntervals = ["1day", "7day", "30day"];
    if (!validIntervals.includes(interval)) {
      throw new Error(
        `Invalid interval '${interval}'. Must be one of ${validIntervals}.`
      );
    }

    const url = `${this.BASE_URL}/vaults/${network}/${vaultAddress}/apy`;
    const params = new URLSearchParams({ interval });

    try {
      const response: VaultApyResponse = await fetchWithRetry(
        `${url}?${params.toString()}`,
        {
          headers: this.HEADERS,
        }
      );

      return {
        base: response.base ?? 0.0,
        rewards: response.rewards ?? 0.0,
        total: response.total ?? 0.0,
      };
    } catch (err) {
      console.error(`Failed to fetch or parse APY data:`, err);
      throw err;
    }
  }

  /**
   * Fetch historical TVL data for a specific timestamp.
   * @param network - e.g. "mainnet" | "polygon" | "arbitrum" | "optimism" | "base" | "gnosis"
   * @param vaultAddress - The vault contract address.
   * @param timestamp - Unix timestamp.
   * @returns Promise that resolves to a VaultHistoricalTvlResponse.
   */
  public async getVaultHistoricalTvl(
    network: string,
    vaultAddress: string,
    timestamp: number
  ): Promise<VaultHistoricalTvlResponse> {
    const url = `${this.BASE_URL}/vaults/${network}/${vaultAddress}/historical-tvl/${timestamp}`;

    try {
      const response = await fetchWithRetry(url, { headers: this.HEADERS });

      return response;
    } catch (err) {
      console.error(`Failed to fetch or parse historical TVL data:`, err);
      throw err;
    }
  }

  /**
   * Fetch historical APY data for a specific timestamp.
   * @param network - e.g. "mainnet" | "polygon" | "arbitrum" | "optimism" | "base" | "gnosis"
   * @param vaultAddress - The vault contract address.
   * @param timestamp - Unix timestamp.
   * @param interval - One of "1day", "7day", "30day".
   * @returns Promise that resolves to a VaultHistoricalApyResponse.
   */
  public async getVaultHistoricalApy(
    network: string,
    vaultAddress: string,
    timestamp: number,
    interval: "1day" | "7day" | "30day" = "1day"
  ): Promise<VaultHistoricalApyResponse> {
    const validIntervals = ["1day", "7day", "30day"];
    if (!validIntervals.includes(interval)) {
      throw new Error(
        `Invalid interval '${interval}'. Must be one of ${validIntervals}.`
      );
    }

    const url = `${this.BASE_URL}/vaults/${network}/${vaultAddress}/historical-apy/${timestamp}`;
    const params = new URLSearchParams({ interval });

    try {
      const response = await fetchWithRetry(`${url}?${params.toString()}`, {
        headers: this.HEADERS,
      });

      return response;
    } catch (err) {
      console.error(`Failed to fetch or parse historical APY data:`, err);
      throw err;
    }
  }

  /**
   * Fetch the holder's total returns for a given vault.
   * @param network - e.g. "mainnet" | "polygon" | "arbitrum" | "optimism" | "base" | "gnosis"
   * @param vaultAddress - The vault contract address.
   * @param holder - The holder address.
   * @returns Promise that resolves to a VaultHolderTotalValuesResponse.
   */
  public async getVaultHolderTotalReturns(
    network: string,
    vaultAddress: string,
    holder: string
  ): Promise<VaultHolderTotalValuesResponse> {
    const url = `${this.BASE_URL}/vaults/${network}/${vaultAddress}/holder-total-returns/${holder}`;

    try {
      const response = await fetchWithRetry(url, { headers: this.HEADERS });

      return response;
    } catch (err) {
      console.error(`Failed to fetch or parse Holder Total Returns data:`, err);
      throw err;
    }
  }

  /**
   * Fetch the holder's events for a given vault.
   * @param network - e.g. "mainnet" | "polygon" | "arbitrum" | "optimism" | "base" | "gnosis"
   * @param vaultAddress - The vault contract address.
   * @param holder - The holder address.
   * @returns Promise that resolves to a VaultHolderEventsResponse.
   */
  public async getVaultHolderEvents(
    network: string,
    vaultAddress: string,
    holder: string
  ): Promise<VaultHolderEventsResponse> {
    const url = `${this.BASE_URL}/vaults/${network}/${vaultAddress}/holder-events/${holder}`;

    try {
      const response = await fetchWithRetry(url, { headers: this.HEADERS });

      return { events: response };
    } catch (err) {
      console.error(`Failed to fetch or parse Holder Events data:`, err);
      throw err;
    }
  }

  private _parseApyPeriod(obj: any): VaultApyPeriod {
    return {
      day_1: obj?.["1day"] ?? 0.0,
      day_7: obj?.["7day"] ?? 0.0,
      day_30: obj?.["30day"] ?? 0.0,
    };
  }
}
