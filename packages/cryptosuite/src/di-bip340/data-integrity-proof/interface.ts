import {
  AddProofParams,
  DidUpdateInvocation,
  VerificationResult,
  VerifyProofParams
} from '../../types/di-proof.js';
import { Cryptosuite } from '../cryptosuite/index.js';

/**
 * Interface representing a BIP-340 DataIntegrityProof.
 * @interface IDataIntegrityProof
 * @type {IDataIntegrityProof}
 */
export interface IDataIntegrityProof {
  /** @type {Cryptosuite} CryptosuiteJcs or CryptosuiteRdfc class object  */
  cryptosuite: Cryptosuite;

  /**
   * Add a proof to a document.
   * @param {AddProofParams} params Parameters for adding a proof to a document.
   * @param {InsecureDocument} params.document The document to add a proof to.
   * @param {ProofOptions} params.options Options for adding a proof to a document.
   * @returns {DidUpdateInvocation} A document with a proof added.
   */
  addProof({ document, options }: AddProofParams): Promise<DidUpdateInvocation>;

  /**
   * Verify a proof.
   * @param {VerifyProofParams} params Parameters for verifying a proof.
   * @param {string} params.mediaType The media type of the document.
   * @param {string} params.document The document to verify.
   * @param {string} params.expectedPurpose The expected purpose of the proof.
   * @param {string[]} params.expectedDomain The expected domain of the proof.
   * @param {string} params.expectedChallenge The expected challenge of the proof.
   * @returns {VerificationResult} The result of verifying the proof.
   */
  verifyProof({
    mediaType,
    document,
    expectedPurpose,
    expectedDomain,
    expectedChallenge
  }: VerifyProofParams): Promise<VerificationResult>;
}