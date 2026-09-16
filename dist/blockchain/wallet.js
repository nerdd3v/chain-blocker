import "dotenv/config";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "./abi.js";
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
    throw new Error("PRIVATE_KEY is missing");
}
export const wallet = new ethers.Wallet(privateKey, provider);
export const writeContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
//# sourceMappingURL=wallet.js.map