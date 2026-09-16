import { Router, type Request, type Response } from "express";
import { ethers } from "ethers";
import { contract } from "../blockchain/contract.js";
import { writeContract } from "../blockchain/wallet.js";

const router: Router = Router();

/**
 * POST /api/assets
 *
 * Create an NFT asset.
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { assetHash, metadataURI } = req.body;

    if (!assetHash || !metadataURI) {
      return res.status(400).json({
        error: "assetHash and metadataURI are required"
      });
    }

    if (!ethers.isHexString(assetHash, 32)) {
      return res.status(400).json({
        error: "assetHash must be a bytes32 hex value"
      });
    }
    //@ts-ignore

    const tx = await writeContract.createAsset(
      assetHash,
      metadataURI
    );

    const receipt = await tx.wait();

    let tokenId: string | null = null;

    for (const log of receipt.logs) {
      try {
        const parsed = writeContract.interface.parseLog(log);

        if (
          parsed &&
          parsed.name === "AssetCreated"
        ) {
          tokenId = parsed.args.tokenId.toString();
          break;
        }
      } catch {
        // Ignore logs from other contracts
      }
    }

    return res.status(201).json({
      success: true,
      tokenId,
      transactionHash: receipt.hash,
      assetHash,
      metadataURI
    });

  } catch (error: any) {
    console.error("CREATE ASSET ERROR:", error);

    return res.status(500).json({
      error: error.reason || error.shortMessage || error.message
    });
  }
});


/**
 * GET /api/assets/:tokenId
 */
router.get("/:tokenId", async (req: Request, res: Response) => {
  try {
    const tokenId = BigInt(req.params.tokenId as string);
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

  } catch (error: any) {
    console.error("GET ASSET ERROR:", error);

    return res.status(404).json({
      error: error.reason || error.shortMessage || error.message
    });
  }
});


/**
 * GET /api/assets/:tokenId/owner
 */
router.get(
  "/:tokenId/owner",
  async (req: Request, res: Response) => {
    try {
      const tokenId = BigInt(
        req.params.tokenId as string
      );
    //@ts-ignore

      const owner = await contract.ownerOf(tokenId);

      return res.json({
        tokenId: tokenId.toString(),
        owner
      });

    } catch (error: any) {
      console.error("OWNER ERROR:", error);

      return res.status(404).json({
        error: error.reason ||
          error.shortMessage ||
          error.message
      });
    }
  }
);


/**
 * GET /api/assets/:tokenId/permissions/:user
 */
router.get(
  "/:tokenId/permissions/:user",
  async (req: Request, res: Response) => {
    try {
      const tokenId = BigInt(
        req.params.tokenId as string
      );

      const user = req.params.user;

      if (!ethers.isAddress(user)) {
        return res.status(400).json({
          error: "Invalid Ethereum address"
        });
      }
    //@ts-ignore
    
      const permission =await contract.getPermission(
          tokenId,
          user
        );

      return res.json({
        tokenId: tokenId.toString(),
        user,
        permission: permission.permission.toString(),
        expiresAt: permission.expiresAt.toString(),
        active: permission.active
      });

    } catch (error: any) {
      console.error("GET PERMISSION ERROR:", error);

      return res.status(500).json({
        error: error.reason ||
          error.shortMessage ||
          error.message
      });
    }
  }
);


/**
 * GET /api/assets/:tokenId/permissions/:user/check
 */
router.get(
  "/:tokenId/permissions/:user/check",
  async (req: Request, res: Response) => {
    try {
      const tokenId = BigInt(
        req.params.tokenId as string
      );

      const user = req.params.user;

      const requiredPermission = Number(
        req.query.permission
      );

      if (!ethers.isAddress(user)) {
        return res.status(400).json({
          error: "Invalid Ethereum address"
        });
      }

      if (
        !Number.isInteger(requiredPermission) ||
        requiredPermission < 1 ||
        requiredPermission > 4
      ) {
        return res.status(400).json({
          error: "permission must be between 1 and 4"
        });
      }
    //@ts-ignore

      const allowed =await contract.hasPermission(
          tokenId,
          user,
          requiredPermission
        );

      return res.json({
        tokenId: tokenId.toString(),
        user,
        requiredPermission,
        allowed
      });

    } catch (error: any) {
      console.error("CHECK PERMISSION ERROR:", error);

      return res.status(500).json({
        error: error.reason ||
          error.shortMessage ||
          error.message
      });
    }
  }
);


/**
 * POST /api/assets/:tokenId/permissions
 */
router.post(
  "/:tokenId/permissions",
  async (req: Request, res: Response) => {
    try {
      const tokenId = BigInt(
        req.params.tokenId as string
      );

      const {
        user,
        permission,
        expiresAt = 0
      } = req.body;

      if (!ethers.isAddress(user)) {
        return res.status(400).json({
          error: "Invalid user address"
        });
      }

      const permissionValue = Number(permission);

      if (
        !Number.isInteger(permissionValue) ||
        permissionValue < 1 ||
        permissionValue > 4
      ) {
        return res.status(400).json({
          error: "permission must be between 1 and 4"
        });
      }
    //@ts-ignore

      const tx =await writeContract.grantPermission(
          tokenId,
          user,
          permissionValue,
          BigInt(expiresAt)
        );

      const receipt = await tx.wait();

      return res.json({
        success: true,
        transactionHash: receipt.hash,
        tokenId: tokenId.toString(),
        user,
        permission: permissionValue,
        expiresAt: BigInt(expiresAt).toString()
      });

    } catch (error: any) {
      console.error("GRANT PERMISSION ERROR:", error);

      return res.status(500).json({
        error: error.reason ||
          error.shortMessage ||
          error.message
      });
    }
  }
);


/**
 * DELETE /api/assets/:tokenId/permissions/:user
 */
router.delete(
  "/:tokenId/permissions/:user",
  async (req: Request, res: Response) => {
    try {
      const tokenId = BigInt(
        req.params.tokenId as string
      );

      const user = req.params.user;

      if (!ethers.isAddress(user)) {
        return res.status(400).json({
          error: "Invalid user address"
        });
      }
    //@ts-ignore

      const tx =await writeContract.revokePermission(
          tokenId,
          user
        );

      const receipt = await tx.wait();

      return res.json({
        success: true,
        transactionHash: receipt.hash,
        tokenId: tokenId.toString(),
        user
      });

    } catch (error: any) {
      console.error("REVOKE PERMISSION ERROR:", error);

      return res.status(500).json({
        error: error.reason ||
          error.shortMessage ||
          error.message
      });
    }
  }
);


/**
 * GET /api/assets/:tokenId/history
 */
router.get(
  "/:tokenId/history",
  async (req: Request, res: Response) => {
    try {
      const tokenId = BigInt(
        req.params.tokenId as string
      );
    //@ts-ignore

      const length =await contract.getOwnershipHistoryLength(
          tokenId
        );

      const history = [];

      for (
        let i = 0n;
        i < length;
        i++
      ) {
    //@ts-ignore

        const record =await contract.getOwnershipRecord(
            tokenId,
            i
          );

        history.push({
          index: i.toString(),
          previousOwner: record.previousOwner,
          newOwner: record.newOwner,
          timestamp: record.timestamp.toString()
        });
      }

      return res.json({
        tokenId: tokenId.toString(),
        history
      });

    } catch (error: any) {
      console.error("HISTORY ERROR:", error);

      return res.status(404).json({
        error: error.reason ||
          error.shortMessage ||
          error.message
      });
    }
  }
);

export default router;
