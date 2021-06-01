import React, { useState, useEffect } from "react";
import styles from "./Claim.module.css";
import { useWeb3 } from "../../contexts/web3Provider";
import { getProof } from "../../utils/merkleTree";
import { getTokensByMerkleProof, spent } from "../../apis/distributorContract";
import { user1, user2, user3 } from "../../constants/constants";

const Claim = () => {
  const { web3, currentAccountAddress } = useWeb3();

  const users = [user1, user2, user3];

  const [state, setState] = useState([
    {
      proof: [],
      amount: "0",
      loadingMessage: "",
    },
    {
      proof: [],
      amount: "0",
      loadingMessage: "",
    },
    {
      proof: [],
      amount: "0",
      loadingMessage: "",
    },
  ]);

  useEffect(() => {
    const getDistributor = async () => {
      if (currentAccountAddress && web3.signer) {
        const promises = users.map(async (user, i) => {
          let newState = {
            proof: [],
            amount: "0",
            loadingMessage: "",
          };
          const hasSpent = await spent(
            user[0].split(' ')[0],
            web3.signer
          );
          if (!hasSpent) {
            const proof = getProof(
              [user1[0], user2[0], user3[0]],
              user[0]
            );
            newState = {
              proof: proof,
              amount: user[0].split(' ')[1],
              loadingMessage: "",
            }
          }
          return newState;
        })
        const resolved = Promise.all(promises);
        setState(await resolved);
      }
    };
    getDistributor();
  }, [currentAccountAddress, web3.signer]);

  const onClaim = async (index) => {
    let newState = [...state];
    newState[index] = {
      ...newState[index],
      loadingMessage: "Transferring token",
    }
    setState([...newState]);

    await getTokensByMerkleProof(
      web3.signer,
      state[index].proof,
      currentAccountAddress,
      state[index].amount
    );
    alert(`Successfully claimed ${state[index].amount} tokens`);

    newState[index] = {
      ...newState[index],
      loadingMessage: "",
    }
    setState([...newState]);
  };
  return (
    <div className={styles.container}>
      {state.map((userState, index) => {return (
        userState.loadingMessage ? (
          <div className={styles.subContainer}>
            <div className={styles.inputs}>
              <div className={styles.loader}></div>
            </div>
            <div className={styles.inputs}>{userState.loadingMessage}</div>
          </div>
        ) : (
          <div className={styles.subContainer}>
            <div className={styles.inputs}>
              <div>Claim For Address: {users[index][0].split(' ')[0]}</div>
            </div>
            <div className={styles.inputs}>
              <button onClick={() => onClaim(index)} disabled={userState.amount === "0"}>
                {userState.amount === "0" ? "Already Claimed" : "Claim Tokens"}
              </button>
            </div>
          </div>
        )
      )})}
    </div>
  );
};

export default Claim;