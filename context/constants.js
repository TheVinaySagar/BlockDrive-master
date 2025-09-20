import { ethers } from "ethers";
import Web3Modal from "web3modal";

//INTERNAL IMPORT
import FileSharingDApp from "./FileSharingDApp.json";

//FILESHARING
export const FILE_SHARING_ADDRESS =
  "0x2d9b4EEaA6fA32f3487fc4e2033E5C5780ac8688";
const FILE_SHARING_ABI = FileSharingDApp.abi;

const fetchContract = (signer, ABI, ADDRESS) =>
  new ethers.Contract(ADDRESS, ABI, signer);

export const web3Provider = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    return provider;
  } catch (error) {
    console.log(error);
  }
};

export const FILE_SHARING_Contract = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const contract = fetchContract(
      provider,
      FILE_SHARING_ABI,
      FILE_SHARING_ADDRESS
    );
    return contract;
  } catch (error) {
    console.log(error);
  }
};

export const getBalance = async () => {
  try {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    return await signer.getBalance();
  } catch (error) {
    console.log(error);
  }
};
