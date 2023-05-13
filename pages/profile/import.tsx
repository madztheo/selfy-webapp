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
          <div className={styles.profile__pic}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
