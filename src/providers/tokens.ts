import WebSocket from "ws";
import {
  TokenAttributes,
  TokenEVMData,
  TokenInformation,
  TokenSolanaData,
} from "./types/token";
// import dotenv and use it
import { config as getEnvs } from "dotenv";

getEnvs();

const bitqueryToken = process.env.BITQUERY_ACCESS_TOKEN;
const coingeckoApiKey = process.env.COINGECKO_API_KEY;

if (!bitqueryToken) {
  throw new Error("Missing environment variables BITQUERY_ACCESS_TOKEN");
}

if (!coingeckoApiKey) {
  throw new Error("Missing environment variables COINGECKO_API_KEY");
}

/**
 * A class for subscribing to newly created tokens on a given chain
 * (via Bitquery GraphQL) and performing risk checks at intervals.
 */
export class NewTokenMonitor {
  private EvmTokens: string[] = [];
  private SolanaTokens: string[] = [];

  private BITQUERY_TOKEN = bitqueryToken;
  private BITQUERY_ENDPOINT = "wss://streaming.bitquery.io/eap";

  private COINGECKO_ENDPOINT =
    "https://pro-api.coingecko.com/api/v3/onchain/networks/";

  private bitqueryBaseConnection: WebSocket | null = null;
  private bitquerySolanaConnection: WebSocket | null = null;

  constructor() {
    this._subscribeToNewBASETokenCreations();
    this._subscribeToNewSOLANATokenCreations();
  }

  /**
   * Retrieve all EVM tokens.
   * @returns An array of strings representing EVM tokens.
   */
  public getAllEvmTokens(): string[] {
    return this.EvmTokens;
  }

  /**
   * Retrieve all Solana tokens.
   * @returns An array of strings representing Solana tokens.
   */
  public getAllSolanaTokens(): string[] {
    return this.SolanaTokens;
  }

  /**
   * Fetch token metrics by token address and network.
   * @param tokenAddress - The address of the token.
   * @param network - The network of the token, e.g., "base" or "solana".
   * @returns Promise that resolves to a TokenAttributes object or undefined.
   */
  public async fetchTokenMetrics(
    tokenAddress: string,
    network: "base" | "solana"
  ): Promise<TokenAttributes | undefined> {
    try {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-cg-pro-api-key": coingeckoApiKey!,
        },
      };

      const res = await fetch(
        `${this.COINGECKO_ENDPOINT}${network}/tokens/${tokenAddress}`,
        options
      );
      const data: TokenInformation = await res.json();

      console.log(data);

