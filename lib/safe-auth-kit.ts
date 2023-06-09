import { SafeAuthKit, Web3AuthModalPack } from "@safe-global/auth-kit";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ethers } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";

const WEB3_AUTH_CLIENT_ID = process.env
  .NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID as string;

export async function initSafeAuthKit() {
  const options: Web3AuthOptions = {
    clientId: WEB3_AUTH_CLIENT_ID,
    web3AuthNetwork: "testnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x5",
      rpcTarget: `https://rpc.ankr.com/eth_goerli`,
    },
    uiConfig: {
      theme: "dark",
      loginMethodsOrder: ["google", "facebook"],
    },
  };

  // https://web3auth.io/docs/sdk/web/modal/initialize#configuring-adapters
  const modalConfig = {
    [WALLET_ADAPTERS.TORUS_EVM]: {
      label: "torus",
      showOnModal: false,
    },
    [WALLET_ADAPTERS.METAMASK]: {
      label: "metamask",
      showOnDesktop: true,
      showOnMobile: false,
    },
  };

  // https://web3auth.io/docs/sdk/web/modal/whitelabel#whitelabeling-while-modal-initialization
  const openloginAdapter = new OpenloginAdapter({
    loginSettings: {
      mfaLevel: "optional",
    },
    adapterSettings: {
      uxMode: "popup",
      whiteLabel: {
        name: "Safe",
      },
    },
  });

  const pack = new Web3AuthModalPack(options, [openloginAdapter], modalConfig);

  const safeAuthKit = await SafeAuthKit.init(pack, {
    txServiceUrl: "https://safe-transaction-goerli.safe.global",
  });

  return safeAuthKit;
}

export async function signMessage(
  safeAuthKit: SafeAuthKit<Web3AuthModalPack>,
  message: string
) {
  const provider = new ethers.providers.Web3Provider(
    safeAuthKit.getProvider()!
  );
  const signer = provider.getSigner();
  return signer.signMessage(message);
}
