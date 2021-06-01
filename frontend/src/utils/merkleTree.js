import { MerkleTree } from "merkletreejs";
import SHA256 from "crypto-js/sha256";

export const constructTree = (leaves) => {
  const tree = createTree(leaves);

  return "0x" + tree.getRoot().toString("hex");
};

export const getProof = (leaves, leaf) => {
  const tree = createTree(leaves);

  const leafHash = SHA256(leaf);

  return tree.getProof(leafHash);
};

const createTree = (leaves) => {
  const hashedLeaves = leaves.map(SHA256);
  const tree = new MerkleTree(hashedLeaves, SHA256);

  return tree;
};