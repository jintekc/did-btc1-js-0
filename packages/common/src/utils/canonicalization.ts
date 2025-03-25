import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import rdf from 'rdf-canonize';
import { HashBytes } from '../types/crypto.js';
import { CanonicalizationAlgorithm } from '../types/general.js';
import { JSONObject } from '../exts.js';

/**
 * Class for canonicalizing objects using JCS (RFC 8785) or RDFC (RDF Canonicalization 1.0).
 * It also provides hashing (SHA-256) and hex conversion.
 */
export class Canonicalization {
  private algorithm: CanonicalizationAlgorithm;

  constructor(algorithm: 'JCS' | 'RDFC-1.0' = 'RDFC-1.0') {
    this.algorithm = algorithm;
  }

  /**
   * Sets the canonicalization algorithm dynamically.
   * @param algorithm Either 'JCS' or 'RDFC'.
   */
  public setAlgorithm(algorithm: 'JCS' | 'RDFC-1.0'): void {
    this.algorithm = algorithm;
  }

  /**
   * Step 1-3: Canonicalize → Hash → Hex
   * Canonicalizes an object, hashes it and returns it as hex string.
   * @param {JSONObject} object The object to process.
   * @returns {Promise<string>} The final SHA-256 hash bytes as a hex string.
   */
  public async process(object: JSONObject): Promise<string> {
    // Step 1: Canonicalize
    const canonicalized = await this.canonicalize(object);
    // Step 2: Hash
    const hashBytes = this.hash(canonicalized);
    // Step 3: Hex
    const hex = this.hex(hashBytes);
    // Return the final hex string
    return hex;
  }

  /**
   * Step 1: Canonicalize an object based on the selected algorithm.
   * @param {JSONObject} object The object to canonicalize.
   * @returns {Promise<string>} The canonicalized string.
   */
  public async canonicalize(object: JSONObject): Promise<string> {
    return this.algorithm.includes('JCS')
      ? this.jcs(object)
      : await rdf.canonize([object], { algorithm: 'RDFC-1.0' });
  }

  /**
   * Step 2: Hashes a canonicalized string using SHA-256.
   * @param {string} canonicalized The canonicalized string.
   * @returns {HashBytes} The SHA-256 hash as a Uint8Array.
   */
  public hash(canonicalized: string): HashBytes {
    return sha256(canonicalized);
  }

  /**
   * Step 3: Hex. Converts a Uint8Array hash to a hex string.
   * @param {HashBytes} hashBytes The hash as a Uint8Array.
   * @returns {string} The hash as a hex string.
   */
  public hex(hashBytes: HashBytes): string {
    return bytesToHex(hashBytes);
  }


  /**
   * Step 1-2: Canonicalize → Hash.
   * Canonicalizes an object, hashes it and returns it as hash bytes.
   * @public
   * @async
   * @param {JSONObject} object The object to process.
   * @returns {Promise<HashBytes>} The final SHA-256 hash bytes.
   */
  public async canonicalhash(object: JSONObject): Promise<HashBytes> {
    const canonicalized = await this.canonicalize(object);
    return this.hash(canonicalized);
  }

  /**
   * Step 2-3: Hash → Hex.
   * Hashes a canonicalized string using SHA-256 and returns it as hex string.
   * @public
   * @param {string} canonicalized
   * @returns {string}
   */
  public hashhex(canonicalized: string): string {
    return this.hex(this.hash(canonicalized));
  }

  /**
   * Canonicalizes a given object according to RFC 8785 (https://tools.ietf.org/html/rfc8785),
   * which describes JSON Canonicalization Scheme (JCS). This function sorts the keys of the
   * object and its nested objects alphabetically and then returns a stringified version of it.
   * This method handles nested objects, array values, and null values appropriately.
   *
   * @param {JSONObject} object The object to canonicalize.
   * @returns {string} The stringified version of the input object with its keys sorted alphabetically per RFC 8785.
   */
  public jcs(object: JSONObject): string {
    if (typeof object === 'number' && isNaN(object)) {
      throw new Error('NaN is not allowed');
    }

    if (typeof object === 'number' && !isFinite(object)) {
      throw new Error('Infinity is not allowed');
    }

    if (object === null || typeof object !== 'object') {
      return JSON.stringify(object);
    }

    if (object.toJSON instanceof Function) {
      return this.jcs(object.toJSON());
    }

    if (Array.isArray(object)) {
      const values = object.reduce((t, cv, ci) => {
        const comma = ci === 0 ? '' : ',';
        const value = cv === undefined || typeof cv === 'symbol' ? null : cv;
        return `${t}${comma}${this.jcs(value)}`;
      }, '');
      return `[${values}]`;
    }

    const values = Object.keys(object).sort().reduce((t, cv: any) => {
      if (object[cv] === undefined ||
        typeof object[cv] === 'symbol') {
        return t;
      }
      const comma = t.length === 0 ? '' : ',';
      return `${t}${comma}${this.jcs(cv)}:${this.jcs(object[cv])}`;
    }, '');
    return `{${values}}`;
  }
}

export const canonicalization = new Canonicalization();