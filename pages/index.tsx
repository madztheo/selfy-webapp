import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { useEffect, useState } from "react";
import { SafeAuthKit, Web3AuthModalPack } from "@safe-global/auth-kit";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";
import { Button } from "@/components/button/Button";
import Image from "next/image";
import logo from "@/public/images/selfy-logo.jpeg";

export default function Home() {
  const [safeAuthKit, setSafeAuthKit] =
    useState<SafeAuthKit<Web3AuthModalPack>>();
  const [userInfo, setUserInfo] = useState<any>();
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    (async () => {
      const authKit = await initSafeAuthKit();
      setSafeAuthKit(authKit);
    })();
  }, []);

  const onConnect = async () => {
    if (!safeAuthKit) {
      return;
    }
    await safeAuthKit.signIn();
    const userInfo = await safeAuthKit.getUserInfo();
    setAddress(safeAuthKit.safeAuthData?.eoa);
    setUserInfo(userInfo);
  };

  const onSignOut = async () => {
    if (!safeAuthKit) {
      return;
    }
    await safeAuthKit.signOut();
    setUserInfo(undefined);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!userInfo && (
          <>
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
            <Button
              className={styles.button}
              text="Connect"
              onClick={onConnect}
            />
          </>
        )}
        {userInfo && (
          <>
            {userInfo.profileImage && (
              <div className={styles.logo}>
                <Image
                  src={userInfo.profileImage}
                  alt="Selfy logo"
                  fill
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <p className={styles.name}>{userInfo?.name}</p>
            <p className={styles.email}>{userInfo?.email}</p>
            <p className={styles.address}>{address}</p>
            <Button
              className={styles.button}
              text="Sign out"
              onClick={onSignOut}
            />
          </>
        )}
      </div>
    </div>
  );
}
