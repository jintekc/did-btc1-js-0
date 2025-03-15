export type Hex = Uint8Array | string;
export type PrivateKeyHex = Hex;
export type PublicKeyHex = Hex;
export type SignatureHex = Hex;
export type HashHex = Hex;

export type Bytes = Uint8Array;
export type PrivateKeyBytes = Bytes;
export type PublicKeyBytes = Bytes;
export type PrefixBytes = Bytes;
export type PublicKeyMultibaseBytes = Bytes;
export type SignatureBytes = Bytes;
export type ProofBytes = Bytes;
export type HashBytes = Bytes;
export type MessageBytes = Bytes;

export type PrivateKeySecret = bigint;
export type PrivateKeyPoint = bigint;
export type CompressedPublicKeyParityByte = 0x02 | 0x03;

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

export type DID = 'did';
export type MethodName = string;
export type MethodSpecificId = string;
export type DecentralizedIdentifierExplicit = `${DID}:${MethodName}:${MethodSpecificId}`;
export type DecentralizedIdentifier = string;
export type Btc1MethodName = 'btc1';
export type Btc1DeterministicPrefix = 'k';
export type Btc1ExternalPrefix = 'x';
export type Btc1Prefix = `${Btc1DeterministicPrefix | Btc1ExternalPrefix}1`;
export type Bech32Id = string;
export type Btc1Id = `${Btc1Prefix}${Bech32Id}`
export type Btc1IdentifierExplicit = `${DID}:${Btc1MethodName}:${Btc1Id}`;
export type Btc1Identifier = string;
export type Controller = Btc1Identifier;
export type Id = 'initialKey';
export type FullId = `${Controller}#${Id}`;

export type TwoDigits = `${number}${number}`;
export type ThreeDigits = `${number}${number}${number}`;
export type Year = `${1 | 2}${ThreeDigits}`;
export type Month = TwoDigits;
export type Day = TwoDigits;
export type Hours = TwoDigits;
export type Minutes = TwoDigits;
export type Seconds = TwoDigits;
export type UtcTimestamp = `${Year}-${Month}-${Day}T${Hours}:${Minutes}:${Seconds}`;
export type TzOffset = `${Hours}:${Minutes}`;
export type DateTimestamp = `${UtcTimestamp}Z` | `${UtcTimestamp}-${TzOffset}`;

export type JSONObject = { [key: string]: any };
export type CanonicalizableObject = Record<string, any>;

export type DocumentBytes = Bytes;
export type Bip340Encoding = string;

export enum DidBtc1IdTypes {
  key = 'key',
  external = 'external'
}
export enum Btc1Networks {
  mainnet = 'mainnet',
  testnet = 'testnet',
  signet = 'signet',
  regtest = 'regtest'
}
export type UnixTimestamp = number;
export type BeaconUri = string;
export type Btc1Network = 'mainnet' | 'testnet' | 'signet' | 'regtest';
export type DidPlaceholder = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
export type KeyIdentifier = string;

export type KeyBytes = Bytes;

export type PrivateKeySeed = PrivateKeyBytes | PrivateKeySecret;

export type PublicKeyJSON = {
    parity: number;
    x: PublicKeyBytes;
    y: PublicKeyBytes;
    hex: Hex;
    multibase: string;
    prefix: PrefixBytes;
}
export type PrivateKeyJSON = {
    bytes: PrivateKeyBytes;
    secret: PrivateKeySecret;
    point: PrivateKeyPoint
    hex: Hex;
}
export type KeyPairJSON = {
    privateKey: PrivateKeyJSON;
    publicKey: PublicKeyJSON;
}
