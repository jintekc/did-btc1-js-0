import type { DidResolutionResult, DidVerificationMethod, DidCreateOptions as IDidCreateOptions } from '@web5/dids';
import {
  Did,
  DidError,
  DidErrorCode,
  DidMethod,
  EMPTY_DID_RESOLUTION_RESULT
} from '@web5/dids';
import { initEccLib } from 'bitcoinjs-lib';
import * as tinysecp from 'tiny-secp256k1';
import { Btc1Create, DidCreateResponse } from './btc1/crud/create.js';
import { Btc1Read } from './btc1/crud/read.js';
import { Btc1Update } from './btc1/crud/update.js';
import { Btc1DidDocument } from './btc1/did-document.js';
import { Btc1KeyManager } from './btc1/key-manager/index.js';
import { Btc1Networks, DidBtc1IdTypes } from './types/crud.js';
import { Btc1Utils } from './btc1/utils.js';
import { DidBtc1Error } from './utils/errors.js';
import { W3C_DID_RESOLUTION_V1 } from './btc1/constants.js';
import { DidResolutionOptions, DidUpdateParams, IntermediateDocument } from './btc1/crud/interface.js';
import { PublicKeyBytes } from '@did-btc1/key-pair';

/** Initialize tiny secp256k1 */
initEccLib(tinysecp);

export type IdType = 'key' | 'external';
export interface DidCreateOptions extends IDidCreateOptions<Btc1KeyManager> {
  /** DID BTC1 Version Number */
  version?: string;
  /** Bitcoin Network */
  network?: string;
}
export type DidCreateParams =
  | { idType: 'key'; pubKeyBytes: PublicKeyBytes; options?: DidCreateOptions }
  | { idType: 'external'; intermediateDocument: IntermediateDocument; options?: DidCreateOptions };

/**
 * Implements {@link https://dcdpr.github.io/did-btc1 | did:btc1 DID Method Specification}.
 *
 * did:btc1 is a censorship resistant DID Method using the Bitcoin blockchain as a Verifiable Data Registry to announce
 * changes to the DID document. It improves on prior work by allowing: zero-cost off-chain DID creation; aggregated
 * updates for scalable on-chain update costs; long-term identifiers that can support frequent updates; private
 * communication of the DID document; private DID resolution; and non-repudiation appropriate for serious contracts.
 *
 * @export
 * @class DidBtc1
 * @type {DidBtc1}
 * @implements {DidMethod}
 */
export class DidBtc1 implements DidMethod {
  /** @type {string} Name of the DID method, as defined in the DID BTC1 specification */
  public static methodName: string = 'btc1';

  /**
   * Entry point for section {@link https://dcdpr.github.io/did-btc1/#create | 4.1 Create}.
   * See {@link Btc1Create} for implementation details.
   *
   * A did:btc1 identifier and associated DID document can either be created deterministically from a cryptographic
   * seed, or it can be created from an arbitrary genesis intermediate DID document representation. In both cases,
   * DID creation can be undertaken in an offline manner, i.e., the DID controller does not need to interact with the
   * Bitcoin network to create their DID.
   *
   * @public
   * @static
   * @async
   *
   * @param {DidCreateParams} params See {@link DidCreateParams} for details.
   * @param {IdType} params.idType Type of identifier to create (key or external).
   * @param {PublicKeyBytes} params.pubKeyBytes Public key byte array used to create a btc1 "key" identifier.
   * @param {IntermediateDocument} params.intermediateDocument DID Document used to create a btc1 "external" identifier.
   * @param {DidCreateOptions} params.options See {@link DidCreateOptions} for create options.
   * @param {string} params.options.version Version number of the btc1 method.
   * @param {string} params.options.network Bitcoin network name (mainnet, testnet, signet, regtest).
   * @returns {Promise<CreateResponse>} Promise resolving to a CreateResponse object.
   * @throws {DidBtc1Error} if any of the checks fail
   */
  public static async create(params: DidCreateParams): Promise<DidCreateResponse> {
    const type = 'BTC1_CREATE_ERROR';
    // Deconstruct the idType and options from the params
    const { idType, options = {} } = params;

    // Validate that the idType is set to either key or external
    if (!(idType in DidBtc1IdTypes)) {
      throw new DidBtc1Error(`Invalid idType: expected "key" or "external"`, { type, data: idType });
    }

    // Deconstruct options and set the default values
    const { version = '1', network = 'mainnet' } = options;

    // Validate network in Btc1Networks
    if (!(network in Btc1Networks)) {
      throw new DidBtc1Error('Invalid network: must be one of valid bitcoin network', { type, data: network });
    }

    // Validate version as number > 0
    const versionNumber = Number(version);
    if (isNaN(versionNumber) || versionNumber <= 0) {
      throw new DidBtc1Error('Invalid version: must be be convertable to a number > 0', { type, data: version });
    }

    // If idType is key, call Btc1Create.deterministic
    if(idType === 'key') {
      // Deconstruct the pubKeyBytes from the params
      const { pubKeyBytes } = params;

      // Validate pubKeybytes exists if idType = key
      if (!pubKeyBytes) {
        throw new DidBtc1Error('Invalid pubKeyBytes: cannot be null', { type, data: { pubKeyBytes, idType } });
      }

      // Validate pubKeyBytes is 32 or 33 bytes
      if(pubKeyBytes && ![32, 33].includes(pubKeyBytes.length)) {
        throw new DidBtc1Error(
          'Invalid pubKeyBytes: must be 32 byte x-only or 33 byte compressed',
          { type, data: { pubKeyBytes, idType } }
        );
      }

      // Convert 32 byte public key to 33 byte with 0x02 parity
      const publicKey = pubKeyBytes.length === 32
        ? new Uint8Array([0x02, ...pubKeyBytes])
        : pubKeyBytes;

      // Return call to Btc1Create.deterministic
      return Btc1Create.deterministic({ version, network, publicKey });
    }

    // If idType is external, call Btc1Create.external
    if(idType === 'external') {
      // Deconstruct the intermediateDocument from the params
      const { intermediateDocument } = params;

      // Validate intermediateDocument exists if idType = external
      if (!intermediateDocument) {
        const opts = { type, data: { intermediateDocument, idType } };
        throw new DidBtc1Error('Invalid intermediateDocument: cannot be null', opts);
      }

      // Return call to Btc1Create.external
      return await Btc1Create.external({ network, version, intermediateDocument });
    }


    // Throw error if idType is not key or external
    throw new DidBtc1Error('Invalid idType: expected "key" or "external"', { type, data: idType });
  }

