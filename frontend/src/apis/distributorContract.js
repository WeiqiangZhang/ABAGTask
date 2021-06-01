import { createContractFromAddress } from "./blockchain";
import { distributorAddress } from "../constants/constants";
import SHA256 from "crypto-js/sha256";
import abi from "../abis/TokenDistributor.json";

export const getTokensByMerkleProof = async (
  signer,
  proof,
  recipientAddress,
  amount
) => {
  const distributorContract = createContractFromAddress(
    distributorAddress,
    abi,
    signer
  );

  const proofData = proof.map(x => '0x' + x.data.toString('hex'));
  const positionData = proof.map(x => '0x' + SHA256(x.position).toString());
  const trx = await distributorContract.getTokensByMerkleProof(
    proofData,
    positionData,
    recipientAddress,
    amount
  );

  return await trx.wait();
};

export const spent = async (recipientAddress, signer) => {
  const distributorContract = createContractFromAddress(
    distributorAddress,
    abi,
    signer
  );

  return await distributorContract.spent(recipientAddress);
};