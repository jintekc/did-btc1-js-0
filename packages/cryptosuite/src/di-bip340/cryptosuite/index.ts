import {
  Btc1Error,
  CanonicalizableObject,
  Canonicalization,
  CanonicalizedProofConfig,
  CryptosuiteError,
  CryptosuiteName,
  DidUpdateInvocation,
  HashBytes,
  Proof,
  ProofFactory,
  SignatureBytes
} from '@did-btc1/common';
import { sha256 } from '@noble/hashes/sha256';
import { base58btc } from 'multiformats/bases/base58';
import { ProofVerificationResult } from '../data-integrity-proof/index.js';
import { Multikey } from '../multikey/index.js';
import { CryptosuiteParams, DidUpdatePayloadParams, GenerateHashParams, ICryptosuite, ProofOptionsParam, TransformDocumentParams } from './interface.js';

/**
 * TODO: Test RDFC and figure out what the contexts should be
 * Implements
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#instantiate-cryptosuite | 3.1 Instantiate Cryptosuite}
 * @class Cryptosuite
 * @type {Cryptosuite}
 */
export class Cryptosuite implements ICryptosuite {
  /**
   * The type of the proof
   * @type {DataIntegrityProofType} The type of proof produced by the Cryptosuite
   */
  public type: 'DataIntegrityProof' = 'DataIntegrityProof';

  /**
   * The name of the cryptosuite
   * @public
   * @type {string} The name of the cryptosuite
   */
  public cryptosuite: CryptosuiteName;

  /**
   * The multikey used to sign and verify proofs
   * @public
   * @type {Multikey} The multikey used to sign and verify proofs
   */
  public multikey: Multikey;

  /**
   * The algorithm used for canonicalization
   * @public
   * @type {string} The algorithm used for canonicalization
   */
  public algorithm: 'RDFC-1.0' | 'JCS';

  /**
   * Creates an instance of Cryptosuite.
   * @param {CryptosuiteParams} params See {@link CryptosuiteParams} for required parameters to create a cryptosuite.
   * @param {string} params.cryptosuite The name of the cryptosuite.
   * @param {Multikey} params.multikey The parameters to create the multikey.
   */
  constructor({ cryptosuite, multikey }: CryptosuiteParams) {
    this.cryptosuite = cryptosuite;
    this.multikey = multikey;
    this.algorithm = cryptosuite.includes('rdfc') ? 'RDFC-1.0' : 'JCS';
  }

  /**
   * Implements {@link ICryptosuite.canonicalize}.
   */
  public async canonicalize(object: CanonicalizableObject): Promise<string> {
    const algorithm = this.algorithm;
    // If the cryptosuite includes 'rdfc', use RDFC canonicalization else use JCS
    return new Canonicalization(algorithm).canonicalize(object);
  }

  /**
   * Implements {@link ICryptosuite.createProof}.
   */
  public async createProof({ document, options }: DidUpdatePayloadParams): Promise<Proof> {
    // Get the context from the document
    const context = document['@context'];

    // If a context exists, add it to the proof
    const proofObject = ProofFactory.create(options);
    const proof = context
      ? { ...proofObject, '@context': context }
      : proofObject;

    // Create a canonical form of the proof configuration
    const canonicalConfig = await this.proofConfiguration({ options: proof });

    // Transform the document into a canonical form
    const canonicalDocument = await this.transformDocument({ document, options });

    // Generate a hash of the canonical proof configuration and canonical document
    const hash = this.generateHash({ canonicalConfig, canonicalDocument });

    // Serialize the proof
    const serialized = this.proofSerialization({ hash, options });

    // Encode the proof bytes to base
    proof.proofValue = base58btc.encode(serialized);

    // Set the proof type to DataIntegrityProof
    proof.type = this.type;

    // Return sproof
    return proof;
  }

  /**
   * Implements {@link ICryptosuite.verifyProof}.
   */
  public async verifyProof(secure: DidUpdateInvocation): Promise<ProofVerificationResult> {
    // Create an insecure document from the secure document by removing the proof
    const insecure = { ...secure, proof: undefined };

    // Create a copy of the proof options removing the proof value
    const options = { ...secure.proof, proofValue: undefined };

    // Decode the secure document proof value from base58btc to bytes
    const proof = base58btc.decode(secure.proof.proofValue);

    // Transform the newly insecured document to canonical form
    const canonicalDocument = await this.transformDocument({ document: insecure, options });

    // Canonicalize the proof options to create a proof configuration
    const canonicalConfig = await this.proofConfiguration({ options });

    // Generate a hash of the canonical insecured document and the canonical proof configuration`
    const hash = this.generateHash({ canonicalConfig, canonicalDocument });

    // Verify the hashed data against the proof bytes
    const verified = this.proofVerification({ hash, signature: proof, options });

    // Return the verification result
    return { verified, verifiedDocument: verified ? secure : undefined };
  }

