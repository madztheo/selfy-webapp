// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getJsonRPCProvider } from "@/lib/selfy-badge";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { sismoResponse, address } = req.body;
  const provider = getJsonRPCProvider();

  res.status(200).json({ name: "John Doe" });
}
