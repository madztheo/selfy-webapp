import { Header } from "@/components/header/Header";
import styles from "../../styles/Profile.module.scss";
import Image from "next/image";
import {
  getAvailableBadges,
  getBadges,
  getTokenIdFromGroupId,
} from "@/lib/selfy-badge";
import { useContext, useEffect, useState } from "react";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";
import { OwnedNft } from "alchemy-sdk";
import { Loading } from "@/components/loading/Loading";
import { AuthContext } from "../_app";
import { Button } from "@/components/button/Button";

export default function Profile() {
  const [address, setAddress] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<
    {
      nft: OwnedNft | undefined | null;
      name: string;
      image: any;
      groupId: string;
    }[]
  >([]);
  const { sismoVaultId, setSismoVaultId } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const authKit = await initSafeAuthKit();
      await authKit.signIn();
      const addr = authKit.safeAuthData?.eoa!;
      setAddress(addr);
      const res = await getBadges(addr);
      setBadges(res as any);
      setLoading(false);
    })();
  }, []);

  return (
    <div className={styles.container}>
      <Header
        vaultId={sismoVaultId!}
        onSismoConnect={(vaultId) => {
          console.log("vaultId", vaultId);
          setSismoVaultId(vaultId);
        }}
      />
      <div className={styles.content}>
        <div className={styles.left}>
          <h2 className={styles.title}>My badges</h2>
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
