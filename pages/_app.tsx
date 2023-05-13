import "@/styles/globals.scss";
import { SafeAuthKit, Web3AuthModalPack } from "@safe-global/auth-kit";
import type { AppProps } from "next/app";
import Head from "next/head";
import { createContext, useState } from "react";

export const SafeAuthKitContext = createContext<{
  safeAuthKit: SafeAuthKit<Web3AuthModalPack> | undefined;
  setSafeAuthKit: (safeAuthKit: SafeAuthKit<Web3AuthModalPack>) => void;
}>({
  safeAuthKit: undefined,
  setSafeAuthKit: () => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const [safeAuthKit, setSafeAuthKit] = useState<
    SafeAuthKit<Web3AuthModalPack> | undefined
  >(undefined);

  return (
    <SafeAuthKitContext.Provider
      value={{
        safeAuthKit,
        setSafeAuthKit: (value) => {
          setSafeAuthKit(value);
        },
      }}
    >
      <Head>
        <title>Selfy</title>
        <meta name="description" content="Selfy web app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </SafeAuthKitContext.Provider>
  );
}
