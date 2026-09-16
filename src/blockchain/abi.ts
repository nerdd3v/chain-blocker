export const CONTRACT_ABI = [
  // Identity
  "function registerIdentity(bytes32 didHash, bytes32 publicKeyHash, bytes32 metadataHash)",
  "function updateIdentity(bytes32 newPublicKeyHash, bytes32 newMetadataHash)",
  "function deactivateIdentity()",
  "function reactivateIdentity(address user)",
  "function getIdentity(address user) view returns (bytes32 didHash, bytes32 publicKeyHash, bytes32 metadataHash, uint256 createdAt, uint256 updatedAt, bool active)",
  "function resolveDID(bytes32 didHash) view returns (address)",
  "function identityExists(address) view returns (bool)",

  // Verification
  "function recordVerification(address user, bytes32 proofHash)",

  // Assets
  "function createAsset(bytes32 assetHash, string metadataURI) returns (uint256)",
  "function getAsset(uint256 tokenId) view returns (bytes32 assetHash, string metadataURI, address creator, uint256 createdAt)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",

  // Permissions
  "function grantPermission(uint256 tokenId, address user, uint8 permission, uint256 expiresAt)",
  "function revokePermission(uint256 tokenId, address user)",
  "function hasPermission(uint256 tokenId, address user, uint8 requiredPermission) view returns (bool)",
  "function getPermission(uint256 tokenId, address user) view returns (uint8 permission, uint256 expiresAt, bool active)",

  // Ownership
  "function getOwnershipHistoryLength(uint256 tokenId) view returns (uint256)",
  "function getOwnershipRecord(uint256 tokenId, uint256 index) view returns (address previousOwner, address newOwner, uint256 timestamp)",

  // ERC721
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];
