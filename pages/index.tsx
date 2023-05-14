import React from "react";
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
import { AuthContext } from "./_app";
import { ApolloLens } from "@/lib/lens";
import { ApolloClient, ApolloLink, InMemoryCache, from } from "@apollo/client";
import { defaultOptions, errorLink, httpLink } from "@/utils/apollo-client";
import {
  getJsonRPCProvider,
  hasProfileNFT,
  mintProfileNFT,
} from "@/lib/selfy-badge";
import { ethers } from "ethers";

export default function Home() {
  const { safeAuthKit, setSafeAuthKit } = useContext(AuthContext);
  const { address, setAddress } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState<any>();
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lensAuthToken, setLensAuthToken] = useState();
  const [lens, setLens] = useState<ApolloLens>();
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

    const authLink = new ApolloLink((operation, forward) => {
      const token = lensAuthToken;
      console.log("jwt token:", token);

      // Use the setContext method to set the HTTP headers.
      operation.setContext({
        headers: {
          "x-access-token": token ? `Bearer ${token}` : "",
        },
      });

      // Call the next link in the middleware chain.
      return forward(operation);
    });

    const apolloClient = new ApolloClient({
      link: from([errorLink, authLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: defaultOptions,
    });

    const apolloLens = new ApolloLens(apolloClient);
    setLens(apolloLens);
  }, []);

  const onLensLogin = async () => {
    const authenticatedResult = await lens?.lensLogin();
    setLensAuthToken(authenticatedResult.accessToken);

    const profile = await lens?.getProfile();

    setAddress(profile.data.profile.ownedBy);
    setUserInfo(userInfo);
    setLoading(false);
    setAlert({
      message: `Connected with address ${profile.data.profile.ownedBy}`,
      error: false,
    });
    setTimeout(() => {
      router.push("/profile");
    }, 2000);
  };

  const onConnect = async () => {
    if (!safeAuthKit) {
      return;
    }
    setLoading(true);
    await safeAuthKit.signIn();
    const userInfo = await safeAuthKit.getUserInfo();
    setAddress(safeAuthKit.safeAuthData?.eoa as string);
    setUserInfo(userInfo);
    const skipProfileNFTMint = await hasProfileNFT(
      safeAuthKit.safeAuthData?.eoa as string
    );
    if (!skipProfileNFTMint) {
      const res = await fetch("/api/profile/airdrop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: safeAuthKit.safeAuthData?.eoa as string,
        }),
      });
      if (res.ok) {
        const { tx: txHash } = await res.json();
        const provider = getJsonRPCProvider();
        const tx = await provider.getTransaction(txHash);
        await tx.wait();
        setLoading(false);
        setAlert({
          message: `Connected with address ${safeAuthKit.safeAuthData?.eoa}`,
          error: false,
        });
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setAlert({
          message: `Unable to complete your profile creation`,
          error: true,
        });
      }
    } else {
      setAlert({
        message: `Connected with address ${safeAuthKit.safeAuthData?.eoa}`,
        error: false,
      });
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    }
    setLoading(false);
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
        <Button
          className={styles.button}
          text="Log in with Lens"
          onClick={onLensLogin}
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