  /**
   * TODO #1: Finish implementing per spec
   * Entry point for section {@link https://dcdpr.github.io/did-btc1/#read | 4.2 Read}.
   * See {@link Btc1Read} for implementation details.
   *
   * The read operation is executed by a resolver after a resolution request identifying a specific did:btc1 identifier
   * is received from a client at Resolution Time. The request MAY contain a resolutionOptions object containing
   * additional information to be used in resolution. The resolver then attempts to resolve the DID document of the
   * identifier at a specific Target Time. The Target Time is either provided in resolutionOptions or is set to the
   * Resolution Time of the request.
   *
   * @public
   * @static
   * @async
   * @param {string} identifier The DID to be resolved
   * @param {DidResolutionOptions} options Optional parameters for the resolution operation
   * @param {Btc1DidDocument} options.sidecarData.initialDocument User-provided, offline DID Document to resolve sidecar
   * @returns {DidResolutionResult} Promise resolving to a DID Resolution Result
   * @throws {Error} if the resolution fails for any reason
   * @throws {DidError} with {@link DidErrorCode.InvalidDid} if the identifier is invalid
   * @example
   * ```ts
   * const resolution = await DidBtc1.resolve('did:btc1:k1q0dygyp3gz969tp46dychzy4q78c2k3js68kvyr0shanzg67jnuez2cfplh')
   * ```
   */
  public static async resolve(identifier: string, options: DidResolutionOptions = {}): Promise<DidResolutionResult> {
    try {
      // Parse the identifier into its components
      const components = Btc1Utils.parse(identifier);

      // Resolve the DID Document based on the hrp
      const initialDocument = await Btc1Read.initialDocument({ identifier, components, options });

      // Set the default resolution result
      const didResolutionResult: DidResolutionResult = {
        '@context'            : W3C_DID_RESOLUTION_V1,
        didResolutionMetadata : {},
        didDocumentMetadata   : {},
        didDocument           : {} as Btc1DidDocument
      };

      // Add the parsed identifier components to the resolution options
      options.components = components;
      didResolutionResult.didDocument = await Btc1Read.targetDocument({ initialDocument, options });

      // Return the resolved DID Document
      return didResolutionResult;
    } catch (error: any) {
      console.error(error);
      // Rethrow any unexpected errors that are not a `DidError`.
      if (!(error instanceof DidError)) throw new Error(error);

      // Return a DID Resolution Result with the appropriate error code.
      return {
        ...EMPTY_DID_RESOLUTION_RESULT,
        didResolutionMetadata : {
          error : error.code,
          ...error.message && { errorMessage: error.message }
        }
      };
    }
  }

