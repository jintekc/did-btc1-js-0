import { Btc1Error, canonicalization, Logger } from '@did-btc1/common';
import { Cryptosuite, DataIntegrityProof, Multikey, ProofOptions } from '@did-btc1/cryptosuite';
import type { DidService } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { base58btc } from 'multiformats/bases/base58';
import { DidUpdatePayload } from '../../interfaces/crud.js';
import { BeaconService } from '../../interfaces/ibeacon.js';
import { TxId } from '../../types/bitcoin.js';
import { InvokePayloadParams, Metadata, SignalsMetadata } from '../../types/crud.js';
import { Btc1Appendix } from '../../utils/btc1/appendix.js';
import { BTC1_DID_UPDATE_PAYLOAD_CONTEXT } from '../../utils/btc1/constants.js';
import { Btc1DidDocument } from '../../utils/btc1/did-document.js';
import JsonPatch, { PatchOperation } from '../../utils/json-patch.js';
import { BeaconFactory } from '../beacons/factory.js';
import { Btc1KeyManager } from '../key-manager/index.js';

const { canonicalhash } = canonicalization;

/**
 * Implements did-btc1 spec section {@link https://dcdpr.github.io/did-btc1/#update | 4.3 Update} of the CRUD sections
 * for updating `did:btc1` dids and did documents.
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
   * @param {ConstructPayloadParams} params See  {@link ConstructPayloadParams} for more details.
   * @param {string} params.identifier The did-btc1 identifier to derive the root capability from.
   * @param {Btc1DidDocument} params.sourceDocument The source document to be updated.
   * @param {string} params.sourceVersionId The versionId of the source document.
   * @param {DidDocumentPatch} params.documentPatch The JSON patch to be applied to the source document.
   * @returns {Promise<DidUpdatePayload>} The constructed DidUpdatePayload object.
   * @throws {DidError} InvalidDid if sourceDocument.id does not match identifier.
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
      proof           : {}
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
   * The Invoke DID Update Payload algorithm takes in a btc1Identifier, an unsigned didUpdatePayload, and a
   * verificationMethod. It retrieves the privateKeyBytes for the verificationMethod and adds a capability invocation in
   * the form of a Data Integrity proof following the Authorization Capabilities (ZCAP-LD) and VC Data Integrity
   * specifications. It returns the invoked DID Update Payload.
   *
   * @param {InvokePayloadParams} params Required params for calling the invokePayload method
   * @param {string} params.identifier The did-btc1 identifier to derive the root capability from
   * @param {DidUpdatePayload} params.updatePayload The updatePayload object to be signed
   * @param {DidVerificationMethod} params.verificationMethod The verificationMethod object to be used for signing
   * @returns {DidUpdatePayload} Object containing the proof options
   * @throws {Btc1Error} if the privateKeyBytes are invalid
   */
  public static async invoke({
    identifier,
    updatePayload,
    verificationMethod,
  }: InvokePayloadParams): Promise<DidUpdatePayload> {
    // Validate the verificationMethod
    if(!verificationMethod.publicKeyMultibase) {
      throw new Btc1Error(
        'Invalid publicKeyMultibase: cannot be undefined',
        DidErrorCode.InvalidPublicKeyType.toSnakeCaseScreaming(),
        verificationMethod
      );
    }

    // Deconstruct the keys from the verificationMethod
    const { publicKeyMultibase, privateKeyMultibase } = verificationMethod;

    // Compute the keyUri and check if the key is in the keystore
    // If not, use the privateKeyMultibase from the verificationMethod
    const keyPair = await Btc1KeyManager.getKeyPair(
      Btc1KeyManager.computeKeyUri(publicKeyMultibase)
    );

    // If the privateKey is not found, throw an error
    const { privateKey } = keyPair  ?? { privateKey: privateKeyMultibase };
    if (!privateKey) {
      throw new Btc1Error(
        'Invalid privateKey: not found in keystore or verificationMethod',
        DidErrorCode.NotFound.toSnakeCaseScreaming(),
        verificationMethod
      );
    }

    // Derive the root capability from the identifier
    const rootCapability = Btc1Appendix.deriveRootCapability(identifier);
    const cryptosuite = 'bip340-jcs-2025';
    // Construct the proof options
    const options: ProofOptions = {
      cryptosuite,
      type               : 'DataIntegrityProof',
      verificationMethod : verificationMethod.id,
      proofPurpose       : 'capabilityInvocation',
      capability         : rootCapability.id,
      capabilityAction   : 'Write',
    };
    Logger.warn('// TODO: Wonder if we actually need this. Arent we always writing?');

    const multikey = new Multikey({ id: verificationMethod.id, controller: verificationMethod.controller, keyPair });
    const diproof = new DataIntegrityProof(new Cryptosuite({ cryptosuite, multikey }));
    Logger.warn('// TODO: need to set up the proof instantiation such that it can resolve / dereference the root capability. This is deterministic from the DID.');

    // Set didUpdateInvocation to the result of executing the Add Proof algorithm from VC Data Integrity passing didUpdatePayload as the input document, cryptosuite, and the set of proofOptions.
    const didUpdateInvocation = await diproof.addProof({ document: updatePayload, options });
    // Return didUpdateInvocation
    return {
      ...updatePayload,
      ...didUpdateInvocation,
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
   * @param {AnnounceUpdatePayloadParams} params Required params for calling the announcePayload method
   * @param {Btc1DidDocument} params.sourceDocument The did-btc1 did document to derive the root capability from
   * @param {string[]} params.beaconIds The didUpdatePayload object to be signed
   * @param {DidUpdatePayload} params.didUpdatePayload The verificationMethod object to be used for signing
   * @returns {} Array of signalMetadata objects with necessary data to validate Beacon Signal against Did Update
   * @throws {DidError} if the beaconService type is invalid
   */
  public static async announce({ sourceDocument, beaconIds, didUpdatePayload }: {
    sourceDocument: Btc1DidDocument;
    beaconIds: string[];
    didUpdatePayload: DidUpdatePayload;
  }): Promise<SignalsMetadata> {
    const beaconServices: BeaconService[] = [];
    const signalsMetadata: SignalsMetadata = new Map<TxId, Metadata>();

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
      const beacon = BeaconFactory.establish(beaconService);
      const signalMetadata = await beacon.broadcastSignal(didUpdatePayload);
      Object.entries(signalMetadata).map(([signalId, metadata]) => signalsMetadata.set(signalId, metadata));
    }

    // Return the signalsMetadata
    return signalsMetadata;
  }
}