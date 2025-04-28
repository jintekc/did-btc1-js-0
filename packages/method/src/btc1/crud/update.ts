import {
  BTC1_DID_UPDATE_PAYLOAD_CONTEXT,
  Btc1Error,
  DidUpdateInvocation,
  DidUpdatePayload,
  INVALID_DID_DOCUMENT,
  INVALID_DID_UPDATE,
  INVALID_PUBLIC_KEY_TYPE,
  Logger,
  NOT_FOUND,
  PatchOperation,
  ProofOptions
} from '@did-btc1/common';
import { Multikey } from '@did-btc1/cryptosuite';
import type { DidService } from '@web5/dids';
import { BeaconService } from '../../interfaces/ibeacon.js';
import { TxId } from '../../types/bitcoin.js';
import { Metadata, SignalsMetadata } from '../../types/crud.js';
import { Btc1Appendix } from '../../utils/appendix.js';
import { Btc1DidDocument, Btc1VerificationMethod } from '../../utils/did-document/index.js';
import { BeaconFactory } from '../beacons/factory.js';
import { Btc1KeyManager } from '../key-manager/index.js';

export type InvokePayloadParams = {
  identifier: string;
  didUpdatePayload: DidUpdatePayload;
  verificationMethod: Btc1VerificationMethod;
}

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#update | 4.3 Update}.
 *
 * An update to a did:btc1 document is an invoked capability using the ZCAP-LD
 * data format, signed by a verificationMethod that has the authority to make
 * the update as specified in the previous DID document. Capability invocations
 * for updates MUST be authorized using Data Integrity following the
 * bip340-jcs-2025 cryptosuite with a proofPurpose of capabilityInvocation.
 *
 * @class Btc1Update
 * @type {Btc1Update}
 */
export class Btc1Update {
  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#construct-did-update-payload | 4.3.1 Construct DID Update Payload}.
   *
   * The Construct DID Update Payload algorithm applies the documentPatch to the sourceDocument and verifies the
   * resulting targetDocument is a conformant DID document. It takes in a btc1Identifier, sourceDocument,
   * sourceVersionId, and documentPatch objects. It returns an unsigned DID Update Payload.
   *
   * @param {ConstructPayloadParams} params See  {@link ConstructPayloadParams} for more details.
   * @param {string} params.identifier The did-btc1 identifier to derive the root capability from.
   * @param {Btc1DidDocument} params.sourceDocument The source document to be updated.
   * @param {string} params.sourceVersionId The versionId of the source document.
   * @param {DidDocumentPatch} params.patch The JSON patch to be applied to the source document.
   * @returns {Promise<DidUpdatePayload>} The constructed DidUpdatePayload object.
   * @throws {Btc1Error} InvalidDid if sourceDocument.id does not match identifier.
   */
  public static async construct({
    identifier,
    sourceDocument,
    sourceVersionId,
    patch,
  }: {
    identifier: string;
    sourceDocument: Btc1DidDocument;
    sourceVersionId: number;
    patch: PatchOperation[];
  }): Promise<DidUpdatePayload> {

    // 1. Check that sourceDocument.id equals identifier else MUST raise invalidDIDUpdate error.
    if (sourceDocument.id !== identifier) {
      throw new Btc1Error(
        INVALID_DID_UPDATE,
        'Source document id does not match identifier',
        { sourceDocument, identifier}
      );
    }

    // 2. Initialize didUpdatePayload to an empty object.
    const didUpdatePayload: DidUpdatePayload = {
    // 3. Set didUpdatePayload.@context to the following list
      '@context'      : BTC1_DID_UPDATE_PAYLOAD_CONTEXT,
      // 4. Set didUpdatePayload.patch to documentPatch.
      patch,
      targetHash      : '',
      targetVersionId : 0,
      sourceHash      : '',
    };
    Logger.warn('// TODO: Need to add btc1 context. ["https://w3id.org/zcap/v1", "https://w3id.org/security/data-integrity/v2", "https://w3id.org/json-ld-patch/v1"]');

    // 5. Set targetDocument to the result of applying the documentPatch to the sourceDocument, following the JSON Patch
    //    specification.
    const targetDocument = JSON.patch.apply(sourceDocument, patch) as Btc1DidDocument;

    // 6. Validate targetDocument is a conformant DID document, else MUST raise invalidDIDUpdate error.
    Btc1DidDocument.validate(targetDocument);

    // 7. Set sourceHashBytes to the result of passing sourceDocument into the JSON Canonicalization and Hash algorithm.
    // 8. Set didUpdatePayload.sourceHash to the base58-btc Multibase encoding of sourceHashBytes.
    didUpdatePayload.sourceHash = await JSON.canonicalization.process(sourceDocument, 'base58');
    Logger.warn('// TODO: Question - is base58btc the correct encoding scheme?');

    // 9. Set targetHashBytes to the result of passing targetDocument into the JSON Canonicalization and Hash algorithm.
    // 10. Set didUpdatePayload.targetHash to the base58-btc Multibase encoding of targetHashBytes.
    didUpdatePayload.targetHash = await JSON.canonicalization.process(targetDocument, 'base58');

    // 11. Set didUpdatePayload.targetVersionId to sourceVersionId + 1.
    didUpdatePayload.targetVersionId = sourceVersionId + 1;

    // 12. Return updatePayload.
    return didUpdatePayload;
  }

