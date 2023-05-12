import Head from "next/head";
import styles from "@/styles/Sismo.module.scss";
import { useEffect, useState } from "react";
import { Button } from "@/components/button/Button";
import Image from "next/image";
import logo from "@/public/images/selfy-logo.jpeg";
import { Alert } from "@/components/alert/Alert";
import { Input } from "@/components/input/Input";
import {
  SismoConnectButton,
  AuthType,
  SismoConnectClientConfig,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";

const config: SismoConnectClientConfig = {
  appId: process.env.NEXT_PUBLIC_SISMO_APP_ID!,
  devMode: {
    // will use the Dev Sismo Data Vault https://dev.vault-beta.sismo.io/
    enabled: true,
    // overrides a group with these addresses
    devGroups: [
      {
        groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
        data: {
          //"0x14bD21Bd869beb87A5910421D5ce29c972905a37": 1,
          "0x3162dC1A02869F653cedCEB5792D79E902B705fA": 2,
        },
      },
    ],
  },
};

export default function Sismo() {
  const [proof, setProof] = useState<string>();

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
              //Request proofs for this groupId
              claim={{
                groupId: "0x42c768bb8ae79e4c5c05d3b51a4ec74a",
              }}
              auth={{
                authType: AuthType.VAULT,
              }}
              signature={{
                message: "Your message",
              }}
              config={config}
              onResponse={async (response: SismoConnectResponse) => {
                console.log("Sismo response");
                console.log(response);
                //Send the response to your server to verify it
                //thanks to the @sismo-core/sismo-connect-server package
              }}
              onResponseBytes={async (bytes: string) => {
                console.log("Sismo response");
                console.log(bytes);
                setProof(bytes);
                //Send the response to your contract to verify it
                //thanks to the @sismo-core/sismo-connect-solidity package
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
