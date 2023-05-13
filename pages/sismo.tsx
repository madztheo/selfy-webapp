import Head from "next/head";
import styles from "@/styles/Sismo.module.scss";
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/button/Button";
import Image from "next/image";
import logo from "@/public/images/selfy-logo.jpeg";
import {
  SismoConnectButton,
  AuthType,
  SismoConnectClientConfig,
} from "@sismo-core/sismo-connect-react";
import { SafeAuthKitContext } from "./_app";
import { claimBadgeWithSafeAuthKit } from "@/lib/selfy-badge";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";

const config: SismoConnectClientConfig = {
  appId: process.env.NEXT_PUBLIC_SISMO_APP_ID!,
  devMode: {
    // will use the Dev Sismo Data Vault https://dev.vault-beta.sismo.io/
    enabled: true,
    // overrides a group with these addresses
    /*devGroups: [
      {
        groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
        data: {
          //"0x14bD21Bd869beb87A5910421D5ce29c972905a37": 1,
          "0x3162dC1A02869F653cedCEB5792D79E902B705fA": 2,
        },
      },
    ],*/
  },
};

export default function Sismo() {
  const [proof, setProof] = useState<string>();
  const { safeAuthKit } = useContext(SafeAuthKitContext);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <Image
              src={logo}
              alt="Selfy logo"
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </div>
          <div className={styles.sismo__button}>
            <SismoConnectButton
              appId={process.env.NEXT_PUBLIC_SISMO_APP_ID!}
              claim={{
                groupId: process.env.NEXT_PUBLIC_SISMO_GROUP_ID!,
              }}
              auth={{
                authType: AuthType.VAULT,
              }}
              signature={{
                message: safeAuthKit?.safeAuthData?.eoa || "",
              }}
              config={config}
              onResponseBytes={async (bytes: string) => {
                console.log("Sismo response");
                const authKit = await initSafeAuthKit();
                await authKit.signIn();
                claimBadgeWithSafeAuthKit(
                  authKit,
                  bytes,
                  process.env.NEXT_PUBLIC_SISMO_GROUP_ID!
                ).then(
                  (res) => {
                    alert("Badge claimed!");
                  },
                  (err) => {
                    alert("Failed to claim badge");
                    console.log(err);
                  }
                );
              }}
            />
          </div>
        </div>
        <div className={styles.right}>
          <p className={styles.proof}>{proof}</p>
        </div>
      </div>
    </div>
  );
}
