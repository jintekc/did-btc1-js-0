import { canonicalization } from '@did-btc1/cryptosuite';
import { PublicKey, PublicKeyBytes } from '@did-btc1/key-pair';
import { bech32 } from '@scure/base';
import type { DidService, DidVerificationMethod } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { getNetwork } from '../../bitcoin/network.js';
import { DidBtc1 } from '../../did-btc1.js';
import { BeaconUtils } from '../beacons/utils.js';
import { ID_PLACEHOLDER_VALUE } from '../constants.js';
import { Btc1DidDocument } from '../did-document.js';
import { IntermediateDocument, IntermediateVerificationMethod } from './interface.js';
import { DocumentBytes } from '../../types/crud.js';

const { canonicalhash } = canonicalization;

export type Optional<T> = Partial<T>;
export interface NetworkVersion {
  version: string;
  network: string;
};
export interface DidCreateDeterministic extends NetworkVersion {
  pubKeyBytes: PublicKeyBytes;
};
export interface DidCreateExternalParams extends NetworkVersion {
  documentBytes: DocumentBytes;
};
export interface CreateDidBtc1IdentifierParams extends Optional<NetworkVersion> {
  genesisBytes: GenesisBytesType;
}

export type DidBtc1Identifier = string;
/**
 * Implements section {@link https://dcdpr.github.io/did-btc1/#create | 4.1 Create}
 *
 * A did:btc1 identifier and associated DID document can either be created deterministically from a cryptographic seed,
 * or it can be created from an arbitrary genesis intermediate DID document representation. In both cases, DID creation
 * can be undertaken in an offline manner, i.e., the DID controller does not need to interact with the Bitcoin network
 * to create their DID.
 *
 * @export
 * @class Btc1Create
 * @type {Btc1Create}
 * @implements {DidBtc1.create}
 */
