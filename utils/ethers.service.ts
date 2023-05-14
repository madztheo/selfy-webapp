import { ethers } from 'ethers';

import snapshotAbi from '../abi/selfy-snapshot.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Ethers class to handle the connection to the blockchain
class Ethers {
  provider: ethers.providers.JsonRpcProvider;
  signer: ethers.providers.JsonRpcSigner;
  utils: typeof ethers.utils;
  snapshotContract : ethers.Contract;

  // constructor instantiantes the underlying ethers provider and signer
  // and connects to the contract
  constructor() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.utils = ethers.utils;
    this.signer = this.provider.getSigner();

    this.snapshotContract = new ethers.Contract(process.env.NEXT_PUBLIC_SELFY_SNAPSHOT_CONTRACT as unknown as string,snapshotAbi, this.signer) 
    this.connect();
  }

  async signText(text: string) {
    return this.signer.signMessage(text);
  }

  async connect() {
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

    }
  }
}

export default Ethers;
