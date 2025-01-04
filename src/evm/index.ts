import { privateKeyToAccount } from "viem/accounts";
import { GeneratedStrategy } from "../agent/types";
import { publicClient, walletClient } from "./client";
import { StrategyAbi } from "./contracts/abis/Strategy";
import { logger } from "../logger";
import { ActionTypeMap } from "./types";
import { STRATEGY } from "./contracts/addresses";

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
          actionType: ActionTypeMap[step.actionType],
          assetsIn: step.assetsIn,
          assetOut: step.assetOut,
          amountRatio: BigInt(step.amountRatio),
          data: step.data || "0x",
        })),
        BigInt(strategy.minDeposit),
      ],
      account,
    });

    logger.info("Simulated contract call successfully", { request });

    const hash = await walletClient.writeContract(request);
    logger.info("Transaction submitted", { hash });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      timeout: 60_000, // 1 minute timeout
      confirmations: 1,
    });

    logger.info("Transaction confirmed", {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    });

    return receipt;
  } catch (error) {
    logger.error("Error creating strategy:", {
      message: error,
      stack: error,
    });
    throw new Error(`Failed to create strategy: ${error}`);
  }
}
