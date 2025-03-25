import type { DidService } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { base58btc } from 'multiformats/bases/base58';
import { InvokePayloadParams, SignalMetdata } from '../../types/crud.js';
import { GeneralUtils } from '../../utils/general.js';
import JsonPatch, { PatchOperation } from '../../utils/json-patch.js';
import { BeaconFactory } from '../beacons/factory.js';
import { BeaconService } from '../beacons/interface.js';
import { BTC1_DID_UPDATE_PAYLOAD_CONTEXT, W3C_ZCAP_V1 } from '../constants.js';
import { Btc1DidDocument, Btc1VerificationMethod } from '../did-document.js';
import { Btc1RootCapability, DidUpdatePayload } from './interface.js';
import { canonicalization, DidBtc1Error } from '@did-btc1/common';

const { canonicalhash } = canonicalization;

/**
 * Implements did-btc1 spec section {@link https://dcdpr.github.io/did-btc1/#update | 4.3 Update} of the CRUD sections
 * for updating `did:btc1` dids and did documents.
 * @export
 * @class Btc1Update
 * @type {Btc1Update}
 */
export class Btc1Update {
  /**
   *
   * {@link https://dcdpr.github.io/did-btc1/#construct-did-update-payload | 4.3.1 Construct DID Update Payload}.
   *
   * The Construct DID Update Payload algorithm applies the documentPatch to the sourceDocument and verifies the
   * resulting targetDocument is a conformant DID document. It takes in a btc1Identifier, sourceDocument,
   * sourceVersionId, and documentPatch objects. It returns an unsigned DID Update Payload.
   *
   * @public
   * @static
   * @async
   * @param {ConstructPayloadParams} params See  {@link ConstructPayloadParams} for more details.
   * @param {string} params.identifier The did-btc1 identifier to derive the root capability from.
   * @param {Btc1DidDocument} params.sourceDocument The source document to be updated.
   * @param {string} params.sourceVersionId The versionId of the source document.
   * @param {DidDocumentPatch} params.documentPatch The JSON patch to be applied to the source document.
   * @returns {Promise<DidUpdatePayload>} The constructed DidUpdatePayload object.
   * @throws {DidError} with {@link DidErrorCode.InvalidDid} if sourceDocument.id does not match identifier.
   */
  public static async construct({
    identifier,
    sourceDocument,
    sourceVersionId,
    patch,
  }: {
    identifier: string;
    sourceDocument: Btc1DidDocument;
    sourceVersionId: string;
    patch: PatchOperation[];
  }): Promise<DidUpdatePayload> {
    // Validate the sourceDocument id matches the identifier
    if (sourceDocument.id !== identifier) {
      throw new DidError(DidErrorCode.InvalidDid, 'Source document id does not match identifier');
    }

    // Canonical sha256 hash the sourceDocument
    const sourceDocHash = await canonicalhash(sourceDocument);

    // Set updatePayload object
    const updatePayload: DidUpdatePayload = {
      '@context'      : BTC1_DID_UPDATE_PAYLOAD_CONTEXT,
      patch           : patch,
      targetHash      : '',
      targetVersionId : Number(sourceVersionId) + 1,
      sourceHash      : base58btc.encode(sourceDocHash),
    };

    // Apply patch to source document
    const updatedDocument = JsonPatch.apply(sourceDocument, patch);

    // Validate the targetDocument conforms to DID document spec
    const targetDocument = Btc1DidDocument.validate(updatedDocument);

    // Canonical sha256 hash the targetDocument
    const targetDocHash = await canonicalhash(targetDocument);

    // Set the targetHash in the DidUpdatePayload
    updatePayload.targetHash = base58btc.encode(targetDocHash);

    // Return the updatePayload
    return updatePayload;
  }

