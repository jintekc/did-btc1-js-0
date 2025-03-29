import { Hex, KeyBytes, KeyPairError, KeyPairJSON, PrivateKeyBytes, PublicKeyBytes } from '@did-btc1/common';
import { IKeyPair } from './interface.js';
import { PrivateKey, PrivateKeyUtils } from './private-key.js';
import { PublicKey } from './public-key.js';

/** Params for the {@link KeyPair} constructor */
interface KeyPairParams {
  privateKey?: PrivateKey | PrivateKeyBytes;
  publicKey?: PublicKey | PublicKeyBytes;
}

/**
 * Encapsulates a PublicKey and a PrivateKey object as a single KeyPair object.
 * @class KeyPair
 * @type {KeyPair}
 */
export class KeyPair implements IKeyPair {
  /** @type {PrivateKey} The private key object */
  private _privateKey?: PrivateKey;

  /** @type {PublicKey} The public key object */;
  private _publicKey: PublicKey;

  /**
   * Creates an instance of KeyPair. Must provide a at least a private key.
   * Can optionally provide btoh a private and public key, but must be a valid pair.
   *
   * @param {PrivateKey} privateKey The private key object
   */
  constructor({ privateKey, publicKey }: KeyPairParams = {}) {
    // If no private key or public key, throw an error
    if (!publicKey && !privateKey) {
      throw new KeyPairError('Argument missing: must at least provide a publicKey', 'KEYPAIR_CONSTRUCTOR_ERROR');
    }
    const isPubKeyBytes = publicKey instanceof Uint8Array;
    const isPrivKeyBytes = privateKey instanceof Uint8Array;
    // Set the private and public keys
    this._privateKey = isPrivKeyBytes ? new PrivateKey(privateKey) : privateKey;
    this._publicKey = !publicKey
      ? this.privateKey.computePublicKey()
      : isPubKeyBytes
        ? new PublicKey(publicKey)
        : publicKey;
  }

  /**
   * Set the PublicKey.
   * @see IKeyPair.publicKey
   * @param {PublicKey} publicKey The PublicKey object
   */
  set publicKey(publicKey: PublicKey) {
    this._publicKey = publicKey;
  }

  /**
   * Get the PublicKey.
   * @see IKeyPair.publicKey
   * @returns {PublicKey} The PublicKey object
   */
  get publicKey(): PublicKey {
    const publicKey = this._publicKey;
    return publicKey;
  }

  /**
   * Set the PrivateKey.
   * @see IKeyPair.privateKey
   * @returns {PrivateKey} The PrivateKey object
   * @throws {KeyPairError} If the private key is not available
   */
  get privateKey(): PrivateKey {
    if(!this._privateKey) {
      throw new KeyPairError('Private key not available', 'PRIVATE_KEY_ERROR');
    }
    const privateKey = this._privateKey;
    return privateKey;
  }


  /**
   * JSON representation of a KeyPair.
   * @see IKeyPair.json
   * @returns {KeyPairJSON} The KeyPair as a JSON object
   */
  public json(): KeyPairJSON {
    return {
      privateKey : this.privateKey.json(),
      publicKey  : this.publicKey.json()
    };
  }
}

/**
 * Utility class for creating and working with KeyPair objects.
 * @class KeyPairUtils
 * @type {KeyPairUtils}
 */
export class KeyPairUtils {
  /**
   * Static method creates a new KeyPair from a PrivateKey object or private key bytes.
   *
   * @param {PrivateKey | PrivateKeyBytes} data The private key bytes
   * @returns {KeyPair} A new KeyPair object
   */
  public static fromPrivateKey(data: PrivateKey | PrivateKeyBytes): KeyPair {

    // If the private key is a PrivateKey object, get the raw bytes else use the bytes
    const bytes = data instanceof PrivateKey ? data.bytes : data;

    // Throw error if the private key is not 32 bytes
    if(bytes.length !== 32) {
      throw new KeyPairError('Invalid arg: must be 32 byte private key', 'FROM_PRIVATE_KEY_ERROR');
    }

    // If pk Uint8Array, construct PrivateKey object else use the object
    const privateKey = data instanceof Uint8Array ? new PrivateKey(data) : data;

    // Compute the public key from the private key
    const publicKey = privateKey.computePublicKey();

    // Return a new KeyPair object
    return new KeyPair({ privateKey, publicKey });
  }

  /**
   * Static method creates a new KeyPair (PrivateKey/PublicKey) bigint secret.
   *
   * @param {bigint} secret The private key secret
   * @returns {KeyPair} A new KeyPair object
   */
  public static fromSecret(secret: bigint): KeyPair {
    const privateKey = PrivateKeyUtils.fromSecret(secret);
    const publicKey = privateKey.computePublicKey();
    return new KeyPair({ privateKey, publicKey });
  }

  /**
   * Converts key bytes to a hex string.
   *
   * @param {KeyBytes} keyBytes The key bytes (private or public).
   * @returns {Hex} The key bytes as a hex string.
   */
  public static toHex(keyBytes: KeyBytes): Hex {
    return Buffer.from(keyBytes).toString('hex');
  }

  /**
   * Compares two KeyPair objects for equality.
   * @param {KeyPair} keyPair The main keyPair.
   * @param {KeyPair} keyPair1 The other keyPair.
   * @returns {boolean} True if the public key and private key hex are equal, false otherwise.
   */
  public static equals(keyPair: KeyPair, keyPair1: KeyPair): boolean {
    // Get the public key hex strings for both key pairs
    const publicKey0 = keyPair.publicKey.hex;
    const publicKey1 = keyPair1.publicKey.hex;

    // Get the private key hex strings for both key pairs
    const privateKey0 = keyPair.privateKey.hex;
    const privateKey1 = keyPair1.privateKey.hex;

    // Return true if the public and private keys are equal
    return publicKey0 === publicKey1 && privateKey0 === privateKey1;
  }

  /**
   * Static method to generate a new random PrivateKey / PublicKey KeyPair.
   *
   * @returns {KeyPair} A new PrivateKey object.
   */
  public static generate(): KeyPair {
    // Generate random private key bytes
    const privateKeyBytes = PrivateKeyUtils.randomBytes();

    // Construct a new PrivateKey object
    const privateKey = new PrivateKey(privateKeyBytes);

    // Compute the public key from the private key
    const publicKey = privateKey.computePublicKey();

    // Return a new KeyPair object
    return new KeyPair({ privateKey, publicKey });
  }
}