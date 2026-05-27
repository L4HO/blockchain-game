import "@nomicfoundation/hardhat-toolbox";
import { config as loadEnv } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

loadEnv();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    gethLocal: {
      url: process.env.GETH_RPC_URL ?? "http://127.0.0.1:8545",
      chainId: Number(process.env.GETH_CHAIN_ID ?? 1337)
    }
  }
};

export default config;
