import { config as loadEnv } from "dotenv";
import { ethers } from "ethers";

loadEnv();

async function main() {
  const txHash = process.argv[2];
  if (!txHash) {
    throw new Error("Usage: npm run verify:tx -- <transaction-hash>");
  }

  const rpcUrl = process.env.GETH_RPC_URL ?? "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);

  if (!tx || !receipt) {
    throw new Error(`Transaction not found or not mined: ${txHash}`);
  }

  const block = await provider.getBlock(receipt.blockNumber);

  console.log(JSON.stringify({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    timestamp: block?.timestamp,
    status: receipt.status === 1 ? "success" : "failed",
    gasUsed: receipt.gasUsed.toString(),
    logs: receipt.logs.map((log) => ({
      address: log.address,
      topics: log.topics,
      data: log.data
    }))
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