      return data?.data?.attributes;
    } catch (err) {
      console.error(`Failed to fetch token metrics for ${tokenAddress}`, err);
      throw err;
    }
  }

  private _isNotWeth(tokenAddress?: string): boolean {
    if (!tokenAddress) return false;

    return tokenAddress !== "0x4200000000000000000000000000000000000006";
  }

  private _subscribeToNewBASETokenCreations() {
    const subscriptionQuery = `
        subscription {
            EVM(network: base) {
                Events(
                orderBy: {descending: Block_Time}
                where: {Log: {Signature: {Name: {is: "PoolCreated"}}}}
                ) {
                Transaction {
                    Hash
                }
                Block {
                    Time
                }
                Log {
                    Signature {
                    Name
                    }
                }
                Arguments {
                    Name
                    Type
                    Value {
                    ... on EVM_ABI_Integer_Value_Arg {
                        integer
                    }
                    ... on EVM_ABI_String_Value_Arg {
                        string
                    }
                    ... on EVM_ABI_Address_Value_Arg {
                        address
                    }
                    ... on EVM_ABI_BigInt_Value_Arg {
                        bigInteger
                    }
                    ... on EVM_ABI_Bytes_Value_Arg {
                        hex
                    }
                    ... on EVM_ABI_Boolean_Value_Arg {
                        bool
                    }
                    }
                }
                }
            }
            }

        `;

    const fullUrl = `${this.BITQUERY_ENDPOINT}?token=${this.BITQUERY_TOKEN}`;

    this.bitqueryBaseConnection = new WebSocket(fullUrl, ["graphql-ws"]);

    this.bitqueryBaseConnection.on("open", () => {
      console.log("Connected to Bitquery BASE.");

      const initMessage = JSON.stringify({ type: "connection_init" });
      this.bitqueryBaseConnection?.send(initMessage);
    });

    this.bitqueryBaseConnection.on("message", (rawData) => {
      const response = JSON.parse(rawData.toString());

      if (response.type === "connection_ack") {
        console.log("Connection acknowledged by server.");

        const subscriptionMessage = JSON.stringify({
          type: "start",
          id: "1",
          payload: {
            query: subscriptionQuery,
          },
        });

        this.bitqueryBaseConnection?.send(subscriptionMessage);
        console.log("Subscription message for BASE sent.");
      }

      if (response.type === "data") {
        const subscriptionData = response.payload.data;

        if (subscriptionData?.EVM) {
          const data: TokenEVMData[] = subscriptionData?.EVM?.Events;
          console.log("Received EVM data from Bitquery BASE:");
          const token = data[0].Arguments?.find(
            (arg) =>
              (arg.Name === "token0" || arg.Name === "token1") &&
              this._isNotWeth(arg.Value.address)
          );

          if (token) {
            this.EvmTokens.push(token.Value?.address || "");
          }
        }
      }

      // Keep-alive message
      if (response.type === "ka") {
        // No action required
      }

      // On error
      if (response.type === "error") {
        console.error("Error message received:", response);
      }
    });

    this.bitqueryBaseConnection.on("close", () => {
      console.log("Disconnected from Bitquery.");
    });

    this.bitqueryBaseConnection.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });
  }

  private _subscribeToNewSOLANATokenCreations() {
    const subscriptionQuery = `
        subscription {
                Solana {
                    Instructions(
                    where: {Transaction: {Result: {Success: true}}, Instruction: {Program: {Method: {is: "initializeUserWithNonce"}, Address: {is: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"}}}}
                    ) {
                    Instruction {
                        Accounts {
                        Address
                        }
                    }
                    }
                }
            }
        `;

    const fullUrl = `${this.BITQUERY_ENDPOINT}?token=${this.BITQUERY_TOKEN}`;

    this.bitquerySolanaConnection = new WebSocket(fullUrl, ["graphql-ws"]);

    this.bitquerySolanaConnection.on("open", () => {
      console.log("Connected to Bitquery SOLANA.");

      const initMessage = JSON.stringify({ type: "connection_init" });
      this.bitquerySolanaConnection?.send(initMessage);
    });

    this.bitquerySolanaConnection.on("message", (rawData) => {
      const response = JSON.parse(rawData.toString());

      if (response.type === "connection_ack") {
        console.log("Connection acknowledged by server.");

        const subscriptionMessage = JSON.stringify({
          type: "start",
          id: "1",
          payload: {
            query: subscriptionQuery,
          },
        });

        this.bitquerySolanaConnection?.send(subscriptionMessage);
        console.log("Subscription message for SOLANA sent.");
      }

      if (response.type === "data") {
        const subscriptionData = response.payload.data;

        if (subscriptionData?.Solana) {
          const data: TokenSolanaData[] =
            subscriptionData?.solana?.Instructions;
          console.log(
            "Received SOLANA data from Bitquery:",
            data[0].Instruction.Accounts
          );
        }
      }

      // Keep-alive message
      if (response.type === "ka") {
        // No action required
      }

      // On error
      if (response.type === "error") {
        console.error("Error message received:", response);
      }
    });

    this.bitquerySolanaConnection.on("close", () => {
      console.log("Disconnected from Bitquery.");
    });

    this.bitquerySolanaConnection.on("error", (error) => {
      console.error("WebSocket Error:", error);
    });
  }
}
