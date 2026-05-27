import { readFileSync } from "node:fs";
import { ethers, network } from "hardhat";

type Deployment = {
  address: string;
};

async function main() {
  const deployment = JSON.parse(
    readFileSync(`deployments/${network.name}.json`, "utf8")
  ) as Deployment;
  const [operator, maybePlayer] = await ethers.getSigners();
  const player = maybePlayer ?? operator;
  const contract = await ethers.getContractAt("GameAccessLog", deployment.address, operator);

  const now = Math.floor(Date.now() / 1000);
  const mobileIdHash = ethers.id(`mock-mobile-id:${player.address}:adult:true`);
  const sessionId = ethers.id(`session:${player.address}:${now}`);
  const gameId = ethers.id("mini-arcade-basketball");

  const grantTx = await contract.grantAccess(player.address, mobileIdHash, now);
  const grantReceipt = await grantTx.wait();

  const playTx = await contract.recordGame(player.address, sessionId, gameId, 42, now + 3);
  const playReceipt = await playTx.wait();

  console.log("Access transaction");
  console.log(`  hash: ${grantTx.hash}`);
  console.log(`  block: ${grantReceipt?.blockNumber}`);
  console.log("Game transaction");
  console.log(`  hash: ${playTx.hash}`);
  console.log(`  block: ${playReceipt?.blockNumber}`);
  console.log("Verification command");
  console.log(`  npm run verify:tx -- ${playTx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
