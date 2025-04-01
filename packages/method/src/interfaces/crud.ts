import { BitcoinNetworkNames } from '@did-btc1/common';
import { DidResolutionOptions as IDidResolutionOptions, DidVerificationMethod as IDidVerificationMethod } from '@web5/dids';
import BitcoinRpc from '../bitcoin/rpc-client.js';
import { DidPlaceholder, SidecarData, UnixTimestamp } from '../types/crud.js';
import { Btc1DidDocument } from '../utils/btc1/did-document.js';

export interface DidVerificationMethod extends IDidVerificationMethod {
    id: string;
    type: string;
    controller: DidPlaceholder;
    publicKeyMultibase: string;
}
export interface IntermediateDocument extends Btc1DidDocument {
    id:  DidPlaceholder;
    verificationMethod: DidVerificationMethod[];
}

/**
 * Options for resolving a DID Document
 * @param {?number} versionId The versionId for resolving the DID Document
 * @param {?UnixTimestamp} versionTime The versionTime for resolving the DID Document
 * @param {?BitcoinRpc} rpc BitcoinRpc client connection
 * @param {?SidecarData} sidecarData The sidecar data for resolving the DID Document
 */
export interface DidResolutionOptions extends IDidResolutionOptions {
  versionId?: number
  versionTime?: UnixTimestamp;
  rpc?: BitcoinRpc;
  sidecarData?: SidecarData;
  network?: BitcoinNetworkNames;
}
export interface Btc1RootCapability {
    '@context': string;
    id: string;
    controller: string;
    invocationTarget: string;
}
export interface ReadBlockchainParams {
  contemporaryDidDocument: Btc1DidDocument;
  contemporaryBlockHeight: number | 1;
  currentVersionId: number | 1;
  targetVersionId?: number;
  targetBlockHeight: number;
  updateHashHistory: string[];
  sidecarData?: SidecarData;
  options?: DidResolutionOptions;
}