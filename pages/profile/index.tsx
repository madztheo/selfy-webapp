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
import Ethers from "@/utils/ethers.service";
import { Alert } from "@/components/alert/Alert";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
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
  const [tokenURI, setTokenURI] = useState("");
  const [alert, setAlert] = useState({
    message: "",
    error: false,
  });

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
      getNFTProfileUri(addr).then((uri) => {
        setTokenURI(uri);
      });
      const res = await getBadges(addr);
      setBadges(res as any);
      setLoading(false);
    })();
  }, []);

  const mintSnapshot = async () => {
    try {
      const ethers = new Ethers();
      setMinting(true);
      const tx = await ethers.snapshotContract.mint(tokenURI, {
        value: ethers.utils.parseEther("0.01"),
      });
      await tx.wait();
      setAlert({
        message: "Minted successfully",
        error: false,
      });
    } catch (error) {
      console.log(error);
      setAlert({
        message: "Unable to mint at the moment",
        error: true,
      });
    }
    setMinting(false);
  };

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
            <Button
              className={styles.button}
              text="Mint"
              theme="white"
              onClick={mintSnapshot}
              loading={minting}
              loadingText="Minting..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
