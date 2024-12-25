import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});
export const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});
