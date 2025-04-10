import {
  BIP340_MULTIKEY_PREFIX,
  BIP340_MULTIKEY_PREFIX_HASH,
  CURVE,
  Hex,
  PrefixBytes,
  PrivateKeyBytes,
  PublicKeyBytes,
  PublicKeyError,
  PublicKeyJSON,
  PublicKeyMultibaseBytes
} from '@did-btc1/common';
import { sha256 } from '@noble/hashes/sha256';
import { base58btc } from 'multiformats/bases/base58';
import { IPublicKey } from './interface.js';
import { PrivateKey } from './private-key.js';

/**
 * Encapsulates a secp256k1 public key.
 * Provides get methods for different formats (compressed, x-only, multibase).
 * Provides helpers methods for comparison and serialization.
 * @class PublicKey
 * @type {PublicKey}
 *
 */
export class PublicKey implements IPublicKey {
  /** @type {PublicKeyBytes} The Uint8Array public key */
  private readonly _bytes: PublicKeyBytes;

  /**
   * Creates an instance of PublicKey.
   *
   * @param {PublicKeyBytes} bytes The public key byte array.
   * @throws {PublicKeyError} if the byte length is not 32 (x-only) or 33 (compressed)
   */
  constructor(bytes: PublicKeyBytes) {
    // If the byte length is not 33, throw an error
    if(bytes.length !== 33) {
      throw new PublicKeyError(
        'Invalid argument: byte length must be 33 (compressed)',
        'PUBLIC_KEY_CONSTRUCTOR_ERROR'
      );
    }
    // Set the bytes
    this._bytes = bytes;
  }

  /**
   * Get the public key bytes.
   * See {@link IPublicKey.bytes | IPublicKey Method bytes} for more details.
   * @returns {Uint8Array} The public key bytes
   */
  get bytes(): Uint8Array {
    const bytes = new Uint8Array(this._bytes);
    return bytes;
  }

  /**
   * Get the uncompressed public key.
   * See {@link IPublicKey.uncompressed | IPublicKey Method uncompressed} for more details.
   * @returns {Uint8Array} The 65-byte uncompressed public key (0x04, x, y).
   */
  get uncompressed(): PublicKeyBytes {
    const uncompressed = PublicKeyUtils.liftX(this.x);
    return uncompressed;
  }

  /**
   * Get the parity byte of the public key.
   * See {@link IPublicKey.parity | IPublicKey Method parity} for more details.
   * @returns {number} The parity byte of the public key.
   */
  get parity(): number {
    const parity = this.bytes[0];
    return parity;
  }

  /**
   * Get the x-coordinate of the public key.
   * See {@link IPublicKey.x | IPublicKey Method x} for more details.
   * @returns {Uint8Array} The 32-byte x-coordinate of the public key.
   */
  get x(): PublicKeyBytes {
    const x = this.bytes.slice(1, 33);
    return x;
  }

  /**
   * Get the y-coordinate of the public key.
   * See {@link IPublicKey.y | IPublicKey Method y} for more details.
   * @returns {Uint8Array} The 32-byte y-coordinate of the public key.
   */
  get y(): PublicKeyBytes {
    const y = this.uncompressed.slice(33, 65);
    return y;
  }

  /**
   * Get the multibase public key.
   * See {@link IPublicKey.multibase | IPublicKey Method multibase} for more details.
   * @returns {string} The public key in base58btc x-only multibase format.
   */
  get multibase(): string {
    const mbase = this.encode();
    return mbase;
  }

  /**
   * Get the public key prefix bytes.
   * See {@link IPublicKey.prefix | IPublicKey Method prefix} for more details.
   * @returns {PrefixBytes} The 2-byte prefix of the public key.
   */
  get prefix(): PrefixBytes {
    const prefix = this.decode().subarray(0, 2);
    return prefix;
  }

  /**
   * Returns the raw public key as a hex string.
   * See {@link IPublicKey.hex | IPublicKey Method hex} for more details.
   * @returns {Hex} The public key as a hex string.
   */
  get hex(): Hex {
    const hex = Buffer.from(this.bytes).toString('hex');
    return hex;
  }

  /**
   * Decodes the multibase string to the 34-byte corresponding public key (2 byte prefix + 32 byte public key).
   * See {@link IPublicKey.decode | IPublicKey Method } for more details.
   * @returns {PublicKeyMultibaseBytes} The decoded public key: prefix and public key bytes
   */
  public decode(): PublicKeyMultibaseBytes {
    // Decode the public key multibase string
    const multibase = base58btc.decode(this.multibase);

    // If the public key bytes are not 34 bytes, throw an error
    if(multibase.length !== 34) {
      throw new PublicKeyError('Invalid argument: must be 34 byte publicKeyMultibase', 'DECODE_PUBLIC_KEY_ERROR');
    }

    // Grab the prefix bytes
    const prefix = multibase.subarray(0, 2);
    // Compute the prefix hash
    const prefixHash = Buffer.from(sha256(prefix)).toString('hex');

    // If the prefix hash does not equal the BIP340 prefix hash, throw an error
    if (prefixHash !== BIP340_MULTIKEY_PREFIX_HASH) {
      throw new PublicKeyError(`Invalid prefix: malformed multibase prefix ${prefix}`, 'DECODE_PUBLIC_KEY_ERROR');
    }

    // Return the decoded public key bytes
    return multibase;
  }

