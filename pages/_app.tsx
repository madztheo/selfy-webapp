import "@/styles/globals.scss";
import { SafeAuthKit, Web3AuthModalPack } from "@safe-global/auth-kit";
import type { AppProps } from "next/app";
import Head from "next/head";
import { createContext, useState } from "react";

export const AuthContext = createContext<{
  safeAuthKit: SafeAuthKit<Web3AuthModalPack> | undefined;
  setSafeAuthKit: (safeAuthKit: SafeAuthKit<Web3AuthModalPack>) => void;
  sismoVaultId: string | undefined;
  setSismoVaultId: (vaultId: string) => void;
}>({
  safeAuthKit: undefined,
  setSafeAuthKit: () => {},
  sismoVaultId: undefined,
  setSismoVaultId: () => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const [safeAuthKit, setSafeAuthKit] = useState<
    SafeAuthKit<Web3AuthModalPack> | undefined
  >(undefined);
  const [sismoVaultId, setSismoVaultId] = useState<string | undefined>(
    undefined
  );

  return (
    <AuthContext.Provider
      value={{
        safeAuthKit,
        setSafeAuthKit: (value) => {
          setSafeAuthKit(value);
        },
        sismoVaultId,
        setSismoVaultId: (value) => {
          setSismoVaultId(value);
        },
      }}
    >
      <Head>
        <title>Selfy</title>
        <meta name="description" content="Selfy web app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
