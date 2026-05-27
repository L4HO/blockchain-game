import { expect } from "chai";
import { ethers } from "hardhat";

describe("GameAccessLog", function () {
  async function deployFixture() {
    const [owner, operator, player] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("GameAccessLog");
    const contract = await factory.deploy();

    return { contract, owner, operator, player };
  }

  it("records access after a mobile ID verification result", async function () {
    const { contract, player } = await deployFixture();
    const mobileIdHash = ethers.id("mobile-id-proof:student-001");
    const issuedAt = 1_772_000_000;

    await expect(contract.grantAccess(player.address, mobileIdHash, issuedAt))
      .to.emit(contract, "AccessGranted")
      .withArgs(player.address, mobileIdHash, issuedAt);

    const access = await contract.getAccess(player.address);
    expect(access.player).to.equal(player.address);
    expect(access.mobileIdHash).to.equal(mobileIdHash);
    expect(access.active).to.equal(true);
  });

  it("records a game transaction only for an authorized player", async function () {
    const { contract, player } = await deployFixture();
    const mobileIdHash = ethers.id("mobile-id-proof:student-001");
    const sessionId = ethers.id("session-001");
    const gameId = ethers.id("basketball-free-throw");
    const playedAt = 1_772_000_100;

    await contract.grantAccess(player.address, mobileIdHash, 1_772_000_000);

    await expect(contract.recordGame(player.address, sessionId, gameId, 30, playedAt))
      .to.emit(contract, "GamePlayed")
      .withArgs(player.address, sessionId, gameId, 30, playedAt);

    const play = await contract.getPlay(sessionId);
    expect(play.player).to.equal(player.address);
    expect(play.score).to.equal(30);
  });

  it("rejects game records without access", async function () {
    const { contract, player } = await deployFixture();

    await expect(
      contract.recordGame(player.address, ethers.id("session-002"), ethers.id("game"), 1, 1)
    ).to.be.revertedWithCustomError(contract, "AccessRequired");
  });

  it("allows only operators to write records", async function () {
    const { contract, operator, player } = await deployFixture();
    const operatorContract = contract.connect(operator) as typeof contract;

    await expect(
      operatorContract.grantAccess(player.address, ethers.id("proof"), 1)
    ).to.be.revertedWithCustomError(contract, "NotOperator");

    await contract.setOperator(operator.address, true);

    await expect(operatorContract.grantAccess(player.address, ethers.id("proof"), 1))
      .to.emit(contract, "AccessGranted");
  });
});
