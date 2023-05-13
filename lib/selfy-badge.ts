import { SafeAuthKit, Web3AuthModalPack } from "@safe-global/auth-kit";
import { ethers } from "ethers";
import selfyBadgeAbi from "../abi/selfy-badge.json";
import { SismoConnectResponse } from "@sismo-core/sismo-connect-react";

export function getSelfyBadgeContract(provider: ethers.providers.Web3Provider) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SELFY_BADGE_CONTRACT!,
    selfyBadgeAbi,
    provider
  );
  return contract;
}

export async function claimBadgeWithSafeAuthKit(
  safeAuthKit: SafeAuthKit<Web3AuthModalPack>,
  sismoResponse: string,
  groupId: string
) {
  const provider = new ethers.providers.Web3Provider(
    safeAuthKit.getProvider()!
  );
  await claimBadge(provider, sismoResponse, groupId);
}

export async function claimBadge(
  provider: ethers.providers.Web3Provider,
  sismoResponse: string,
  groupId: string
) {
  console.log("provider", provider);
  const signer = provider.getSigner();
  const contract = getSelfyBadgeContract(provider);
  const tx = await contract
    .connect(signer)
    .claimWithSismo(sismoResponse, groupId, {
      //gasLimit: 1000000,
      //gasPrice: ethers.utils.parseUnits("1", "gwei"),
    });
  await tx.wait();
  console.log("tx", tx);
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
