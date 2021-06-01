import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

export const getWeb3Provider = (provider) => {
  return new ethers.providers.Web3Provider(provider);
};

export const getMetamaskProvider = async () => {
  return await detectEthereumProvider();
};

export const metamaskConnected = async (provider) => {
  return provider.isConnected();
};

export const connectToMetamask = async (provider) => {
  return await provider.request({ method: "eth_requestAccounts" });
};

export const onAccountChange = (provider, callback) => {
  provider.on("accountsChanged", callback);
};

export const onChainChange = (provider, callback) => {
  provider.on("chainChanged", callback);
};

export const getAccounts = async (provider) => {
  return await provider.listAccounts();
};

export const getSigner = async (provider) => {
  return await provider.getSigner();
};

export const getContractFactory = (interface_, bytecode, signer) => {
  return new ethers.ContractFactory(interface_, bytecode, signer);
};

export const createContractFromAddress = (address, abi, signer) => {
  return new ethers.Contract(address, abi, signer);
};

export const ethToWei = (eth) => {
  return ethers.utils.parseEther(eth);
};

export const weiToEth = (wei) => {
  return ethers.utils.formatEther(wei);
};

export const getAddress = (address) => {
  return ethers.utils.getAddress(address);
};