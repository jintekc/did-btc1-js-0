import { Btc1Error, DidUpdateInvocation, Logger, Proof, PROOF_GENERATION_ERROR, PROOF_PARSING_ERROR, } from '@did-btc1/common';
import { Cryptosuite } from '../cryptosuite/index.js';
import { VerificationResult } from '../cryptosuite/interface.js';
import { AddProofParams, IDataIntegrityProof } from './interface.js';

/**
 * Implements section
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#dataintegrityproof | 2.2.1 DataIntegrityProof}
 * of the {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity BIP-340 Cryptosuite} spec
 * @class DataIntegrityProof
 * @type {DataIntegrityProof}
 */
export class DataIntegrityProof implements IDataIntegrityProof {
  /** @type {Cryptosuite} The cryptosuite to use for proof generation and verification. */
  public cryptosuite: Cryptosuite;

  /**
   * Creates an instance of DataIntegrityProof.
   *
   * @param {Cryptosuite} cryptosuite The cryptosuite to use for proof generation and verification.
   */
  constructor(cryptosuite: Cryptosuite) {
    this.cryptosuite = cryptosuite;
  }

  /** @see IDataIntegrityProof.addProof */
  public async addProof({ document, options }: AddProofParams): Promise<DidUpdateInvocation> {
    // Generate the proof
    const proof = await this.cryptosuite.createProof({ document, options });

    // Deconstruct the proof object
    const { type, verificationMethod, proofPurpose } = proof;

    // Check if the type, verificationMethod, and proofPurpose are defined
    if (!type || !verificationMethod || !proofPurpose) {
      throw new Btc1Error('Proof missing "type", "verificationMethod" and/or "proofPurpose"', PROOF_GENERATION_ERROR, proof);
    }

    // Deconstruct the domain from the proof object and check:
    // if the options domain is defined, ensure it matches the proof domain
    Logger.warn('// TODO: Adjust the domain check to match the spec (domain as a list of urls)');
    const { domain } = proof;
    if (options.domain && options.domain !== domain) {
      throw new Btc1Error('Domain mismatch between options and domain passed', PROOF_GENERATION_ERROR, proof);
    }

    // Deconstruct the challenge from the proof object and check:
    // if options challenge is defined, ensure it matches the proof challenge
    const { challenge } = proof;
    if (options.challenge && options.challenge !== challenge) {
      throw new Btc1Error('Challenge mismatch options and challenge passed', PROOF_GENERATION_ERROR, proof);
    }

    // Set the proof in the document and return as a DidUpdateInvocation
    return { ...document, proof } as DidUpdateInvocation;
  }

  /** @see IDataIntegrityProof.verifyProof */
  public async verifyProof({
    mediaType,
    document,
    expectedPurpose,
    expectedDomain,
    expectedChallenge
  }: {
    mediaType?: string;
    document: string;
    expectedPurpose: string;
    expectedDomain?: string[];
    expectedChallenge?: string;
  }): Promise<VerificationResult> {
    // Parse the document
    const secure = JSON.parse(document) as DidUpdateInvocation;

    // Deconstruct the secure object to get the proof
    const { proof }: { proof: Proof } = secure;

    // Check if the proof object is an object
    if (typeof secure !== 'object' || typeof proof !== 'object') {
      throw new Btc1Error('', PROOF_PARSING_ERROR);
    }

    // Deconstruct the proof object
    const { type, proofPurpose, verificationMethod, challenge, domain } = proof;
    // Check if the type, proofPurpose, and verificationMethod are defined
    if (!type || !verificationMethod || !proofPurpose) {
      throw new Btc1Error('', 'PROOF_VERIFICATION_ERROR');
    }

    // Check if the expectedPurpose is defined and if it matches the proofPurpose
    if (expectedPurpose && expectedPurpose !== proofPurpose) {
      throw new Btc1Error('', 'PROOF_VERIFICATION_ERROR');
    }

    // Check if the expectedChallenge is defined and if it matches the challenge
    if (expectedChallenge && expectedChallenge !== challenge) {
      throw new Btc1Error('', 'INVALID_CHALLENGE_ERROR');
    }

    // Check if the expectedDomain length matches the proof.domain length
    if(expectedDomain && expectedDomain?.length !== domain?.length) {
      throw new Btc1Error('', 'INVALID_DOMAIN_ERROR');
    }

    // If defined, check that each entry in expectedDomain can be found in proof.domain
    if(expectedDomain && !expectedDomain?.every(url => domain?.includes(url))) {
      throw new Btc1Error('', 'INVALID_DOMAIN_ERROR');
    }

    // Verify the proof
    const { verified, verifiedDocument, mediaType: mt } = await this.cryptosuite.verifyProof(secure);

    // Add the mediaType to the verification result
    mediaType ??= mt;

    const sansProof = JSON.delete({
      obj : verifiedDocument as Record<string, any>,
      key : 'proof'
    }) as DidUpdateInvocation;

    // Return the verification result
    return {verified, verifiedDocument: verified ? sansProof : undefined, mediaType};
  }
}