  /**
   * {@link https://dcdpr.github.io/did-btc1/#invoke-did-update-payload | 4.3.2 Invoke DID Update Payload}.
   *
   * The Invoke DID Update Payload algorithm takes in a btc1Identifier, an unsigned didUpdatePayload, and a
   * verificationMethod. It retrieves the privateKeyBytes for the verificationMethod and adds a capability invocation in
   * the form of a Data Integrity proof following the Authorization Capabilities (ZCAP-LD) and VC Data Integrity
   * specifications. It returns the invoked DID Update Payload.
   *
   * @param {InvokePayloadParams} params Required params for calling the invokePayload method
   * @param {string} params.identifier The did-btc1 identifier to derive the root capability from
   * @param {DidUpdatePayload} params.didUpdatePayload The updatePayload object to be signed
   * @param {DidVerificationMethod} params.verificationMethod The verificationMethod object to be used for signing
   * @returns {DidUpdateInvocation} Did update payload secured with a proof => DidUpdateInvocation
   * @throws {Btc1Error} if the privateKeyBytes are invalid
   */
  public static async invoke({
    identifier,
    didUpdatePayload,
    verificationMethod,
  }: {
    identifier: string;
    didUpdatePayload: DidUpdatePayload;
    verificationMethod: Btc1VerificationMethod;
  }): Promise<DidUpdateInvocation> {
    // Deconstruct the verificationMethod
    const { id, controller, publicKeyMultibase, privateKeyMultibase } = verificationMethod;

    // Validate the verificationMethod
    if(!publicKeyMultibase) {
      throw new Btc1Error('Invalid publicKeyMultibase: cannot be undefined', INVALID_PUBLIC_KEY_TYPE, verificationMethod);
    }

    // 1. Set privateKeyBytes to the result of retrieving the private key bytes associated with the verificationMethod
    //    value. How this is achieved is left to the implementation.

    // 1.1 Compute the keyUri and check if the key is in the keystore
    const keyPair = await Btc1KeyManager.getKeyPair(
      Btc1KeyManager.computeKeyUri(publicKeyMultibase)
    );

    // 1.2 If not, use the privateKeyMultibase from the verificationMethod
    const { privateKey } = keyPair ?? { privateKey: privateKeyMultibase };

    // 1.3 If the privateKey is not found, throw an error
    if (!privateKey) {
      throw new Btc1Error('No privateKey: not found in kms or vm', NOT_FOUND, verificationMethod);
    }

    // 2. Set rootCapability to the result of passing btc1Identifier into the Derive Root Capability from did:btc1
    //    Identifier algorithm.
    const rootCapability = Btc1Appendix.deriveRootCapability(identifier);
    const cryptosuite = 'bip340-jcs-2025';
    // 3. Initialize proofOptions to an empty object.
    // 4. Set proofOptions.type to DataIntegrityProof.
    // 5. Set proofOptions.cryptosuite to schnorr-secp256k1-jcs-2025.
    // 6. Set proofOptions.verificationMethod to verificationMethod.id.
    // 7. Set proofOptions.proofPurpose to capabilityInvocation.
    // 8. Set proofOptions.capability to rootCapability.id.
    // 9. Set proofOptions.capabilityAction to Write.
    Logger.warn('// TODO: Wonder if we actually need this. Arent we always writing?');
    const options: ProofOptions = {
      cryptosuite,
      type               : 'DataIntegrityProof',
      verificationMethod : id,
      proofPurpose       : 'capabilityInvocation',
      capability         : rootCapability.id,
      capabilityAction   : 'Write',
    };

    // 10. Set cryptosuite to the result of executing the Cryptosuite Instantiation algorithm from the BIP340 Data
    //     Integrity specification passing in proofOptions.
    const diproof = Multikey.initialize({ id, controller, keyPair }).toCryptosuite(cryptosuite).toDataIntegrityProof();

    Logger.warn('11. // TODO: need to set up the proof instantiation such that it can resolve / dereference the root capability. This is deterministic from the DID.');

    // 12. Set didUpdateInvocation to the result of executing the Add Proof algorithm from VC Data Integrity passing
    //     didUpdatePayload as the input document, cryptosuite, and the set of proofOptions.
    // 13. Return didUpdateInvocation.
    return await diproof.addProof({ document: didUpdatePayload, options });  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#announce-did-update | 4.3.3 Announce DID Update}.
   *
   * The Announce DID Update algorithm retrieves beaconServices from the sourceDocument and calls the Broadcast DID
   * Update algorithm corresponding to the type of the Beacon. It takes in a btc1Identifier, sourceDocument, an array of
   * beaconIds, and a didUpdateInvocation. It returns an array of signalsMetadata, containing the necessary
   * data to validate the Beacon Signal against the didUpdateInvocation.
   *
   * @param {AnnounceUpdatePayloadParams} params Required params for calling the announcePayload method
   * @param {Btc1DidDocument} params.sourceDocument The did-btc1 did document to derive the root capability from
   * @param {string[]} params.beaconIds The didUpdatePayload object to be signed
   * @param {DidUpdateInvocation} params.didUpdatePayload The verificationMethod object to be used for signing
   * @returns {SignalsMetadata} The signalsMetadata object containing data to validate the Beacon Signal
   * @throws {Btc1Error} if the beaconService type is invalid
   */
  public static async announce({
    sourceDocument,
    beaconIds,
    didUpdateInvocation
  }: {
    sourceDocument: Btc1DidDocument;
    beaconIds: string[];
    didUpdateInvocation: DidUpdateInvocation;
  }): Promise<SignalsMetadata> {
    // 1. Set beaconServices to an empty array.
    const beaconServices: BeaconService[] = [];

    // 2. signalMetadata to an empty array.
    const signalsMetadata = new Map<TxId, Metadata>();

    // 3. For beaconId in beaconIds:
    for (const beaconId of beaconIds) {
      //    3.1 Find the beacon services in the sourceDocument
      const beaconService = sourceDocument.service.find((s: DidService) => s.id === beaconId);

      //    3.2 If no beaconService MUST throw beaconNotFound error.
      if (!beaconService) {
        throw new Btc1Error('Not found: sourceDocument does not contain beaconId', INVALID_DID_DOCUMENT, { beaconId });
      }

      //    3.3 Push beaconService to beaconServices.
      beaconServices.push(beaconService);
    }

    // 4. For beaconService in beaconServices:
    for (const beaconService of beaconServices) {
      // 4.1 Set signalMetadata to null.
      // 4.2 If beaconService.type == SingletonBeacon:
      //    4.2.1 Set signalMetadata to the result of passing beaconService and didUpdateInvocation to the Broadcast
      //          Singleton Beacon Signal algorithm.
      // 4.3 Else If beaconService.type == CIDAggregateBeacon:
      //    4.3.1 Set signalMetadata to the result of passing btc1Identifier, beaconService and didUpdateInvocation to
      //          the Broadcast CIDAggregate Beacon Signal algorithm.
      // 4.4 Else If beaconService.type == SMTAggregateBeacon:
      //    4.4.1 Set signalMetadata to the result of passing btc1Identifier, beaconService and didUpdateInvocation to
      //          the Broadcast SMTAggregate Beacon Signal algorithm.
      // 4.5 Else:
      //    4.5.1 MUST throw invalidBeacon error.
      const beacon = BeaconFactory.establish(beaconService);
      const signalMetadata = await beacon.broadcastSignal(didUpdateInvocation);
      Object.entries(signalMetadata).map(
        ([signalId, metadata]) => signalsMetadata.set(signalId, metadata)
      );
    }

    // Return the signalsMetadata
    return Object.fromEntries(Object.entries(signalsMetadata));
  }
}