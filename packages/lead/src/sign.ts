import type { SolanaWalletPayload, WalletAdapter } from "./types.js";

const TC_URL =
  "https://github.com/SegmentoAI/terms-and-conditions/blob/v1.0/terms.md";

/**
 * Returns the message that will be presented to the user for signing.
 * Includes the project name, waitlist intent, and a link to the T&C.
 */
export function getSignMessage(projectName: string): string {
  return (
    `I am signing up to the ${projectName} waitlist. By signing this message I confirm that I have read and agree to the Terms and Conditions: ` +
    TC_URL
  );
}

/**
 * Builds the sign message for the given project, prompts the wallet to sign it,
 * and returns a {@link SolanaWalletPayload} with the address, message, signature,
 * and timestamp.
 */
export async function signMessage(
  wallet: WalletAdapter,
  projectName: string,
): Promise<SolanaWalletPayload> {
  if (!wallet.publicKey) {
    throw new Error("Wallet not connected");
  }

  const message = getSignMessage(projectName);
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = await wallet.signMessage(messageBytes);

  return {
    address: wallet.publicKey.toBase58(),
    message,
    signature: encodeBase58(signatureBytes),
    ts: Date.now(),
  };
}

function encodeBase58(bytes: Uint8Array): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = BigInt(0);
  for (const byte of bytes) {
    num = num * BigInt(256) + BigInt(byte);
  }

  let encoded = "";
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    encoded = ALPHABET[remainder] + encoded;
  }

  for (const byte of bytes) {
    if (byte === 0) encoded = "1" + encoded;
    else break;
  }

  return encoded;
}
