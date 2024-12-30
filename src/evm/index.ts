import { privateKeyToAccount } from "viem/accounts";
import { GeneratedStrategy } from "../agent/types";
import { publicClient, walletClient } from "./client";
import { MOONWELL_CONNECTOR, STRATEGY } from "./contracts/addresses";
import { StrategyAbi } from "./contracts/abis/Strategy";
import { logger } from "../logger";
import { ActionTypeMap } from "./types";

export async function createStrategy(strategy: GeneratedStrategy) {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  try {
    const { request } = await publicClient.simulateContract({
      address: account.address,
      abi: StrategyAbi.abi,
      functionName: "createStrategy",
      args: [
        strategy.name,
        strategy.description,
        strategy.steps.map((step) => ({
          connector: MOONWELL_CONNECTOR, //TEMPORARY
          actionType: ActionTypeMap[step.actionType],
          assetsIn: step.assetsIn,
          assetOut: step.assetsIn[0], //TEMPORARY
          amountRatio: BigInt(step.amountRatio),
          data: step.data,
        })),
        strategy.minDeposit,
      ],
      account: account.address,
    });

    const hash = await walletClient.writeContract(request);
    console.log({ hash });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return receipt;
  } catch (error) {
    logger.error("Error creating strategy:", error);
    throw error;
  }
}
