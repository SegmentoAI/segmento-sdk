/** Minimal interface representing a Solana wallet adapter */
export interface WalletAdapter {
  publicKey: { toBase58(): string } | null;
  signMessage(message: Uint8Array): Promise<Uint8Array | { signature: Uint8Array }>;
}
