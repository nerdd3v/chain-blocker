import {Router} from "express"
import { ethers } from "ethers";
import { contract } from "../blockchain/contract.js";
import { writeContract } from "../blockchain/wallet.js";


const router:Router = Router();

/**
 * GET /api/identity/:address
 */
router.get("/:address", async (req, res) => {
  try {
    const { address } = req.params;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Invalid Ethereum address"
      });
    }
    //@ts-ignore
    const exists = await contract.identityExists(address);

    if (!exists) {
      return res.status(404).json({
        exists: false,
        message: "Identity not found"
      });
    }
    //@ts-ignore
    const identity = await contract.getIdentity(address);

    return res.json({
      exists: true,
      address,
      didHash: identity.didHash,
      publicKeyHash: identity.publicKeyHash,
      metadataHash: identity.metadataHash,
      createdAt: identity.createdAt.toString(),
      updatedAt: identity.updatedAt.toString(),
      active: identity.active
    });

  }  catch (error: any) {
  console.error("IDENTITY ERROR:", error);

  return res.status(500).json({
    error: error?.message || String(error)
  });
}

  
});


/**
 * GET /api/identity/did/:did
 */
router.get("/did/:did", async (req, res) => {
  try {
    const did = req.params.did;

    const didHash = ethers.keccak256(
      ethers.toUtf8Bytes(did)
    );
    //@ts-ignore
    const owner = await contract.resolveDID(didHash);

    if (owner === ethers.ZeroAddress) {
      return res.status(404).json({
        found: false,
        did,
        didHash
      });
    }

    return res.json({
      found: true,
      did,
      didHash,
      owner
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "DID resolution failed"
    });
  }
});


/**
 * POST /api/identity/register
 *
 * Backend-controlled registration.
 */
router.post("/register", async (req, res) => {
  try {
    const {
      did,
      publicKey,
      metadataHash
    } = req.body;

    if (!did || !publicKey) {
      return res.status(400).json({
        error: "did and publicKey are required"
      });
    }

    const didHash = ethers.keccak256(
      ethers.toUtf8Bytes(did)
    );

    const publicKeyHash = ethers.keccak256(
      ethers.toUtf8Bytes(publicKey)
    );

    const metadata =
      metadataHash || ethers.ZeroHash;
    //@ts-ignore
    const tx = await writeContract.registerIdentity(
      didHash,
      publicKeyHash,
      metadata
    );

    const receipt = await tx.wait();

    return res.status(201).json({
      success: true,
      transactionHash: receipt.hash,
      didHash,
      publicKeyHash,
      metadataHash: metadata
    });

  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.reason || error.message
    });
  }
});


export default router;
