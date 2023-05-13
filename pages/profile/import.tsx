import { Header } from "@/components/header/Header";
import styles from "../../styles/Profile.module.scss";
import Image from "next/image";
import selfyBadge from "../../public/images/badges/selfy-badge.svg";
import { Button } from "@/components/button/Button";
import {
  claimBadgeWithSafeAuthKit,
  getAvailableBadges,
  getBadgesToClaim,
  getSismoProof,
  requestSismoProof,
} from "@/lib/selfy-badge";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../_app";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";
import { Alert } from "@/components/alert/Alert";
import { OwnedNft } from "alchemy-sdk";
import { Loading } from "@/components/loading/Loading";

export default function Import() {
  const { sismoVaultId, setSismoVaultId } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    message: "",
    error: false,
  });
  const [badges, setBadges] = useState<
    {
      nft: OwnedNft | undefined | null;
      name: string;
      image: any;
      groupId: string;
    }[]
  >([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const authKit = await initSafeAuthKit();
      await authKit.signIn();
      const addr = authKit.safeAuthData?.eoa!;
      const res = await getBadgesToClaim(addr);
      setBadges(res as any);
      setLoading(false);
    })();
    getSismoProof().then(async (proof) => {
      if (proof) {
        try {
          const authKit = await initSafeAuthKit();
          await authKit.signIn();
          await claimBadgeWithSafeAuthKit(
            authKit,
            proof,
            process.env.NEXT_PUBLIC_SISMO_GROUP_ID!
          );
          setAlert({
            message: "Badge claimed!",
            error: false,
          });
        } catch (error) {
          console.log(error);
          setAlert({
            message: "You cannot claim this badge",
            error: true,
          });
        }
      }
    });
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
        vaultId={sismoVaultId!}
        onSismoConnect={(vaultId) => {
          console.log("vaultId", vaultId);
          setSismoVaultId(vaultId);
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
            <img
              src="https://noun-api.com/beta/pfp?background=0&head=0&body=13&accessory=100&glasses=7"
              alt=""
            />
            <Button className={styles.button} text="Mint" theme="white" />
          </div>
        </div>
      </div>
    </div>
  );
}
