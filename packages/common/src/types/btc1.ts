import { Btc1Error, INVALID_PREVIOUS_DID_PROOF } from '../utils/errors.js';

export type CanonicalizedProofConfig = string;
export type CryptosuiteName = 'bip340-jcs-2025' | 'bip340-rdfc-2025';
export type ContextObject = Record<string | number | symbol, any>;
export type Context = string | string[] | ContextObject | ContextObject[]

export interface PatchOperation {
    op: string; // 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
    path: string;
    value?: any; // Required for add, replace, test
    from?: string; // Required for move, copy
}
export interface DidUpdatePayload {
    '@context': string[];
    patch: PatchOperation[];
    sourceHash: string;
    targetHash: string;
    targetVersionId: number;
}
export interface DidUpdateInvocation extends DidUpdatePayload {
    proof: Proof;
}
export interface ProofOptions {
    type?: string;
    cryptosuite?: string;
    verificationMethod?: string;
    proofPurpose?: string;
    capability?: string;
    capabilityAction?: string;
  }

/** Interfaces */
export interface Proof {
    type?: 'DataIntegrityProof';
    '@context': Context;
    created?: string;
    cryptosuite: CryptosuiteName;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
    domain?: string[];
    challenge?: string;
    capability?: string;
    capabilityAction?: string;
}

export interface ProofJcs extends Proof {
    type?: 'DataIntegrityProof';
}

export interface ProofRdfc extends Proof {
    '@context': Context;
    '@type'?: 'DataIntegrityProof';
    created?: string;
    cryptosuite: CryptosuiteName;
    verificationMethod: string;
    proofPurpose: string;
    proofValue: string;
    domain?: string[];
    challenge?: string;
    capability?: string;
    capabilityAction?: string;
}

export class ProofFactory {
  public static create(options: ProofOptions): Proof {
    const { type, cryptosuite } = options;
    if(type !== 'DataIntegrityProof') {
      throw new Btc1Error('Invalid type: Expected "DataIntegrityProof".', INVALID_PREVIOUS_DID_PROOF);
    }
    if (cryptosuite === 'bip340-jcs-2025') {
      return options as ProofJcs;
    } else if (cryptosuite === 'bip340-rdfc-2025') {
      return options as ProofRdfc;
    } else {
      return options as Proof;
    }
  }
}