import { PrivateKeyBytes, ProofBytes } from '@did-btc1/cryptosuite';
import { BlockV3 } from '../../bitcoin/types.js';
import { Btc1DidDocument, Btc1VerificationMethod } from '../did-document.js';
import { DidResolutionOptions, DidUpdatePayload } from './interface.js';
import { BeaconService } from '../beacon/interface.js';
import { DidBtc1Identifier } from './create.js';

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
export type InvokePayloadParams = {
  identifier: string;
  updatePayload: DidUpdatePayload;
  verificationMethod: Btc1VerificationMethod;
  options: RecoveryOptions;
}

export type Bytes = Uint8Array;
export type DocumentBytes = Bytes;
export type KeyPairType = {
  privateKey: PrivateKeyBytes;
  publicKey: PublicKeyBytes;
};

export interface Btc1SidecarData {
  did: DidBtc1Identifier;
};

export interface SingletonSidecar extends Btc1SidecarData {
  signalsMetadata: {
    [key: string | symbol | number]: {
      updatePayload: DidUpdatePayload;
    }
  };
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
export type TargetDocumentParams = {
  initialDocument: Btc1DidDocument;
  options: DidResolutionOptions;
};
export type BroadcastPayloadParams = {
  beaconService: BeaconService;
  didUpdateInvocation: Btc1VerificationMethod;
  options: DidResolutionOptions;
}
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
export type PublicKeyBytes = Uint8Array;

/** Alias type for a publicKeyMultbase encoded as a Bip340 Multikey (z + base58btc(bip340Header + publicKey) */
export type Bip340Encoding = string;

export type GetSigningMethodParams = {
  didDocument: Btc1DidDocument;
  methodId?: string;
};