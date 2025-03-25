import { bech32 } from '@scure/base';
import {
  DidDocument,
  DidError,
  DidErrorCode,
  DidService,
  DidVerificationMethod,
  DidVerificationRelationship
} from '@web5/dids';
import { DidBtc1 } from '../did-btc1.js';
import { Btc1Networks } from './crud/types.js';
import { DidComponents } from './interface.js';

/**
 * Utility functions for the {@link https://dcdpr.github.io/did-btc1/ | DID BTC1} method
 *
 * @export
 * @class Btc1Utils
 * @type {Btc1Utils}
 */
export class Btc1Utils {
  /**
   * Parses a `did:btc1` identifier into its components
   * @public
   * @static
   * @param {string} identifier The BTC1 DID to be parsed
   * @returns {DidComponents} The parsed identifier components
   * @throws {DidError} if an error occurs while parsing the identifier
   * @throws {DidErrorCode.InvalidDid} if identifier is invalid
   * @throws {DidErrorCode.MethodNotSupported} if the method is not supported
   */
  static parse(identifier: string): DidComponents {
    // Split the identifier into its components
    const components = identifier.split(':') ?? [];

    // Validate the identifier has at least 3 components
    if (components.length < 3) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid did: ${identifier}`);
    }

    // Deconstruct the components of the identifier: scheme, method, fields
    // possible values in `fields`: [id], [{version|network}, id], [version, network, id]
    const [scheme, method, ...fields] = components;

    // Validate the scheme is 'did'
    if (!scheme || scheme !== 'did') {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid did scheme: ${scheme} `);
    }

    // Validate the method is 'btc1'
    if (!method || method !== DidBtc1.methodName) {
      throw new DidError(DidErrorCode.MethodNotSupported, `Did Method not supported: ${method} `);
    }

    // Validate the fields are not empty
    if (fields.length < 1) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${identifier} `);
    }

    // Regardless of the length (3-5), the id should always be the last component
    const idBech32 = fields.pop();
    // Validate the idBech32 is defined
    if (!idBech32) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${identifier} `);
    }

    // Decode the idBech32 to bytes and hrp
    const { prefix: hrp, bytes: genesisBytes } = bech32.decodeToBytes(idBech32);

    // Validate the id is valid starting with 'x' or 'k'
    if (!['x', 'k'].includes(hrp)) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${fields[0]} `);
    }

    // Set the valid idBech32 in identifierComponents object
    const identifierComponents = {
      idBech32,
      version : '1',
      network : 'mainnet',
    } as DidComponents;

    // Set the hrp and genesisBytes in identifierComponents object
    identifierComponents.hrp = hrp;
    identifierComponents.genesisBytes = genesisBytes;

    // If no fields left, set version and network to default values
    if (fields.length === 0) {
      identifierComponents.version = '1';
      identifierComponents.network = 'mainnet';
    }
    // If one field left, check if its a valid version Number and set version & network accordingly
    else if (fields.length === 1) {
      const version = Number(fields[0]);
      const fieldIsVersion = !isNaN(version);
      identifierComponents.version = fieldIsVersion ? fields[0] : '1';
      identifierComponents.network = fieldIsVersion ? 'mainnet' : fields[0];
    }
    // If two fields left, set version and network accordingly
    else if (fields.length === 2) {
      identifierComponents.version = fields[0];
      identifierComponents.network = fields[1];
    }
    // If any other length, throw InvalidDid error
    else
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: ${identifier}`);

    // Validate version is a positive number after being set
    if (isNaN(Number(identifierComponents.version))) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: version must convert to a positive number`);
    }
    // Validate network is one of mainnet, testnet, signet or regtest after being set
    if (!(identifierComponents.network in Btc1Networks)) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid Did: network must be mainnet, testnet, signet or regtest`);
    }

    return identifierComponents;
  }

  /**
   * Extracts a DID fragment from a given input
   * @public
   * @static
   * @param {unknown} input The input to extract the DID fragment from
   * @returns {string | undefined} The extracted DID fragment or undefined if not found
   */
  public static extractDidFragment(input: unknown): string | undefined {
    if (typeof input !== 'string') return undefined;
    if (input.length === 0) return undefined;
    return input;
  }

  /**
   * Validates that the given object is a DidVerificationMethod
   * @public
   * @static
   * @param {unknown} obj The object to validate
   * @returns {boolean} A boolean indicating whether the object is a DidVerificationMethod
   */
  public static isDidVerificationMethod(obj: unknown): obj is DidVerificationMethod {
    // Validate that the given value is an object.
    if (!obj || typeof obj !== 'object' || obj === null) return false;

    // Validate that the object has the necessary properties of a DidVerificationMethod.
    if (!('id' in obj && 'type' in obj && 'controller' in obj)) return false;

    if (typeof obj.id !== 'string') return false;
    if (typeof obj.type !== 'string') return false;
    if (typeof obj.controller !== 'string') return false;

    return true;
  }

  /**
   * Validates that the given object is a DidService
   * @public
   * @static
   * @param {unknown} obj The object to validate
   * @returns {boolean} A boolean indicating whether the object is a DidService
   */
  public static isDidService(obj: unknown): obj is DidService {
    // Validate that the given value is an object.
    if (!obj || typeof obj !== 'object' || obj === null) return false;
    // Validate that the object has the necessary properties of a DidService.
    if (!('id' in obj && 'type' in obj && 'serviceEndpoint' in obj)) return false;
    if (typeof obj.id !== 'string') return false;
    if (typeof obj.type !== 'string') return false;
    if (typeof obj.serviceEndpoint !== 'string') return false;
    return true;
  }

  /**
   * Extracts the verification methods from a given DID Document
   * @public
   * @static
   * @param {DidDocument} didDocument The DID Document to extract the verification methods from
   * @returns {DidVerificationMethod[]} An array of DidVerificationMethod objects
   * @throws {TypeError} if the didDocument is not provided
   */
  public static getVerificationMethods({ didDocument }: { didDocument: DidDocument; }): DidVerificationMethod[] {
    if (!didDocument) throw new TypeError(`Required parameter missing: 'didDocument'`);
    const verificationMethods: DidVerificationMethod[] = [];
    // Check the 'verificationMethod' array.
    verificationMethods.push(...didDocument.verificationMethod?.filter(Btc1Utils.isDidVerificationMethod) ?? []);
    // Check verification relationship properties for embedded verification methods.
    Object.keys(DidVerificationRelationship).forEach((relationship) => {
      verificationMethods.push(
        ...(didDocument[relationship as keyof DidDocument] as (DidVerificationMethod)[])
          ?.filter(Btc1Utils.isDidVerificationMethod) ?? []
      );
    });
    return verificationMethods;
  }
}