  /**
   * TODO #2: Finish implementing per spec
   * Entry point for section {@link https://dcdpr.github.io/did-btc1/#update | 4.3 Update}.
   * See {@link Btc1Update} for implementation details.
   *
   * An update to a did:btc1 document is an invoked capability using the ZCAP-LD data format, signed by a
   * verificationMethod that has the authority to make the update as specified in the previous DID document. Capability
   * invocations for updates MUST be authorized using Data Integrity following the schnorr-secp256k1-jcs-2025
   * cryptosuite with a proofPurpose of capabilityInvocation.
   *
   * @public
   * @static
   * @async
   * @param {DidUpdateParams} params Required parameters for the update operation
   * @param {string} params.identifier The DID to be updated
   * @param {Btc1DidDocument} params.sourceDocument The source document to be updated
   * @param {string} params.sourceVersionId The versionId of the source document
   * @param {Btc1DocumentPatch} params.documentPatch The JSON patch to be applied to the source document
   * @param {string} params.verificationMethodId The verificationMethod ID to sign the update
   * @param {string[]} params.beaconIds The beacon IDs to announce the update
   * @param {ProofOptions} params.options Optional parameters for the update operation
   * @returns {Promise<void>} Promise resolving to void
   * @throws {DidError} if the verificationMethod type is not `Multikey` or the publicKeyMultibase header is not `z66P`
   */
  public static async update({
    identifier,
    sourceDocument,
    sourceVersionId,
    patch,
    verificationMethodId,
    beaconIds,
    options
  }: DidUpdateParams): Promise<any> {
    // Construct an unsigned update payload
    const updatePayload = await Btc1Update.construct({
      identifier,
      patch,
      sourceDocument,
      sourceVersionId,
    });

    // Get the sourceDocument verificationMethods and filter for the verificationMethodId passed
    const vms = Btc1Utils.getVerificationMethods({ didDocument: sourceDocument });
    const vm = vms.filter(vm => vm.id === verificationMethodId)?.[0];

    // Validate the verificationMethod type is Multikey
    if (vm.type !== 'Multikey') {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Verification method must be type Multikey');
    }

    // Validate the first 4 chars as z66P of the verificationMethod publicKeyMultibase
    if (vm.publicKeyMultibase?.slice(0, 4) !== 'z66P') {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Malformed verification method publicKeyMultibase');
    }
    // Invoke the update payload and announce the update
    const didUpdateInvocation = Btc1Update.invoke({ identifier, updatePayload, verificationMethod: vm, options });
    // TODO: finish once announcePayload complete
    return await Btc1Update.announce({ sourceDocument, beaconIds, didUpdateInvocation });
  }

  /**
   * Given the W3C DID Document of a `did:btc1` identifier, return the signing verification method that will be used
   * for signing messages and credentials. If given, the `methodId` parameter is used to select the
   * verification method. If not given, the Identity Key's verification method with an ID fragment
   * of '#initialKey' is used.
   *
   * @public
   * @static
   * @async
   * @param {{ didDocument: Btc1DidDocument; methodId?: string; }} params Parameters for the `getSigningMethod` method.
   * @param {DidDocument} params.didDocument DID Document to get the verification method from.
   * @param {string} params.methodId Optional ID of the verification method to use for signing.
   * @returns {DidVerificationMethod} Promise resolving to the verification method used for signing.
   * @throws {DidError} if the parsed did method does not match `btc1` or signing method could not be determined.
   */
  public static async getSigningMethod({ didDocument, methodId }: {
    didDocument: Btc1DidDocument;
    methodId?: string;
  }): Promise<DidVerificationMethod> {
    // Set the default methodId to the first assertionMethod if not given
    methodId ??= '#initialKey';

    // Verify the DID method is supported.
    const parsedDid = Did.parse(didDocument.id);
    if (parsedDid && parsedDid.method !== this.methodName) {
      throw new DidError(DidErrorCode.MethodNotSupported, `Method not supported: ${parsedDid.method} `);
    }

    // Attempt to find a verification method that matches the given method ID, or if not given,
    // find the first verification method intended for signing claims.
    const verificationMethod = didDocument.verificationMethod?.find(
      (vm: DidVerificationMethod) => Btc1Utils.extractDidFragment(vm.id) === (Btc1Utils.extractDidFragment(methodId)
        ?? Btc1Utils.extractDidFragment(didDocument.assertionMethod?.[0]))
    );

    // If no verification method is found, throw an error
    if (!(verificationMethod && verificationMethod.publicKeyMultibase)) {
      throw new DidError(
        DidErrorCode.InternalError,
        'A verification method intended for signing could not be determined from the DID Document'
      );
    }
    return verificationMethod;
  }
}