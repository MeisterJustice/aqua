import {
  Address,
  createPublicClient,
  http,
  createWalletClient,
  parseAbiItem,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { GeneratedStrategy } from "../agent/types";
import { publicClient, walletClient } from "./client";
import { STRATEGY } from "./contracts/addresses";
import { StrategyAbi } from "./contracts/abis/Strategy";

export async function createStrategy(strategy: GeneratedStrategy) {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

  try {
    const { request } = await publicClient.simulateContract({
      address: STRATEGY,
      abi: StrategyAbi.abi,
      functionName: "createStrategy",
      args: [
        strategy.name,
        strategy.description,
        strategy.steps.map((step) => ({
          connector: step.connector,
          actionType: step.actionType,
          assetsIn: step.assetsIn,
          assetOut: step.assetOut,
          amountRatio: BigInt(step.amountRatio),
          data: step.data,
        })),
        strategy.minDeposit,
      ],
      account: account.address,
    });
    // Send transaction
    const hash = await walletClient.writeContract(request);

    // Wait for transaction
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      return receipt;
  } catch (error) {
    console.error("Error creating strategy:", error);
    throw error;
  }
}