  /**
   * Implements {@link ICryptosuite.transformDocument}.
   */
  public async transformDocument({ document, options }: TransformDocumentParams): Promise<string> {
    // Error type for the transformDocument method
    const ERROR_TYPE = 'PROOF_VERIFICATION_ERROR';

    // Get the type from the options and check:
    // If the options type does not match this type, throw error
    const type = options.type;
    if (type !== this.type) {
      throw new Btc1Error('Type mismatch: options.type !== this.type', ERROR_TYPE, { options, thisType: this.type });
    }

    // Get the cryptosuite from the options and check:
    // If the options cryptosuite does not match this cryptosuite, throw error
    const { cryptosuite } = options;
    if (cryptosuite !== this.cryptosuite) {
      const message = `Cryptosuite mismatch between config and this: ${cryptosuite} !== ${this.cryptosuite}`;
      throw new CryptosuiteError(message, ERROR_TYPE);
    }

    // Return the canonicalized document
    return await this.canonicalize(document);
  }

  /**
   * Implements {@link ICryptosuite.generateHash}.
   */
  public generateHash({ canonicalConfig, canonicalDocument }: GenerateHashParams): HashBytes {
    // Convert the canonical proof config to buffer and sha256 hash it
    const configHash = sha256(Buffer.from(canonicalConfig, 'utf-8'));

    // Convert the canonical document to buffer and sha256 hash it
    const documentHash = sha256(Buffer.from(canonicalDocument, 'utf-8'));

    // Concatenate the hashes
    const combinedHash = Buffer.concat([configHash, documentHash]);

    // sha256 hash the combined hashes and return
    return sha256(combinedHash);
  }

  /**
   * Implements {@link ICryptosuite.proofConfiguration}.
   */
  public async proofConfiguration({ options }: ProofOptionsParam): Promise<CanonicalizedProofConfig> {
    // Error type for the proofConfiguration method
    const ERROR_TYPE = 'PROOF_GENERATION_ERROR';

    // Get the type from the options
    const type = options.type ?? options['@type'];

    // If the type does not match the cryptosuite type, throw
    if (type !== this.type) {
      throw new CryptosuiteError(`Mismatch "type" between config and this: ${type} !== ${this.type}`, ERROR_TYPE);
    }

    // If the cryptosuite does not match the cryptosuite name, throw
    if (options.cryptosuite !== this.cryptosuite) {
      const message = `Mismatch on "cryptosuite" in config and this: ${options.cryptosuite} !== ${this.cryptosuite}`;
      throw new CryptosuiteError(message, ERROR_TYPE);
    }

    // TODO: check valid XMLSchema DateTime
    if(options.created) {
      console.info('TODO: check valid XMLSchema DateTime');
    }

    // Return the RDFC canonicalized proof configuration
    return await this.canonicalize(options);
  }

  /**
   * Implements {@link ICryptosuite.proofSerialization}.
   */
  public proofSerialization({ hash, options }: SerializeParams): SignatureBytes {
    // Error type for the proofSerialization method
    const ERROR_TYPE = 'PROOF_SERIALIZATION_ERROR';
    // Get the verification method from the options
    const vm = options.verificationMethod;
    // Get the multikey fullId
    const fullId = this.multikey.fullId();
    // If the verification method does not match the multikey fullId, throw an error
    if (vm !== fullId) {
      throw new CryptosuiteError(`Mismatch on "fullId" in options and multikey: ${fullId} !== ${vm}`, ERROR_TYPE);
    }
    // Return the signed hash
    return this.multikey.sign(hash);
  }

  /**
   * Implements {@link ICryptosuite.proofVerification}.
   */
  public proofVerification({ hash, signature, options }: VerificationParams): boolean {
    // Error type for the proofVerification method
    const ERROR_TYPE = 'PROOF_VERIFICATION_ERROR';
    // Get the verification method from the options
    const vm = options.verificationMethod;
    // Get the multikey fullId
    const fullId = this.multikey.fullId();
    // If the verification method does not match the multikey fullId, throw an error
    if (vm !== fullId) {
      throw new CryptosuiteError(`Mismatch on "fullId" in options and multikey: ${fullId} !== ${vm}`, ERROR_TYPE);
    }
    // Return the verified hashData and signedProof
    return this.multikey.verify(signature, hash);
  }
}