import { ethers } from "ethers";
import { MobileIdVerifier } from "../auth/mobile-id";

const ABI = [
  "function grantAccess(address player, bytes32 mobileIdHash, uint64 issuedAt)",
  "function recordGame(address player, bytes32 sessionId, bytes32 gameId, uint256 score, uint64 playedAt)",
  "function getAccess(address player) view returns (tuple(address player, bytes32 mobileIdHash, uint64 issuedAt, bool active))",
  "event AccessGranted(address indexed player, bytes32 indexed mobileIdHash, uint64 issuedAt)",
  "event GamePlayed(address indexed player, bytes32 indexed sessionId, bytes32 indexed gameId, uint256 score, uint64 playedAt)"
] as const;

export type GameAccessServiceOptions = {
  rpcUrl: string;
  contractAddress: string;
  signerPrivateKey?: string;
};

export class GameAccessService {
  private readonly contract: ethers.Contract;

  constructor(
    options: GameAccessServiceOptions,
    private readonly mobileIdVerifier: MobileIdVerifier
  ) {
    const provider = new ethers.JsonRpcProvider(options.rpcUrl);
    const signer = options.signerPrivateKey
      ? new ethers.Wallet(options.signerPrivateKey, provider)
      : provider.getSigner();

    this.contract = new ethers.Contract(options.contractAddress, ABI, signer);
  }

  async grantAccessFromMobileId(player: string, token: string, requiredAge = 0) {
    const result = await this.mobileIdVerifier.verify({
      provider: "mock",
      token,
      requiredAge
    });

    if (!result.verified) {
      throw new Error(result.reason ?? "Mobile ID verification failed");
    }

    const tx = await this.contract.grantAccess(player, result.subjectHash, result.issuedAt);
    return tx.wait();
  }

  async recordGame(player: string, gameName: string, score: number) {
    const now = Math.floor(Date.now() / 1000);
    const sessionId = ethers.id(`session:${player}:${gameName}:${now}`);
    const gameId = ethers.id(gameName);

    const tx = await this.contract.recordGame(player, sessionId, gameId, score, now);
    return tx.wait();
  }
}
