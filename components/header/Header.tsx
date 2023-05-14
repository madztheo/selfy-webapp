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
import { config, connectToMetamask } from "@/lib/selfy-badge";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";
import { useRouter } from "next/router";
import cn from "classnames";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/pages/_app";

function formatVaultId(vaultId: string) {
  return vaultId.slice(0, 6) + "..." + vaultId.slice(-4);
}

export function Header({
  metamaskAddress,
  onConnectMetamask,
}: {
  metamaskAddress: string;
  onConnectMetamask: (address: string) => void;
}) {
  const { safeAuthKit, setSafeAuthKit } = useContext(AuthContext);
  const { address, setAddress } = useContext(AuthContext);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { provider, signer } = await connectToMetamask();
      const address = await signer.getAddress();
      onConnectMetamask(address);
    })();
  }, []);

  const onConnectWallet = async () => {
    const { provider, signer } = await connectToMetamask(true);
    const address = await signer.getAddress();
    onConnectMetamask(address);
  };

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
          <li
            className={cn({
              [styles.selected]:
                router.asPath.startsWith("/profile") &&
                !router.asPath.startsWith("/profile/import"),
            })}
          >
            <Link href="/profile">Profile</Link>
          </li>
          <li
            className={cn({
              [styles.selected]: router.asPath.startsWith("/profile/import"),
            })}
          >
            <Link href="/profile/import">Import</Link>
          </li>
        </ul>
      </nav>
      {!metamaskAddress && (
        <Button
          className={styles.button}
          theme="secondary"
          text="Connect wallet"
          onClick={onConnectWallet}
        />
      )}
      {metamaskAddress && (
        <p className={styles.vault__id}>
          Metamask: <em>{formatVaultId(metamaskAddress)}</em>
        </p>
      )}
      {
        <button
          className={styles.sign__out}
          onClick={async () => {
            if (safeAuthKit?.safeAuthData?.eoa) {
              const authKit = await initSafeAuthKit();
              await authKit.signOut();
            }
            setAddress("");
            router.replace("/");
          }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8.502 11.5a1.002 1.002 0 1 1 0 2.004 1.002 1.002 0 0 1 0-2.004Z" />
            <path d="M12 4.354v6.651l7.442-.001L17.72 9.28a.75.75 0 0 1-.073-.976l.073-.084a.75.75 0 0 1 .976-.073l.084.073 2.997 2.997a.75.75 0 0 1 .073.976l-.073.084-2.996 3.004a.75.75 0 0 1-1.134-.975l.072-.085 1.713-1.717-7.431.001L12 19.25a.75.75 0 0 1-.88.739l-8.5-1.502A.75.75 0 0 1 2 17.75V5.75a.75.75 0 0 1 .628-.74l8.5-1.396a.75.75 0 0 1 .872.74Zm-1.5.883-7 1.15V17.12l7 1.236V5.237Z" />
            <path d="M13 18.501h.765l.102-.006a.75.75 0 0 0 .648-.745l-.007-4.25H13v5.001ZM13.002 10 13 8.725V5h.745a.75.75 0 0 1 .743.647l.007.102.007 4.251h-1.5Z" />
          </svg>
        </button>
      }
    </header>
  );
}