export class Btc1Create {
  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#deterministic-key-based-creation | 4.1.1 Deterministic Key-Based Creation}.
   *
   * For deterministic creation, the did:btc1 identifier encodes a secp256k1 public key. The key is then used to
   * deterministically generate the initial DID document.
   *
   * @public
   * @static
   * @param {DidCreateDeterministic} params See {@link DidCreateDeterministic} for details.
   * @param {string} params.version did-btc1 identifier version.
   * @param {string} params.network did-btc1 bitcoin network.
   * @param {PublicKeyBytes} params.pubKeyBytes public key bytes for id creation.
   * @returns {CreateResponse} Object of type {@link DidCreateResponse}.
   * @throws {DidError} if the public key is missing or invalid.
   */
  public static deterministic({ version, network, publicKey }: {
    network: string;
    version: string;
    publicKey: PublicKeyBytes;
  }): {
    did: string;
    initialDocument: Btc1DidDocument;
  } {
    // Create key-type identifier from genesisBytes
    const id = this.didBtc1Identifier({ idType: 'key', network, version, genesisBytes: publicKey });

    // Get xOnlyPublicKey from publicKey
    const publicKeyMultibase = new PublicKey(publicKey).multibase;

    // Generate the beacon services from the network and public key
    const service = BeaconUtils.generateBeaconServices({ network: getNetwork(network), beaconType: 'SingletonBeacon', publicKey });

    const initialDocument = new Btc1DidDocument({
      id,
      service,
      verificationMethod   : [{
        id                 : '#initialKey',
        type               : 'Multikey',
        controller         : id,
        publicKeyMultibase,
      }],
    });

    // Return did & initialDocument
    return { did: id, initialDocument };
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#external-initial-document-creation | 4.1.2 External Initial Document Creation}.
   *
   * Creates a did:btc1 identifier from some initiating arbitrary DID document. This allows for more complex
   * initial DID documents, including the ability to include Service Endpoints and Beacons that support aggregation.
   * Inputs include `intermediateDocument`, optional version and network returning initialDidDocument. The
   * intermediateDocument should be a valid DID document except all places where the DID document requires the use of
   * the identifier (e.g. the id field). These fields should use placeholder value
   * `did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. The intermediateDocument should include at
   * least one verificationMethod and service of the type SingletonBeacon.
   *
   * @public
   * @static
   * @async
   * @param {DidCreateExternalParams} params See {@link DidCreateExternalParams} for details.
   * @param {string} params.version Identifier version.
   * @param {string} params.network Identifier network name.
   * @param {string} params.documentBytes Intermediate DID Document bytes.
   * @returns {DidCreateResponse} A Promise resolving to {@link DidCreateResponse}.
   * @throws {DidError} if the verificationMethod or service objects are missing required properties
   */
  public static async external({ network, version, intermediateDocument }: {
    version: string;
    network: string;
    intermediateDocument: IntermediateDocument;
  }): Promise<{ did: string; initialDocument: Btc1DidDocument; }> {
    // Deconstruct vm and service from intermediateDocument
    const { verificationMethod, service } = intermediateDocument ?? {};

    // Validate verificationMethod not null and contains at least one object
    if (!verificationMethod || !verificationMethod.length) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'At least one verificationMethod object required');
    }

    // Validate the properties for each verificationMethod object in the document
    if (verificationMethod?.some((vm: DidVerificationMethod) => !(vm.id || vm.type || vm.publicKeyMultibase))) {
      throw new DidError(
        DidErrorCode.InvalidDidDocument,
        'One or more verificationMethod objects missing required properties'
      );
    }

    // TODO: more validation of Beacon Services objects
    // Validate service not null and contains at least one object
    if (!service || !service.length) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'At least one service object required');
    }

    // Validate the properties for each service
    if (service?.some((s: DidService) => !(s.id || s.type || s.serviceEndpoint))) {
      throw new DidError(
        DidErrorCode.InvalidDidDocument, 'One or more service objects missing required properties'
      );
    }

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    if (intermediateDocument.id !== ID_PLACEHOLDER_VALUE) {
      intermediateDocument.id = ID_PLACEHOLDER_VALUE;
    }

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod = verificationMethod.map(
      (vm: IntermediateVerificationMethod) => ({ ...vm, controller: intermediateDocument.id })
    );

    // Sha256 hash the canonicalized byte array of the intermediateDocument
    const genesisBytes = await canonicalhash(intermediateDocument);

    // Set idType to external
    const idType = 'external';

    // Set did to result of createIdentifier
    const did = this.didBtc1Identifier({ idType, genesisBytes, version, network });

    // Create copy of intermediateDocument initialDocument as DidDocument
    const initialDocument = intermediateDocument as Btc1DidDocument;

    // Set initialDocument id to did.
    initialDocument.id = did;

    // Set verificationMethod.controller to did.
    initialDocument.verificationMethod = verificationMethod.map(
      (vm: DidVerificationMethod) => ({ ...vm, controller: intermediateDocument.id })
    );

    // Return DID & DID Document.
    return { did, initialDocument };
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#didbtc1-identifier-construction | 4.1.3 did:btc1 Identifier Construction}.
   *
   * Convenience function used to construct did:btc1 identifiers. Takes in idType, genesisBytes, version and network.
   * If idType is “key”, then genesisBytes is a compressed SEC encoded secp256k1 public key.
   * If idType is “external”, then genesisBytes is the byte representation of a SHA256 hash of an intermediate document.
   *
   * @public
   * @static
   * @param {CreateDidBtc1IdentifierParams} params See {@link CreateDidBtc1IdentifierParams} for details.
   * @param {string} params.idType Identifier type (key or external).
   * @param {string} params.network Bitcoin network name.
   * @param {number} params.version Identifier version.
   * @param {GenesisBytesType} params.genesisBytes Public key or an intermediate document bytes.
   * @returns {DidBtc1Identifier} The new did:btc1 identifier.
   */
  public static didBtc1Identifier({ idType, genesisBytes, network, version }: {
    idType: string;
    genesisBytes: GenesisBytesType;
    network?: string;
    version?: string;
  }): DidBtc1Identifier {
    // Set version to 1 if not passed
    const v = Number(version) || 1;

    // Set the hrp based on idType
    const hrp = idType === 'key' ? 'k' : 'x';

    // Set the base did method prefix
    let didMethodPrefix = `did:${DidBtc1.methodName}`;

    // If version > 1, append it to the didMethodPrefix
    if (v > 1) {
      didMethodPrefix = `${didMethodPrefix}:${version}`;
    }

    // If network !== mainnet, append it to the didMethodPrefix
    if (network !== 'mainnet') {
      didMethodPrefix = `${didMethodPrefix}:${network}`;
    }

    // Create DID from method prefix and Bech32 encoded public key
    return `${didMethodPrefix}:${bech32.encodeFromBytes(hrp, genesisBytes)}`;
  }
}