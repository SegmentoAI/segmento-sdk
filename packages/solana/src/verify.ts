import { PublicKey } from "@solana/web3.js";

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodeBase58(encoded: string): Uint8Array {
  let num = BigInt(0);
  for (const char of encoded) {
    const idx = BASE58_ALPHABET.indexOf(char);
    if (idx < 0) throw new Error(`Invalid base58 character: ${char}`);
    num = num * BigInt(58) + BigInt(idx);
  }

  const bytes: number[] = [];
  while (num > BigInt(0)) {
    bytes.unshift(Number(num & BigInt(0xff)));
    num >>= BigInt(8);
  }

  for (const char of encoded) {
    if (char === "1") bytes.unshift(0);
    else break;
  }

  return new Uint8Array(bytes);
}

/**
 * Verifies an Ed25519 signature produced by a Solana wallet.
 *
 * @param message       Plaintext message that was signed (UTF-8)
 * @param walletAddress Base58-encoded public key (wallet address)
 * @param signature     Base58-encoded signature returned by the wallet
 * @returns true if the signature is valid for the given message and address
 */
export async function verifySignature(
  message: string,
  walletAddress: string,
  signature: string,
): Promise<boolean> {
  try {
    const publicKeyBytes = new Uint8Array(new PublicKey(walletAddress).toBytes());
    const signatureBytes = new Uint8Array(decodeBase58(signature));
    const messageBytes = new Uint8Array(new TextEncoder().encode(message));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    return await crypto.subtle.verify(
      "Ed25519",
      cryptoKey,
      signatureBytes,
      messageBytes,
    );
  } catch {
    return false;
  }
}
