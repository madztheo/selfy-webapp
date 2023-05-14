import { Header } from "@/components/header/Header";
import styles from "../../styles/Profile.module.scss";
import Image from "next/image";
import selfyBadge from "../../public/images/badges/selfy-badge.svg";
import { Button } from "@/components/button/Button";
import {
  claimBadgeWithSafeAuthKit,
  getAvailableBadges,
  getBadgesToClaim,
  getJsonRPCProvider,
  getNFTProfileUri,
  getSismoProof,
  getSismoProofBytes,
  requestSismoProof,
} from "@/lib/selfy-badge";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../_app";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";
import { Alert } from "@/components/alert/Alert";
import { Loading } from "@/components/loading/Loading";
import { useRouter } from "next/router";

export default function Import() {
  const { sismoVaultId, setSismoVaultId } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [metamaskAddress, setMetamaskAddress] = useState("");
  const [alert, setAlert] = useState({
    message: "",
    error: false,
  });
  const [badges, setBadges] = useState<
    {
      tokenId: string;
      name: string;
      image: any;
      groupId: string;
    }[]
  >([]);
  const [tokenURI, setTokenURI] = useState(
    "https://noun-api.com/beta/pfp?background=0&head=0&body=13&accessory=100&glasses=7"
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const authKit = await initSafeAuthKit();
      await authKit.signIn();
      const addr = authKit.safeAuthData?.eoa!;
      /*getNFTProfileUri(addr).then((uri) => {
        setTokenURI(uri);
      });*/
      const res = await getBadgesToClaim(addr);
      setBadges(res as any);
      const bytesProof = getSismoProofBytes();
      const proof = getSismoProof();
      if (proof && bytesProof) {
        try {
          const authKit = await initSafeAuthKit();
          await authKit.signIn();
          const _proof = proof.proofs[0];
          const claim = _proof.claims ? _proof.claims[0] : undefined;
          if (claim) {
            const res = await fetch("/api/badge/airdrop", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                address: authKit.safeAuthData?.eoa,
                sismoResponse: bytesProof,
                groupId: claim.groupId,
              }),
            });
            if (res.ok) {
              const { tx: txHash } = await res.json();
              const provider = getJsonRPCProvider();
              const tx = await provider.getTransaction(txHash);
              await tx.wait();
              setBadges((prev) =>
                prev.filter((badge) => badge.groupId !== claim.groupId)
              );
              setAlert({
                message: "Badge claimed!",
                error: false,
              });
              setTimeout(() => {
                router.push("/profile");
              }, 2000);
            } else {
              setAlert({
                message: "You cannot claim this badge",
                error: true,
              });
            }
          }
        } catch (error) {
          console.log(error);
          setAlert({
            message: "You cannot claim this badge",
            error: true,
          });
        }
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className={styles.container}>
      <Alert
        message={alert.message}
        visible={!!alert.message}
        isError={alert.error}
        onClose={() => setAlert({ message: "", error: false })}
      />
      <Header
        metamaskAddress={metamaskAddress!}
        onConnectMetamask={(address) => {
          console.log("metamaskAddress", address);
          setMetamaskAddress(address);
        }}
      />
      <div className={styles.content}>
        <div className={styles.left}>
          <h2 className={styles.title}>Claimable badges</h2>
          {!loading && (
            <div className={styles.badges}>
              {badges.map((badge, index) => (
                <div className={styles.badge} key={index}>
                  <div className={styles.badge__icon}>
                    <Image
                      src={badge.image}
                      alt={badge.name}
                      fill
                      style={{
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <p className={styles.badge__name}>{badge.name}</p>
                  <Button
                    className={styles.badge__button}
                    text="Claim"
                    theme="secondary"
                    onClick={async () => {
                      const authKit = await initSafeAuthKit();
                      await authKit.signIn();
                      requestSismoProof(
                        authKit?.safeAuthData?.eoa!,
                        badge.groupId
                      );
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {loading && <Loading className={styles.loader} />}
        </div>
        <div className={styles.right}>
          <div className={styles.profile}>
            <img src={tokenURI} alt="" />
            <Button className={styles.button} text="Mint" theme="white" />
          </div>
        </div>
      </div>
    </div>
  );
}
