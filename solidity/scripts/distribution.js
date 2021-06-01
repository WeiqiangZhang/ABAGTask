const SHA256 = require("crypto-js/sha256");
const { MerkleTree } = require("merkletreejs");

const hre = require("hardhat");

async function main() {
  await hre.run("compile");

  const accounts = await hre.ethers.getSigners();
  const user1 = accounts[0];
  const user2 = accounts[1];
  const user3 = accounts[2];
  const user1Address = await user1.getAddress();
  const user2Address = await user2.getAddress();
  const user3Address = await user3.getAddress();

  const DistributeToken = await hre.ethers.getContractFactory("DistributeToken");

  const distributeToken = await DistributeToken.deploy(hre.ethers.utils.parseEther("15100"));

  await distributeToken.deployed();

  console.log("DistributeToken deployed at: ", distributeToken.address);

  const hashedLeaves = [
    user1Address.toLowerCase() + " " + hre.ethers.utils.parseEther("5000"),
    user2Address.toLowerCase() + " " + hre.ethers.utils.parseEther("10000"),
    user3Address.toLowerCase() + " " + hre.ethers.utils.parseEther("100"),
  ].map(SHA256);
  const tree = new MerkleTree(hashedLeaves, SHA256);
  const root = "0x" + tree.getRoot().toString("hex");

  // We get the contract to deploy
  const TokenDistributor = await hre.ethers.getContractFactory("TokenDistributor");
  const tokenDistributor = await TokenDistributor.deploy(distributeToken.address, root, true);

  await tokenDistributor.deployed();

  await distributeToken.transfer(tokenDistributor.address, hre.ethers.utils.parseEther("15100"));

  console.log("TokenDistributor deployed to:", tokenDistributor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });