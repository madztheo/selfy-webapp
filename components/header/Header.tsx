import styles from "./Header.module.scss";
import Image from "next/image";
import logo from "@/public/images/selfy-logo.jpeg";
import Link from "next/link";
import { Button } from "../button/Button";
import {
  AuthType,
  SismoConnectButton,
  SismoConnectClientConfig,
  SismoConnectResponse,
} from "@sismo-core/sismo-connect-react";
import { config } from "@/lib/selfy-badge";

export function Header({
  onSismoConnect,
}: {
  onSismoConnect: (vaultId: string) => void;
}) {
  return (
    <header className={styles.container}>
      <Link href="/" className={styles.logo}>
        <Image
          src={logo}
          alt=""
          fill
          style={{
            objectFit: "contain",
          }}
        />
      </Link>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/profile">Profile</Link>
          </li>
          <li>
            <Link href="/profile/import">Import</Link>
          </li>
        </ul>
      </nav>
      <div className={styles.button}>
        <SismoConnectButton
          appId={process.env.NEXT_PUBLIC_SISMO_APP_ID!}
          auth={{
            authType: AuthType.VAULT,
          }}
          config={config}
          onResponse={async (response: SismoConnectResponse) => {
            const proof = response.proofs[0];
            const auths = proof.auths;
            const vaultId = auths && auths.length > 0 ? auths[0].userId! : "";
            onSismoConnect(vaultId);
          }}
        />
      </div>
    </header>
  );
}
