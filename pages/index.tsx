import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { useContext, useEffect, useState } from "react";
import { initSafeAuthKit, signMessage } from "@/lib/safe-auth-kit";
import { Button } from "@/components/button/Button";
import Image from "next/image";
import logo from "@/public/images/selfy-logo.jpeg";
import { Alert } from "@/components/alert/Alert";
import { Input } from "@/components/input/Input";
import { useRouter } from "next/router";
import { SafeAuthKitContext } from "./_app";

export default function Home() {
  const { safeAuthKit, setSafeAuthKit } = useContext(SafeAuthKitContext);
  const [userInfo, setUserInfo] = useState<any>();
  const [address, setAddress] = useState<string>();
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    message: string;
    error: boolean;
  }>({
    message: "",
    error: false,
  });
  const router = useRouter();

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
    setLoading(true);
    await safeAuthKit.signIn();
    const userInfo = await safeAuthKit.getUserInfo();
    setAddress(safeAuthKit.safeAuthData?.eoa);
    setUserInfo(userInfo);
    setLoading(false);
    setAlert({
      message: `Connected with address ${safeAuthKit.safeAuthData?.eoa}`,
      error: false,
    });
    setTimeout(() => {
      router.push("/profile");
    }, 2000);
  };

  const onSignOut = async () => {
    if (!safeAuthKit) {
      return;
    }
    setLoading(true);
    await safeAuthKit.signOut();
    setUserInfo(undefined);
    setLoading(false);
  };

  const onSignMessage = async () => {
    if (!safeAuthKit) {
      return;
    }
    const signature = await signMessage(safeAuthKit, message);
    console.log("signature", signature);
    setAlert({
      message: `Signature: ${signature}`,
      error: false,
    });
    setTimeout(() => {
      router.push("/sismo");
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <Alert
        message={alert.message}
        isError={alert.error}
        onClose={() => {
          setAlert({
            message: "",
            error: false,
          });
        }}
        visible={!!alert.message}
      />
      <div className={styles.content}>
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
          loading={loading}
          loadingText="Connecting..."
        />
        {/*userInfo && (
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
            <Input
              containerClassName={styles.input}
              type="text"
              value={message}
              placeholder="Message to sign"
              onChange={(val: string) => {
                setMessage(val);
              }}
            />
            <Button
              className={styles.button}
              text="Sign message"
              onClick={onSignMessage}
            />
            <Button
              className={styles.button}
              text="Sign out"
              onClick={onSignOut}
              loading={loading}
              loadingText="Signing out..."
            />
          </>
            )*/}
      </div>
    </div>
  );
}
