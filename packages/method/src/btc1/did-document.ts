import { DidService, DidVerificationMethod, DidDocument as IDidDocument } from '@web5/dids';
import { DidDocumentError } from '../utils/errors.js';
import { BeaconService } from './beacons/interface.js';
import { BeaconUtils } from './beacons/utils.js';
import { BTC1_DID_DOCUMENT_CONTEXT } from './constants.js';
import { DidBtc1Identifier } from './crud/create.js';
import { Btc1Utils } from './utils.js';

/**
 * DID BTC1 Verification Method extends the DidVerificationMethod class adding helper methods and properties
 * @export
 * @class Btc1VerificationMethod
 * @type {Btc1VerificationMethod}
 * @implements {DidVerificationMethod}
 */
export class Btc1VerificationMethod implements DidVerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string | undefined;
  constructor(id: string, type: string, controller: string, publicKeyMultibase?: string) {
    this.id = id;
    this.type = type;
    this.controller = controller;
    this.publicKeyMultibase = publicKeyMultibase;
  }

  // TODO: Add helper methods and properties
}

export interface IBtc1DidDocument extends IDidDocument {
  id: string;
  controller?: string | string[];
  '@context'?: string | (string | Record<string, any>)[];
  verificationMethod: DidVerificationMethod[];
  authentication?: (string | DidVerificationMethod)[];
  assertionMethod?: (string | DidVerificationMethod)[];
  capabilityInvocation?: (string | DidVerificationMethod)[];
  capabilityDelegation?: (string | DidVerificationMethod)[];
  service: BeaconService[];
}

/**
 * BTC1 DID Document extends the DidDocument class adding helper methods and properties
 * @export
 * @class Btc1DidDocument
 * @type {Btc1DidDocument}
 * @implements {IBtc1DidDocument}
 */
export class Btc1DidDocument implements IBtc1DidDocument {
  id: string;
  controller?: string | string[];
  '@context'?: string | (string | Record<string, any>)[] = BTC1_DID_DOCUMENT_CONTEXT;
  verificationMethod: DidVerificationMethod[];
  authentication?: (string | DidVerificationMethod)[] = ['#initialKey'];
  assertionMethod?: (string | DidVerificationMethod)[] = ['#initialKey'];
  capabilityInvocation?: (string | DidVerificationMethod)[] = ['#initialKey'];
  capabilityDelegation?: (string | DidVerificationMethod)[] = ['#initialKey'];
  service: BeaconService[];

  constructor({ id, verificationMethod, service }: Btc1DidDocument) {
    const ERROR_TYPE = 'BTC1_DID_DOCUMENT_CONSTRUCTOR_ERROR';
    // Validate the id
    if (!Btc1DidDocument.isValidId(id)) {
      throw new DidDocumentError('Invalid "id"', ERROR_TYPE, { id });
    }
    // Set the id and controller
    this.id = id;
    this.controller = id;

    // Validate the verification method
    if (!Btc1DidDocument.isValidVerificationMethods(verificationMethod)) {
      throw new DidDocumentError('Invalid "verificationMethod"', ERROR_TYPE, { verificationMethod });
    }
    // Set the verification method
    this.verificationMethod = verificationMethod;

    // Validate the service
    if (!Btc1DidDocument.isValidServices(service)) {
      throw new DidDocumentError('Invalid "service"', ERROR_TYPE, { service });
    }
    // Set the service
    this.service = service;

    // Validate the DID Document
    Btc1DidDocument.validate(this);
  }

  /**
   * Validates a Btc1DidDocument by breaking it into modular validation methods.
   * @public
   * @static
   * @param {Btc1DidDocument} didDocument The DID document to validate.
   * @returns {boolean} True if the DID document is valid.
   * @throws {DidDocumentError} If any validation check fails.
   */
  public static isValid(didDocument: Btc1DidDocument): boolean {
    if (!this.isValidContext(didDocument?.['@context'])) {
      throw new DidDocumentError('Invalid "@context"', 'DID_DOCUMENT_CONTEXT_ERROR', didDocument);
    }
    if (!this.isValidId(didDocument?.id)) {
      throw new DidDocumentError('Invalid "id"', 'DID_DOCUMENT_ID', didDocument);
    }
    if (!this.isValidVerificationMethods(didDocument?.verificationMethod)) {
      throw new DidDocumentError('Invalid "verificationMethod"', 'DID_DOCUMENT_VERIFICATION_METHOD_ERROR', didDocument);
    }
    if (!this.isValidServices(didDocument?.service)) {
      throw new DidDocumentError('Invalid "service"', 'DID_DOCUMENT_SERVICE_ERROR', didDocument);
    }
    if (!this.isValidVerificationRelationships(didDocument)) {
      throw new DidDocumentError('Invalid verification relationships', 'DID_DOCUMENT_ERROR', didDocument);
    }
    return true;
  }

  /**
   * Validates that "@context" exists and includes correct values.
   * @private
   */
  private static isValidContext(context: Btc1DidDocument['@context']): boolean {
    if(!context) return false;
    if(!Array.isArray(context) && typeof context !== 'string') return false;
    if(Array.isArray(context) && !context.every(ctx => typeof ctx === 'string' && BTC1_DID_DOCUMENT_CONTEXT.includes(ctx))) return false;
    return true;
  }

  /**
   * Validates that the DID Document has a valid id.
   * @private
   */
  private static isValidId(id: DidBtc1Identifier): boolean {
    try {
      Btc1Utils.parse(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates that verification methods exist and are correctly formatted.
   * @private
   */
  private static isValidVerificationMethods(verificationMethod: DidVerificationMethod[]): boolean {
    return Array.isArray(verificationMethod) && verificationMethod.every(Btc1Utils.isDidVerificationMethod);
  }

  /**
   * Validates that the DID Document has valid services.
   * @private
   */
  private static isValidServices(service: DidService[]): boolean {
    return Array.isArray(service) && service.every(BeaconUtils.isBeaconService);
  }

  /**
   * Validates verification relationships (authentication, assertionMethod, capabilityInvocation, capabilityDelegation).
   * @private
   */
  private static isValidVerificationRelationships(didDocument: Btc1DidDocument): boolean {
    const verificationRelationships: (keyof Btc1DidDocument)[] = [
      'authentication',
      'assertionMethod',
      'capabilityInvocation',
      'capabilityDelegation'
    ];

    return verificationRelationships.every((key) =>
      didDocument[key] &&
      Array.isArray(didDocument[key]) &&
      didDocument[key].every(
        entry => typeof entry === 'string' || Btc1Utils.isDidVerificationMethod(entry)
      ));
  }

  /**
   * Validate the DID Document
   * @public
   * @static
   * @returns {Btc1DidDocument} Validated DID Document.
   * @throws {DidDocumentError} If the DID Document is invalid.
   */
  public static validate(didDocument: Btc1DidDocument): Btc1DidDocument {
    // Validate the DID Document
    Btc1DidDocument.isValid(didDocument);

    // Return the DID Document
    return didDocument;
  }

}