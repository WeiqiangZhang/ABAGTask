import { createContext, useContext, useState, useEffect } from "react";
import {
  getWeb3Provider,
  getMetamaskProvider,
  connectToMetamask,
  metamaskConnected,
  getSigner,
  onAccountChange,
  onChainChange,
  getAddress,
} from "../apis/blockchain";

const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [isMetamaskConnected, setMetamaskConnected] = useState(false);
  const [currentAccountAddress, setCurrentAccountAddress] = useState("");
  const [web3, setWeb3] = useState({
    initialized: false,
    metamaskProvider: null,
    web3Provider: null,
    signer: null,
    metamaskInstalled: true,
    networkId: 1,
  });

  useEffect(() => {
    const getProvider = async () => {
      const metamaskProvider = await getMetamaskProvider();

      if (metamaskProvider) {
        await connectToMetamask(metamaskProvider);

        const web3Provider = getWeb3Provider(metamaskProvider);

        onChainChange(metamaskProvider, async (chainId) => {
          setWeb3((prev) => ({
            ...prev,
            networkId: parseInt(chainId),
          }));
        });
        onAccountChange(metamaskProvider, async (accounts) => {
          setCurrentAccountAddress(
            accounts.length ? getAddress(accounts[0]) : ""
          );
          setMetamaskConnected(accounts.length);
        });

        const signer = await getSigner(web3Provider);
        const address = await signer.getAddress();
        const isConnected = await metamaskConnected(metamaskProvider);

        setCurrentAccountAddress(address);
        setMetamaskConnected(isConnected);
        setWeb3((prev) => ({
          ...prev,
          initialized: true,
          metamaskProvider,
          web3Provider,
          signer,
          metamaskInstalled: true,
          networkId: parseInt(window.ethereum.chainId),
        }));
      }
      setMetamaskConnected(false);
      setWeb3((prev) => ({
        ...prev,
        metamaskInstalled: false,
      }));
    };
    getProvider();
  }, []);

  const value = { isMetamaskConnected, currentAccountAddress, web3 };
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

const useWeb3 = () => {
  const context = useContext(Web3Context);

  if (context === undefined) {
    throw new Error("useWeb3 must be used whin a Web3Provider");
  }
  return context;
};

export { Web3Provider, useWeb3 };
