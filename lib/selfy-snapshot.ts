import selfySnapshotAbi from "../abi/selfySnapshot.json";
import { Network, Alchemy } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
  network: Network.ETH_GOERLI,
});

export function getSelfySnapshotContract(
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SELFY_SNAPSHOT_CONTRACT!,
    selfySnapshotAbi,
    provider
  );
  return contract;
}

export function getJsonRPCProvider() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL!
  );
  return provider;
}

export async function connectToMetamask() {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  const signer = provider.getSigner();
  return {
    provider,
    signer,
  };
}

export async function getAddress(provider: ethers.providers.Web3Provider) {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return address;
}
