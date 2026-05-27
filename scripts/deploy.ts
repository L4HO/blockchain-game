import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Network: ${network.name}`);
  console.log(`Deploying with: ${deployer.address}`);

  const factory = await ethers.getContractFactory("GameAccessLog");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deployment = {
    network: network.name,
    chainId: network.config.chainId,
    address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    txHash: contract.deploymentTransaction()?.hash
  };

  mkdirSync("deployments", { recursive: true });
  writeFileSync(
    join("deployments", `${network.name}.json`),
    `${JSON.stringify(deployment, null, 2)}\n`
  );

  console.log(`GameAccessLog deployed to: ${address}`);
  console.log(`Deployment saved: deployments/${network.name}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