  /**
   * TODO: Update method per the spec
   *
   * {@link https://dcdpr.github.io/did-btc1/#invoke-did-update-payload | 4.3.2 Invoke DID Update Payload}.
   *
   * The Invoke DID Update Payload algorightm retrieves the privateKeyBytes for the verificationMethod and adds a
   * capability invocation in the form of a Data Integrity proof following the Authorization Capabilities (ZCAP-LD) and
   * VC Data Integrity specifications. It takes in a btc1Identifier, an unsigned didUpdatePayload, and a
   * verificationMethod. It returns the invoked DID Update Payload.
   *
   * @static
   * @param {InvokePayloadParams} params Required params for calling the invokePayload method
   * @param {string} params.identifier The did-btc1 identifier to derive the root capability from
   * @param {DidUpdatePayload} params.updatePayload The updatePayload object to be signed
   * @param {DidVerificationMethod} params.verificationMethod The verificationMethod object to be used for signing
   * @param {RecoveryOptions} params.options The options object containing seed, entropy, mnemonic, and path
   * @returns {ProofOptions} Object containing the proof options
   * @throws {DidBtc1Error} if the privateKeyBytes are invalid
   */
  public static invoke({
    identifier,
    verificationMethod,
    options: {
      seed,
      entropy,
      hd: { mnemonic, path },
    } }: InvokePayloadParams): any {
    // Derive privateKeyBytes from mnemonic & path, seed, or entropy, salt
    let privateKeyBytes = mnemonic && path
      ? GeneralUtils.recoverHdChildFromMnemonic(mnemonic, path)
      : seed
        ? GeneralUtils.recoverHdWallet(seed)
        : entropy
          ? GeneralUtils.recoverRawPrivateKey(entropy)
          : null;
    // Validate privateKeyBytes
    if (!privateKeyBytes) {
      throw new DidBtc1Error('Invalid privateKeyBytes');
    }
    // Derive the root capability from the identifier
    const rootCapability = this.deriveRootCapability(identifier);
    // Construct the proof options
    const proofOptions = {
      type               : 'DataIntegrityProof',
      cryptosuite        : 'bip340-jcs-2025',
      verificationMethod : verificationMethod.id as any,
      proofPurpose       : 'capabilityInvocation',
      capability         : rootCapability.id,
      capabilityAction   : 'Write',
    };
    console.log('proofOptions:', proofOptions);
    return proofOptions;
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#derive-root-capability-from-didbtc1-identifier | 4.3.3.1 Derive Root Capability}.
   *
   * The Derive Root Capability algorithm deterministically generates a ZCAP-LD root capability from a given did:btc1
   * identifier. Each root capability is unique to the identifier. This root capability is defined and understood by the
   * did:btc1 specification as the root capability to authorize updates to the specific did:btc1 identifiers DID
   * document. It takes in a did:btc1 identifier and returns a rootCapability object. It returns the root capability.
   *
   * @public
   * @static
   * @param {string} identifier The did-btc1 identifier to derive the root capability from
   * @returns {Btc1RootCapability} The root capability object
   * @example Root capability for updating the DID document for did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u
   * ```
   * {
   *  "@context": "https://w3id.org/zcap/v1",
   *  "id": "urn:zcap:root:did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u",
   *  "controller": "did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u",
   *  "invocationTarget": "did:btc1:k1q0rnnwf657vuu8trztlczvlmphjgc6q598h79cm6sp7c4fgqh0fkc0vzd9u"
   * }
   * ```
   */
  public static deriveRootCapability(identifier: string): Btc1RootCapability {
    return {
      '@context'       : W3C_ZCAP_V1,
      id               : `urn:zcap:root:${encodeURIComponent(identifier)}`,
      controller       : identifier,
      invocationTarget : identifier,
    };
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#announce-did-update | 4.3.4 Announce DID Update}.
   *
   * The Announce DID Update algorithm retrieves beaconServices from the sourceDocument and calls the Broadcast DID
   * Update algorithm corresponding to the type of the Beacon. It takes in a btc1Identifier, sourceDocument, an array of
   * beaconIds, and a didUpdateInvocation. It returns an array of signalsMetadata, containing the necessary
   * data to validate the Beacon Signal against the didUpdateInvocation.
   *
   * @public
   * @static
   * @async
   * @param {AnnounceUpdatePayloadParams} params Required params for calling the announcePayload method
   * @param {} params.sourceDocument The did-btc1 did document to derive the root capability from
   * @param {} params.beaconIds The didUpdatePayload object to be signed
   * @param {} params.didUpdateInvocation The verificationMethod object to be used for signing
   * @returns {} Array of signalMetadata objects with necessary data to validate Beacon Signal against Did Update
   * @throws {DidError} if the beaconService type is invalid
   */
  public static async announce({ sourceDocument, beaconIds, didUpdateInvocation }: {
    sourceDocument: Btc1DidDocument;
    beaconIds: string[];
    didUpdateInvocation: Btc1VerificationMethod;
  }): Promise<SignalMetdata[]> {
    const beaconServices: BeaconService[] = [];
    const signalsMetadata = [];
    // Find the beacon services in the sourceDocument
    for (const beaconId of beaconIds) {
      const beaconService = sourceDocument.service.find((s: DidService) => s.id === beaconId);
      if (!beaconService) {
        throw new DidError(DidErrorCode.InvalidDidDocument, `Beacon not found: ${beaconId}`);
      }
      beaconServices.push(beaconService);
    }
    // Broadcast the didUpdatePayload to each beaconService
    for (const beaconService of beaconServices) {
      const beacon = BeaconFactory.create(beaconService);
      const signal = await beacon.broadcastSignal(beaconService, didUpdateInvocation);
      signalsMetadata.push(signal);
    }

    // Return the signalsMetadata
    return signalsMetadata;
  }
}