import { HDKey } from '@scure/bip32';
export type HdWallet = {
  mnemonic: string;
  hdkey: HDKey
};
export type Hex = Uint8Array | string;
export type PrivateKeyHex = Hex;
export type PublicKeyHex = Hex;
export type SignatureHex = Hex;
export type HashHex = Hex;
export type DocumentBytes = Bytes;
export type Bytes = Uint8Array;
export type PrivateKeyBytes = Bytes;
export type PublicKeyBytes = Bytes;
export type PrivateKeySeed = PrivateKeyBytes | PrivateKeySecret;
export type PrefixBytes = Bytes;
export type PublicKeyMultibaseBytes = Bytes;
export type SignatureBytes = Bytes;
export type ProofBytes = Bytes;
export type HashBytes = Bytes;
export type MessageBytes = Bytes;
export type KeyBytes = Bytes;
export type PrivateKeySecret = bigint;
export type PrivateKeyPoint = bigint;
export type CompressedPublicKeyParityByte = 0x02 | 0x03;
export type Bip340Encoding = string;
export type Base58BtcPrefix = 'z';
export type PublicKeyMultibaseHeader = `${Base58BtcPrefix}66P`;
export type PublicKeyMultibase = `${PublicKeyMultibaseHeader}${string}`;
export type SchnorrKeyPair = {
  privateKey: PrivateKeyBytes;
  publicKey: PublicKeyBytes;
};
export type DecodedPublicKeyMultibase = {
  prefix: PrefixBytes;
  publicKey: PublicKeyBytes;
  multibase: PublicKeyMultibaseBytes;
};
export type PublicKeyJSON = {
  parity: number;
  x: PublicKeyBytes;
  y: PublicKeyBytes;
  hex: Hex;
  multibase: string;
  prefix: PrefixBytes;
};
export type PrivateKeyJSON = {
  bytes: PrivateKeyBytes;
  secret: PrivateKeySecret;
  point: PrivateKeyPoint
  hex: Hex;
};
export type KeyPairJSON = {
  privateKey: PrivateKeyJSON;
  publicKey: PublicKeyJSON;
};