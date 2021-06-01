const { expect } = require("chai");
const SHA256 = require("crypto-js/sha256");
const { MerkleTree } = require("merkletreejs");
const hre = require("hardhat");

let TokenDistributor, tokenDistributor;
let DistributeToken, distributeToken;
let user1, user2, user3, user1Address, user2Address, user3Address;
describe("DistributeToken", function() {
  beforeEach(async function () {
    const accounts = await hre.ethers.getSigners();
    user1 = accounts[0];
    user2 = accounts[1];
    user3 = accounts[2];
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    user3Address = await user3.getAddress();
  
    DistributeToken = await hre.ethers.getContractFactory("DistributeToken");
  
    distributeToken = await DistributeToken.deploy(hre.ethers.utils.parseEther("15100"));
  
    await distributeToken.deployed();
    
    const hashedLeaves = [
      user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"),
      user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"),
      user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100"),
    ].map(SHA256);
    const tree = new MerkleTree(hashedLeaves, SHA256);
    const root = "0x" + tree.getRoot().toString("hex");
  
    // We get the contract to deploy
    TokenDistributor = await hre.ethers.getContractFactory("TokenDistributor");
    tokenDistributor = await TokenDistributor.deploy(distributeToken.address, root, true);
  
    await tokenDistributor.deployed();
  
    await distributeToken.transfer(tokenDistributor.address, hre.ethers.utils.parseEther("15100"));
  });
  it("Should correctly distribute token based on proof", async function() {
    const leaves = [user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"), user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"), user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100")];
    const promises = leaves.map(async (leaf) => {
      const hashedLeaves = [
        user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"),
        user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"),
        user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100"),
      ].map(SHA256);
      const tree = new MerkleTree(hashedLeaves, SHA256);
      const leafHash = SHA256(leaf);
  
      const proof = tree.getProof(leafHash);
      const proofData = proof.map(x => '0x' + x.data.toString('hex'));
      const positionData = proof.map(x => '0x' + SHA256(x.position).toString());
      await tokenDistributor.getTokensByMerkleProof(
        proofData,
        positionData,
        leaf.split(" ")[0],
        leaf.split(" ")[1]
      );
      expect(await distributeToken.balanceOf(leaf.split(" ")[0])).to.equal(leaf.split(" ")[1]);
    });
    await Promise.all(promises);
  });
  it("Should revert when collecting more than once", async function() {
    const leaves = [user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"), user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"), user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100")];
    const promises = leaves.map(async (leaf) => {
      const hashedLeaves = [
        user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"),
        user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"),
        user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100"),
      ].map(SHA256);
      const tree = new MerkleTree(hashedLeaves, SHA256);
      const leafHash = SHA256(leaf);

      const proof = tree.getProof(leafHash);
      const proofData = proof.map(x => '0x' + x.data.toString('hex'));
      const positionData = proof.map(x => '0x' + SHA256(x.position).toString());
      await tokenDistributor.getTokensByMerkleProof(
        proofData,
        positionData,
        leaf.split(" ")[0],
        leaf.split(" ")[1]
      );
      await expect(tokenDistributor.getTokensByMerkleProof(
        proofData,
        positionData,
        leaf.split(" ")[0],
        leaf.split(" ")[1]
      )).to.be.reverted;
      expect(await distributeToken.balanceOf(leaf.split(" ")[0])).to.equal(leaf.split(" ")[1]);
    });
    await Promise.all(promises);
  });
  it("Should revert ignore incorrect proofs", async function() {
    const leaf = user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000");
    const incorrectLeaf = user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000");
    const hashedLeaves = [
      user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"),
      user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"),
      user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100"),
    ].map(SHA256);
    const tree = new MerkleTree(hashedLeaves, SHA256);
    const leafHash = SHA256(leaf);

    const proof = tree.getProof(leafHash);
    const proofData = proof.map(x => '0x' + x.data.toString('hex'));
    const positionData = proof.map(x => '0x' + SHA256(x.position).toString());
    await tokenDistributor.getTokensByMerkleProof(
      proofData,
      positionData,
      incorrectLeaf.split(" ")[0],
      incorrectLeaf.split(" ")[1]
    );
    expect(await distributeToken.balanceOf(incorrectLeaf.split(" ")[0])).to.equal(0);
  });
});
