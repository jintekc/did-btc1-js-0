import { DidVerificationMethod, DidResolutionOptions as IDidResolutionOptions } from '@web5/dids';
import BitcoinRpc from '../bitcoin/rpc-client.js';
import { PatchOperation } from '../utils/json-patch.js';
import { Btc1DidDocument } from '../utils/btc1/did-document.js';
import { DidPlaceholder, SidecarData, UnixTimestamp } from '../types/crud.js';
import { BitcoinNetworkNames } from '@did-btc1/common';

export interface IntermediateVerificationMethod extends DidVerificationMethod {
    id: string;
    type: string;
    controller: DidPlaceholder;
    publicKeyMultibase: string;
}
export interface IntermediateDocument extends Btc1DidDocument {
    id:  DidPlaceholder;
    verificationMethod: IntermediateVerificationMethod[];
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
export interface DidUpdatePayload {
    '@context': string[];
    patch: PatchOperation[];
    sourceHash: string;
    targetHash: string;
    targetVersionId: number;
    proof: ProofOptions;
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
export interface ProofOptions {
  type?: string;
  cryptosuite?: string;
  verificationMethod?: string;
  proofPurpose?: string;
  capability?: string;
  capabilityAction?: string;
}