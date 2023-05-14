import { SafeAuthKit, Web3AuthModalPack } from "@safe-global/auth-kit";
import { BigNumber, ethers } from "ethers";
import selfyBadgeAbi from "../abi/selfy-badge.json";
import selfyProfileAbi from "../abi/selfy-profile.json";
import { AuthType } from "@sismo-core/sismo-connect-react";
import {
  SismoConnect,
  SismoConnectClientConfig,
} from "@sismo-core/sismo-connect-client";
import zkBadgeSelfy from "@/public/images/badges/zk_badge_selfy.svg";
import zkBadgeLucha from "@/public/images/badges/zk_badge_lucha.svg";
import zkBadgeGnosisForum from "@/public/images/badges/zk_badge_gnosis_forum.svg";
import zkBadgeNouns from "@/public/images/badges/zk_badge_nouns.svg";
import zkBadgeRaave from "@/public/images/badges/zk_badge_raave.svg";
import zkBadgeStaniLens from "@/public/images/badges/zk_badge_stani-lens.svg";
import zkBadgePatricio from "@/public/images/badges/zk_badge_patricio.svg";
import zkBadgeDydy from "@/public/images/badges/zk_badge_dydy.svg";

export const config: SismoConnectClientConfig = {
  appId: process.env.NEXT_PUBLIC_SISMO_APP_ID!,
  devMode: {
    // will use the Dev Sismo Data Vault https://dev.vault-beta.sismo.io/
    enabled: true,
  },
};

const sismoConnect = SismoConnect(config);

export function getSelfyBadgeContract(
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SELFY_BADGE_CONTRACT!,
    selfyBadgeAbi,
    provider
  );
  return contract;
}

export function getSelfyProfileContract(
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_SELFY_PROFILE_CONTRACT!,
    selfyProfileAbi,
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

export async function getNFTBadgeIds(address: string) {
  const provider = getJsonRPCProvider();
  const contract = getSelfyBadgeContract(provider);
  const filter = contract.filters.TransferSingle(
    null,
    ethers.constants.AddressZero,
    address
  );
  const mints = await contract.queryFilter(filter);
  return mints.map((mint) => mint.args![3].toString());
}

export async function getNFTProfile(address: string) {
  const provider = getJsonRPCProvider();
  const contract = getSelfyProfileContract(provider);
  const filter = contract.filters.Transfer(
    ethers.constants.AddressZero,
    address
  );
  const mints = await contract.queryFilter(filter);
  const ids = mints.map((mint) => mint.args![2].toString());
  if (!ids || ids.length === 0) {
    return null;
  }
  const tokenId = ids[0];
  return tokenId;
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
  const address = await signer.getAddress();
  const contract = getSelfyBadgeContract(provider);
  const tx = await contract
    .connect(signer)
    .claimWithSismo(sismoResponse, groupId, address);
  await tx.wait();
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

export async function requestSismoProof(address: string, groupId: string) {
  sismoConnect.request({
    auth: {
      authType: AuthType.VAULT,
    },
    claim: {
      groupId,
    },
    signature: {
      message: address,
    },
  });
}

export function getSismoProof() {
  return sismoConnect.getResponse();
}

export function getSismoProofBytes() {
  return sismoConnect.getResponseBytes();
}

export function getTokenIdFromGroupId(groupId: string) {
  const bytesSuffix = "00000000000000000000000000000000";
  return BigInt(groupId + bytesSuffix).toString();
}

export function getAvailableBadges() {
  return [
    {
      name: "Selfy Team",
      image: zkBadgeSelfy,
      groupId: "0xc728917ffa7be874a35d9ef21156f83f",
    },
    {
      name: "rAAVE attendees",
      image: zkBadgeRaave,
      groupId: "0xcde5892370aeb8f486b5d85a519aaa1a",
    },
    {
      name: "Gnosis chain forum membership",
      image: zkBadgeGnosisForum,
      groupId: "0xcc8ebc2306beea2575e1d8fa4565f51c",
    },
    {
      name: "Stani.lens follower",
      image: zkBadgeStaniLens,
      groupId: "0xa2822490455d56197d0453d8803527bb",
    },
    {
      name: "Nouns DAO NFT Holder",
      image: zkBadgeNouns,
      groupId: "0x311ece950f9ec55757eb95f3182ae5e2",
    },
    {
      name: "Events in common with dydymoon.lens",
      image: zkBadgeDydy,
      groupId: "0x7efe7e4daa1ea46579c661d2a8d8493d",
    },
    {
      name: "Luchadores DAO voter",
      image: zkBadgeLucha,
      groupId: "0x13b4551a75e0e672a9a89fca94160429",
    },
    {
      name: "Main events attendees",
      image: zkBadgePatricio,
      groupId: "0x8837536887a7f6458977b10cc464df4b",
    },
  ];
}

export async function getBadges(address: string) {
  const nftIds = await getNFTBadgeIds(address);
  const tokenIds = await getAvailableBadges().map((badge) =>
    getTokenIdFromGroupId(badge.groupId)
  );
  const filteredNfts = nftIds
    .map((id) => (tokenIds.includes(id) ? id : null))
    .filter((id) => id !== null);
  console.log("filteredNfts", filteredNfts);
  return getAvailableBadges()
    .map((badge) => {
      const nftId = filteredNfts.find(
        (id) => id === getTokenIdFromGroupId(badge.groupId)
      );
      if (!nftId) {
        return null;
      }
      return {
        ...badge,
        tokenId: nftId,
      };
    })
    .filter((x) => x !== null);
}

export async function getBadgesToClaim(address: string) {
  const badges = await getBadges(address);
  return getAvailableBadges().filter(
    (badge) => !badges.find((x) => x?.groupId === badge.groupId)
  );
}

export async function hasProfileNFT(address: string) {
  const tokenId = await getNFTProfile(address);
  return tokenId !== undefined;
}

export async function mintProfileNFT(provider: ethers.providers.Web3Provider) {
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const contract = getSelfyProfileContract(provider);
  const tx = await contract.connect(signer).createSelfyProfile(address);
  await tx.wait();
}
