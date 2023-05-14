// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  claimBadge,
  getJsonRPCProvider,
  getSelfyBadgeContract,
} from "@/lib/selfy-badge";
import { Wallet } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { sismoResponse, groupId, address } = req.body;
    const provider = getJsonRPCProvider();
    const wallet = new Wallet(process.env.MINTER_PRIVATE_KEY!, provider);
    const contract = getSelfyBadgeContract(provider);
    const tx = await contract
      .connect(wallet)
      .claimWithSismo(sismoResponse, groupId, address);
    res.status(200).json({ success: true, tx: tx.hash });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Wrong proof" });
  }
}
