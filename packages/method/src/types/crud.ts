import { DidUpdatePayload, PrivateKeyBytes, ProofBytes, PublicKeyBytes } from '@did-btc1/common';
import { BeaconService } from '../interfaces/ibeacon.js';
import { Btc1DidDocument } from '../utils/did-document.js';
import { BlockV3 } from './bitcoin.js';

export type DidPlaceholder = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

export type FindNextSignals = {
  block: BlockV3;
  beacons: BeaconService[]
}
export type BeaconUri = string;
export type Btc1Network = 'mainnet' | 'testnet' | 'signet' | 'regtest';


export type Prefix = 'x' | 'k';
export type Bech32Encoding = `${Prefix}1${string}`;
export type RecoveryOptions = {
  seed: string;
  entropy: Uint8Array;
  hd: { mnemonic: string; path: string };
}
export type Bytes = Uint8Array;
export type DocumentBytes = Bytes;
export type KeyPairType = {
  privateKey: PrivateKeyBytes;
  publicKey: PublicKeyBytes;
};

export interface Btc1SidecarData {
  did: string;
};
export type Metadata = {
  updatePayload: DidUpdatePayload;
  proofs?: any;
};

export type SignalSidecarData = Metadata;
export type SignalsMetadata = { [signalId: string]: Metadata; };

export interface SingletonSidecar extends Btc1SidecarData {
  signalsMetadata: SignalsMetadata;
}
export interface CIDAggregateSidecar extends Btc1SidecarData {
  initialDocument: Btc1DidDocument;
  cidUpdates: Array<string>;
}
export interface SMTAggregateSidecar extends Btc1SidecarData {
  // SMTAggregate
  smtProof: ProofBytes;
}
export type SidecarData = SingletonSidecar | CIDAggregateSidecar | SMTAggregateSidecar;
export type UnixTimestamp = number;
export enum DidBtc1IdTypes {
    key = 'key',
    external = 'external'
}
export enum Btc1Networks {
    bitcoin = 0,
    signet = 1,
    regtest = 2,
    testnet3 = 3,
    testnet4 = 4
}

/** Alias type for a publicKeyMultbase encoded as a Bip340 Multikey (z + base58btc(bip340Header + publicKey) */
export type Bip340Encoding = string;

export type GetSigningMethodParams = {
  didDocument: Btc1DidDocument;
  methodId?: string;
};