  /**
   * Encodes compressed secp256k1 public key from bytes to BIP340 base58btc multibase format
   * See {@link IPublicKey.encode | IPublicKey Method } for more details.
   * @returns {string} The public key encoded in base-58-btc multibase format
   */
  public encode(): string {
    // Convert public key bytes to an array
    const publicKeyBytes = Array.from(this.bytes);

    // Ensure the public key is 33-byte secp256k1 compressed public key
    if (publicKeyBytes.length !== 33) {
      throw new PublicKeyError('Invalid argument: must be 33-byte (compressed) public key', 'ENCODE_PUBLIC_KEY_ERROR');
    }

    // Convert prefix to an array
    const multikeyByteArray = Array.from(BIP340_MULTIKEY_PREFIX);

    // Push the public key bytes at the end of the prefix
    multikeyByteArray.push(...publicKeyBytes);

    // Convert the prefix + public key bytes to Uint8Array
    const multikeyBytes = new Uint8Array(multikeyByteArray);

    // Encode as a multibase base58btc string
    return base58btc.encode(multikeyBytes);
  }

  /**
   * Compares this public key to another public key.
   * See {@link IPublicKey.equals | IPublicKey Method equals} for more details.
   * @param {PublicKey} other The other public key to compare
   * @returns {boolean} True if the public keys are equal, false otherwise.
   */
  public equals(other: PublicKey): boolean {
    return this.hex === other.hex;
  }

  /**
   * Public key JSON representation.
   * See {@link IPublicKey.json} for more details.
   * @returns {PublicKeyJSON} The public key as a JSON object.
   */
  public json(): PublicKeyJSON {
    return {
      parity    : this.parity,
      x         : this.x,
      y         : this.y,
      hex       : this.hex,
      multibase : this.multibase,
      prefix    : this.prefix,
    };
  }
}

/**
 * Utility class for Multikey operations/
 * @class PublicKeyUtils
 * @type {PublicKeyUtils}
 */
export class PublicKeyUtils {
  /**
   * Computes the deterministic public key for a given private key.
   *
   * @param {PrivateKey | PrivateKeyBytes} pk The PrivateKey object or the private key bytes
   * @returns {PublicKey} A new PublicKey object
   */
  public static fromPrivateKey(pk: PrivateKeyBytes): PublicKey {
    // If the private key is a PrivateKey object, get the raw bytes else use the bytes
    const bytes = pk instanceof PrivateKey ? pk.bytes : pk;

    // Throw error if the private key is not 32 bytes
    if(bytes.length !== 32) {
      throw new PublicKeyError('Invalid arg: must be 32 byte private key', 'FROM_PRIVATE_KEY_ERROR');
    }

    // Compute the public key from the private key
    const privateKey = pk instanceof PrivateKey ? pk : new PrivateKey(pk);

    // Return a new PublicKey object
    return privateKey.computePublicKey();
  }

  /**
   * Computes modular exponentiation: (base^exp) % mod.
   * Used for computing modular square roots.
   *
   * @param {bigint} base The base value
   * @param {bigint} exp The exponent value
   * @param {bigint} mod The modulus value
   * @returns {bigint} The result of the modular exponentiation
   */
  public static modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n;
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod;
      base = (base * base) % mod;
      exp >>= 1n;
    }
    return result;
  };

  /**
   * Computes `sqrt(a) mod p` using Tonelli-Shanks algorithm.
   * This finds `y` such that `y^2 ≡ a mod p`.
   *
   * @param {bigint} a The value to find the square root of
   * @param {bigint} p The prime modulus
   * @returns {bigint} The square root of `a` mod `p`
   */
  public static sqrtMod(a: bigint, p: bigint): bigint {
    return this.modPow(a, (p + 1n) >> 2n, p);
  };

  /**
   * Lifts a 32-byte x-only coordinate into a full secp256k1 point (x, y).
   * @param xBytes 32-byte x-coordinate
   * @returns {Uint8Array} 65-byte uncompressed public key (starts with `0x04`)
   */
  public static liftX(xBytes: Uint8Array): Uint8Array {
    // Ensure x-coordinate is 32 bytes
    if (xBytes.length !== 32) {
      throw new PublicKeyError('Invalid argument: x-coordinate length must be 32 bytes', 'LIFT_X_ERROR');
    }

    // Convert x from Uint8Array → BigInt
    const x = BigInt('0x' + Buffer.from(xBytes).toString('hex'));
    if (x <= 0n || x >= CURVE.p) {
      throw new PublicKeyError('Invalid conversion: x out of range as BigInt', 'LIFT_X_ERROR');
    }

    // Compute y² = x³ + 7 mod p
    const ySquared = BigInt((x ** 3n + CURVE.b) % CURVE.p);

    // Compute y (do not enforce parity)
    const y = this.sqrtMod(ySquared, CURVE.p);

    // Convert x and y to Uint8Array
    const yBytes = Buffer.from(y.toString(16).padStart(64, '0'), 'hex');

    // Return 65-byte uncompressed public key: `0x04 || x || y`
    return new Uint8Array(Buffer.concat([Buffer.from([0x04]), Buffer.from(xBytes), yBytes]));
  };
}