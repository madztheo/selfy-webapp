import { Header } from "@/components/header/Header";
import styles from "../../styles/Profile.module.scss";
import Image from "next/image";
import {
  getAvailableBadges,
  getBadges,
  getNFTProfileUri,
  getTokenIdFromGroupId,
} from "@/lib/selfy-badge";
import { useContext, useEffect, useState } from "react";
import { initSafeAuthKit } from "@/lib/safe-auth-kit";
import { Loading } from "@/components/loading/Loading";
import { AuthContext } from "../_app";
import { Button } from "@/components/button/Button";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<
    {
      tokenId: string;
      name: string;
      image: any;
      groupId: string;
    }[]
  >([]);
  const { sismoVaultId, setSismoVaultId } = useContext(AuthContext);
  const [metamaskAddress, setMetamaskAddress] = useState("");
  const { address, setAddress } = useContext(AuthContext);
  const [tokenURI, setTokenURI] = useState(
    "https://noun-api.com/beta/pfp?background=0&head=0&body=13&accessory=100&glasses=7"
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      let addr = address;
      if (!addr) {
        const authKit = await initSafeAuthKit();
        await authKit.signIn();
        addr = authKit.safeAuthData?.eoa!;
        setAddress(addr);
      }
      /*getNFTProfileUri(addr).then((uri) => {
        setTokenURI(uri);
      });*/
      const res = await getBadges(addr);
      setBadges(res as any);
      setLoading(false);
    })();
  }, []);

  return (
    <div className={styles.container}>
      <Header
        metamaskAddress={metamaskAddress!}
        onConnectMetamask={(address) => {
          console.log("metamaskAddress", address);
          setMetamaskAddress(address);
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
                    <img src={badge.image} alt={badge.name} />
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
            <img src={tokenURI} alt="" />
            <Button className={styles.button} text="Mint" theme="white" />
          </div>
        </div>
      </div>
    </div>
  );
}
