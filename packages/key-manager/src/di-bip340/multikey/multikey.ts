import { schnorr } from '@noble/curves/secp256k1';
import { DidVerificationMethod } from '@web5/dids';
import { randomBytes } from 'crypto';
import { base58btc } from 'multiformats/bases/base58';
import { Btc1KeyManagerError } from '../../utils/error.js';
import { Hex } from '@noble/secp256k1';
import { PrivateKeyBytes, PublicKeyBytes, SignatureBytes, PublicKeyMultibase } from '../../types/shared.js';
import { IBip340Multikey } from './interface.js';
import { Bip340MultikeyUtils, SECP256K1_XONLY_PREFIX } from './utils.js';
import { Bip340MultikeyParams } from '../../types/multikey.js';

/**
 * Implements section
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1/#multikey | 2.1.1 Multikey} of the
 * {@link https://dcdpr.github.io/data-integrity-schnorr-secp256k1 | Data Integrity Bip340 Cryptosuite} spec
 * @export
 * @class Bip340Multikey
 * @type {Bip340Multikey}
 * @implements {Bip340Multikey}
 */
export class Bip340Multikey implements IBip340Multikey {
  /** @type {string} The controller id for the full id */
  public id: string;

  /** @type {string} The did controller */
  public controller: string;

  /** @type {PublicKeyBytes} The private key bytes for the multikey */
  public publicKey: PublicKeyBytes;

  /** @type {PrivateKeyBytes} The private key bytes for the multikey (optional) */
  public privateKey?: PrivateKeyBytes;

  /**
   * Creates an instance of Multikey.
   * @constructor
   * @param {MultikeyParams} params The parameters to create the multikey
   * @param {string} params.id The id of the multikey (required)
   * @param {string} params.controller The controller of the multikey (required)
   * @param {PublicKeyBytes} params.publicKey The public key of the multikey (optional, required if no privateKey)
   * @param {PrivateKeyBytes} params.privateKey The private key of the multikey (optional)
   * @throws {Btc1KeyManagerError} if neither a publicKey nor a privateKey is provided
   */
  constructor({ id, controller, privateKey, publicKey }: Bip340MultikeyParams) {
    // If there is no public or private key, throw an error
    if (!publicKey && !privateKey) {
      throw new Btc1KeyManagerError('Must pass publicKey, privateKey or both');
    }

    // Set the id and controller
    this.id = id;
    this.controller = controller;
    // If there is a private key, set it
    this.privateKey = privateKey;
    // If there is no public key, generate it. Otherwise, set it
    this.publicKey = privateKey
      ? schnorr.getPublicKey(privateKey)
      : publicKey;
  }

  /** @see IBip340Multikey.sign */
  public sign(data: Hex): SignatureBytes {
    // If there is no private key, throw an error
    if (!this.privateKey) {
      throw new Btc1KeyManagerError('No private key');
    }
    // Sign the data and return it
    return schnorr.sign(data, this.privateKey, randomBytes(32));
  }

  /** @see IBip340Multikey.verify */
  public verify(message: Hex, signature: Hex): boolean {
    // Verify the signature and return the result
    return schnorr.verify(signature, message, this.publicKey);
  }

  /** @see IBip340Multikey.encode */
  public encode(): PublicKeyMultibase {
    // Encode the public key and return it
    return Bip340MultikeyUtils.encode(this.publicKey);
  }

  /** @see IBip340Multikey.decode */
  public decode(publicKeyMultibase: PublicKeyMultibase): PublicKeyBytes {
    // Decode the public key and return it
    return Bip340MultikeyUtils.decode(publicKeyMultibase);
  }

  /** @see IBip340Multikey.fullId */
  public fullId(): string {
    // If the id starts with a #, return the full id
    if (this.id.startsWith('#')) {
      return `${this.controller}${this.id}`;
    }
    // Otherwise, return the id
    return this.id;
  }

  /** @see IBip340Multikey.toVerificationMethod */
  public toVerificationMethod(): DidVerificationMethod {
    // Return the verification method
    return {
      id                 : this.id,
      type               : 'Multikey',
      controller         : this.controller,
      publicKeyMultibase : this.encode()
    };
  }

  /** @see IBip340Multikey.fromVerificationMethod */
  public fromVerificationMethod(verificationMethod: DidVerificationMethod): Bip340Multikey {
    // Destructure the verification method
    const { id, type, controller, publicKeyMultibase } = verificationMethod;
    // Check if the required field id is missing
    if (!id) {
      throw new Btc1KeyManagerError('Verification method missing id');
    }
    // Check if the required field controller is missing
    if (!controller) {
      throw new Btc1KeyManagerError('Verification method missing controller');
    }
    // Check if the required field publicKeyMultibase is missing
    if (!publicKeyMultibase) {
      throw new Btc1KeyManagerError('Verification method missing publicKeyMultibase');
    }
    // Check if the type is not Multikey
    if (type !== 'Multikey') {
      throw new Btc1KeyManagerError('Verification method has an invalid type');
    }
    // Decode the public key multibase
    const publicKeyBytes = base58btc.decode(publicKeyMultibase);
    // Check if the prefix is correct
    const prefix = publicKeyBytes.slice(0, SECP256K1_XONLY_PREFIX.length);
    if (!prefix.every((b, i) => b === SECP256K1_XONLY_PREFIX[i])) {
      throw new Btc1KeyManagerError('Invalid publicKeyMultibase prefix');
    }
    // Get the publicKey by slicing off the prefix
    const publicKey = publicKeyBytes.slice(SECP256K1_XONLY_PREFIX.length);
    // Return a new multikey
    return new Bip340Multikey({ id, controller, publicKey });
  }
}