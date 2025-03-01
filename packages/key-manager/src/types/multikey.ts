import { PrivateKeyBytes, PublicKeyBytes } from './shared.js';

export type Bip340MultikeyParams  = {
  id: string;
  controller: string;
} & (
  | {
      privateKey: PrivateKeyBytes;
      publicKey?: never;
    }
  | {
      privateKey?: never;
      publicKey: PublicKeyBytes;
    }
  | {
      privateKey: PrivateKeyBytes;
      publicKey: PublicKeyBytes;
    }
    | {
      privateKey?: never;
      publicKey?: never;
    }
);