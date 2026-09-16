import { Router } from "express";
import { ethers } from "ethers";
import { contract } from "../blockchain/contract.js";
import { writeContract } from "../blockchain/wallet.js";
const router = Router();
/**
 * GET /api/assets/:tokenId
 */
router.get("/:tokenId", async (req, res) => {
    try {
        const tokenId = BigInt(String(req.params.tokenId));
        //@ts-ignore
        const asset = await contract.getAsset(tokenId);
        //@ts-ignore
        const owner = await contract.ownerOf(tokenId);
        return res.json({
            tokenId: tokenId.toString(),
            assetHash: asset.assetHash,
            metadataURI: asset.metadataURI,
            creator: asset.creator,
            createdAt: asset.createdAt.toString(),
            owner
        });
    }
    catch (error) {
        return res.status(404).json({
            error: error.reason || "Asset not found"
        });
    }
});
/**
 * POST /api/assets
 */
router.post("/", async (req, res) => {
    try {
        const { assetHash, metadataURI } = req.body;
        if (!assetHash || !metadataURI) {
            return res.status(400).json({
                error: "assetHash and metadataURI are required"
            });
        }
        //@ts-ignore
        const tx = await writeContract.createAsset(assetHash, metadataURI);
        const receipt = await tx.wait();
        return res.status(201).json({
            success: true,
            transactionHash: receipt.hash
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.reason || error.message
        });
    }
});
export default router;
//# sourceMappingURL=asset.js.map