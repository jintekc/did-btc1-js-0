import {
  CanonicalizedProofConfig,
  CryptosuiteName,
  DidUpdateInvocation,
  DidUpdatePayload,
  HashBytes,
  HashHex,
  Proof,
  ProofOptions,
  SignatureBytes
} from '@did-btc1/common';
import { ProofVerificationResult } from '../data-integrity-proof/index.js';
import { Multikey } from '../multikey/index.js';

export type ProofOptionsParam = {
  options: ProofOptions;
};
export interface DidUpdatePayloadParams extends ProofOptionsParam {
  document: DidUpdatePayload
}
export interface DidUpdateInvocationParams extends ProofOptionsParam {
  document: DidUpdateInvocation
};
export type DocumentParams = {
  document:
    | DidUpdatePayload
    | DidUpdateInvocation
};
export type CanonicalizableObject = Record<string, any>;
export type TransformDocumentParams = DocumentParams & ProofOptionsParam;
export type ProofSerializeParams = {
  hash: HashBytes;
  options: ProofOptions;
};
export type ProofVerificationParams = {
  hash: HashBytes;
  signature: SignatureBytes;
  options: ProofOptions;
};
export type GenerateHashParams = {
  canonicalConfig: string;
  canonicalDocument: string
};
export interface CryptosuiteParams {
  type?: 'DataIntegrityProof';
  cryptosuite: CryptosuiteName;
  multikey: Multikey;
}

/**
 * Interface representing a BIP-340 Cryptosuite.
 * @interface ICryptosuite
 * @type {ICryptosuite}
 */
export interface ICryptosuite {
  /** @type {'DataIntegrityProof'} The type of proof produced by the cryptosuite */
  type: 'DataIntegrityProof';

  /** @type {string} The name of the cryptosuite */
  cryptosuite: string;

  /** @type {Multikey} The Multikey used by the cryptosuite */
  multikey: Multikey;

  /**
   * Canonicalize a document. Toggles between JCS and RDFC based on the value set in the cryptosuite.
   * @param {CanonicalizableObject} object The document to canonicalize.
   * @returns {string} The canonicalized document.
   * @throws {CryptosuiteError} if the document cannot be canonicalized.
   */
  canonicalize(object: CanonicalizableObject): string | Promise<string>;

  /**
   * Create a proof for an insecure document.
   * @param {DidUpdatePayloadParams} params The parameters to use when creating the proof.
   * @param {DidUpdatePayload} params.document The document to create a proof for.
   * @param {ProofOptions} params.options The options to use when creating the proof.
   * @returns {Proof} The proof for the document.
   */
  createProof({ document, options }: {
    document: DidUpdatePayload
    options: ProofOptions;
  }): Promise<Proof>;

  /**
   * Verify a proof for a secure document.
   * @param {DidUpdateInvocation} document The secure document to verify.
   * @returns {ProofVerificationResult} The result of the verification.
   */
  verifyProof(document: DidUpdateInvocation): Promise<ProofVerificationResult>;

  /**
   * Transform a document (insecure didUpdatePayload or secure didUpdateInvocation) into canonical form.
   * @param {TransformDocumentParams} params The parameters to use when transforming the document.
   * @param {DocumentParams} params.document The document to transform: secure or insecure.
   * @param {ProofOptions} params.options The options to use when transforming the proof.
   * @returns {string} The canonicalized document.
   * @throws {CryptosuiteError} if the document cannot be transformed.
   */
  transformDocument({ document, options }: {
    document:
        | DidUpdatePayload
        | DidUpdateInvocation;
    options: ProofOptions;
  }): Promise<string>;

  /**
   * Generate a hash of the canonical proof configuration and document.
   * @param {{ canonicalConfig: string; canonicalDocument: string }} params The parameters to use when generating the hash.
   * @param {string} params.canonicalConfig The canonicalized proof configuration.
   * @param {string} params.canonicalDocument The canonicalized document.
   * @returns {HashHex} The hash string of the proof configuration and document.
   */
  generateHash({ canonicalConfig, canonicalDocument }: {
    canonicalConfig: string;
    canonicalDocument: string
  }): HashHex;

  /**
   * Configure the proof by canonicalzing it.
   * @param {ProofOptions} options The options to use when transforming the proof.
   * @returns {string} The canonicalized proof configuration.
   * @throws {CryptosuiteError} if the proof configuration cannot be canonicalized.
   */
  proofConfiguration(options: ProofOptions): Promise<CanonicalizedProofConfig>;

  /**
   * Serialize the proof into a byte array.
   * @param {ProofSerializeParams} params The parameters to use when serializing the proof.
   * @param {HashBytes} params.hash The canonicalized proof configuration.
   * @param {ProofOptions} params.options The options to use when serializing the proof.
   * @returns {SignatureBytes} The serialized proof.
   * @throws {CryptosuiteError} if the multikey does not match the verification method.
   */
  proofSerialization({ hash, options }: {
    hash: HashBytes;
    options: ProofOptions;
  }): SignatureBytes;

  /**
   * Verify the proof by comparing the hash of the proof configuration and document to the proof bytes.
   * @param {ProofVerificationParams} params The parameters to use when verifying the proof.
   * @param {HashBytes} params.hash The canonicalized proof configuration.
   * @param {SignatureBytes} params.signature The serialized proof.
   * @param {ProofOptions} params.options The options to use when verifying the proof.
   * @returns {boolean} True if the proof is verified, false otherwise.
   * @throws {CryptosuiteError} if the multikey does not match the verification method.
   */
  proofVerification({ hash, signature, options }: {
    hash: HashBytes;
    signature: SignatureBytes;
    options: ProofOptions;
  }): boolean;
}