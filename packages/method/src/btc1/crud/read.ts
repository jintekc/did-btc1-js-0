import { Bytes, canonicalization, Cryptosuite, DataIntegrityProof, Multikey } from '@did-btc1/cryptosuite';
import { KeyPair, PublicKey } from '@did-btc1/key-pair';
import { strings } from '@helia/strings';
import { bytesToHex } from '@noble/hashes/utils';
import type { DidVerificationMethod } from '@web5/dids';
import { DidError, DidErrorCode } from '@web5/dids';
import { createHelia } from 'helia';
import { CID } from 'multiformats/cid';
import * as Digest from 'multiformats/hashes/digest';
import { DEFAULT_BLOCK_CONFIRMATIONS } from '../../bitcoin/constants.js';
import { getNetwork } from '../../bitcoin/network.js';
import BitcoinRpc from '../../bitcoin/rpc-client.js';
import { BlockV2, BlockV3, RawTransactionV2 } from '../../bitcoin/types.js';
import { Btc1ReadError } from '../../utils/error.js';
import JsonPatch from '../../utils/json-patch.js';
import { BeaconFactory } from '../beacon/factory.js';
import { BeaconServiceAddress, BeaconSignal, Signal } from '../beacon/interface.js';
import { BeaconUtils } from '../beacon/utils.js';
import { ID_PLACEHOLDER_VALUE, VALID_HRP } from '../constants.js';
import { Btc1DidDocument } from '../did-document.js';
import { DidComponents } from '../interface.js';
import { Btc1Utils } from '../utils.js';
import { DidResolutionOptions, DidUpdatePayload } from './interface.js';
import { CIDAggregateSidecar, SidecarData, TargetDocumentParams, UnixTimestamp } from './types.js';

const { process, canonicalize } = canonicalization;

export type NetworkVersion = {
  version?: string;
  network?: string;
};
export type ResolveInitialDocument = {
  identifier: string;
  components: DidComponents;
  options: DidResolutionOptions
};

// Deterministic
export interface Btc1ReadDeterministic {
  components: DidComponents;
  identifier: string;
};

export interface Btc1ReadSidecar {
  components: DidComponents;
  initialDocument: Btc1DidDocument;
};

// External
export interface Btc1ReadExternal {
  components: DidComponents;
  identifier: string;
  options: DidResolutionOptions;
}
export interface DidReadCas {
  identifier: string;
  components: DidComponents;
}

// Methods
export interface ApplyDidUpdateParams {
  contemporaryDIDDocument: Btc1DidDocument;
  update: DidUpdatePayload;
  genesisBytes: any;
}

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#read | 4.2 Read}.
 *
 * The read operation is executed by a resolver after a resolution request identifying a specific did:btc1 identifier is
 * received from a client at Resolution Time. The request MAY contain a resolutionOptions object containing additional
 * information to be used in resolution. The resolver then attempts to resolve the DID document of the identifier at a
 * specific Target Time. The Target Time is either provided in resolutionOptions or is set to the Resolution Time of the
 * request.
 *
 * To do so it executes the following algorithm:
 *  1. Let identifierComponents be the result of running the algorithm
 *     in Parse did:btc1 identifier, passing in the identifier.
 *  2. Set initialDocument to the result of running Resolve Initial Document
 *     passing identifier, identifierComponents and resolutionOptions.
 *  3. Set targetDocument to the result of running the algorithm in Resolve
 *     Target Document passing in initialDocument and resolutionOptions.
 *  4. Return targetDocument.
 *
 * @export
 * @class Btc1Read
 * @type {Btc1Read}
 * @implements {DidBtc1.resolve}
 */
export class Btc1Read {
  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#deterministically-generate-initial-did-document | 4.2.2.1 Deterministically Generate Initial DID Document}.
   *
   * This algorithm Deterministically Generate Initial DID Document algorithm deterministically generates an initial DID
   * Document from a secp256k1 public key. It takes in a did:btc1 identifier and a identifierComponents object and
   * returns an initialDocument.
   *
   * @public
   * @static
   * @param {Btc1ReadDeterministic} params See {@link Btc1ReadDeterministic} for details.
   * @param {string} params.identifier The did-btc1 version.
   * @param {DidComponents} params.components The name of the bitcoin network (mainnet, testnet, regtest).
   * @returns {Btc1DidDocument} The resolved DID Document object.
   */
  public static deterministic({ identifier, components }: {
    identifier: string;
    components: DidComponents;
  }): Btc1DidDocument {
    // Deconstruct the components
    const { network: networkName, genesisBytes } = components;

    // Construct a new PublicKey
    const { x, encode } = new PublicKey(genesisBytes);

    const service = BeaconUtils.generateBeaconServices({
      network    : getNetwork(networkName),
      beaconType : 'SingletonBeacon',
      publicKey  : x
    });

    // Return the resolved DID Document object
    return new Btc1DidDocument({
      id                   : identifier,
      verificationMethod   : [{
        id                 : '#initialKey',
        type               : 'Multikey',
        controller         : identifier,
        // Encode the public key to publicKeyMultibase
        publicKeyMultibase : encode()
      }],
      // Generate the beacon services from the network and public key
      service
    });
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#external-resolution | 4.2.2.2 External Resolution}.
   *
   * The External Resolution algorithm externally retrieves an intermediateDocumentRepresentation, either by retrieving
   * it from Content Addressable Storage (CAS) or from the Sidecar Data provided as part of the resolution request. It
   * takes in a did:btc1 identifier, a identifierComponents object and a resolutionOptions object. It returns an
   * initialDocument, which is a conformant DID document validated against the identifier.
   *
   * @public
   * @static
   * @async
   * @param {Btc1ReadExternal} params Required params for calling the external method.
   * @param {string} params.identifier The DID to be resolved.
   * @param {DidComponents} params.components The components of the identifier.
   * @param {DidResolutionOptions} params.options The options for resolving the DID Document.
   * @param {Btc1DidDocument} params.options.sidecarData The sidecar data for resolving the DID Document.
   * @param {Btc1DidDocument} params.options.sidecarData.initialDocument The offline user-provided DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   */
  public static async external({ identifier, components, options }: {
    identifier: string;
    components: DidComponents;
    options: DidResolutionOptions;
  }): Promise<Btc1DidDocument> {
    // Deconstruct the options
    const { initialDocument } = options.sidecarData as CIDAggregateSidecar;

    // Validate the initialDocument is not null
    if(!initialDocument) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Initial document is required for external resolution');
    }

    // If initialDocument is not null, call the sidecar method, otherwise call the cas method
    return initialDocument
      ? await this.sidecar({ components, initialDocument })
      : await this.cas({ identifier, components });
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#sidecar-initial-document-validation | 4.2.2.2.1 Sidecar Initial Document Validation}.
   *
   * The Sidecar Initial Document Validation algorithm validates an initialDocument against its identifier, by first
   * constructing the intermediateDocumentRepresentation and verifying the hash of this document matches the bytes
   * encoded within the identifier. It takes in a did:btc1 identifier, identifierComponents and a
   * initialDocument. It returns the initialDocument if validated, otherwise it throws an error.
   *
   * @public
   * @static
   * @async
   * @param {Btc1ReadSidecar} params Required params for calling the sidecar method
   * @param {string} params.identifier The DID to be resolved
   * @param {DidComponents} params.components The components of the DID identifier
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document provided by the user
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} with {@link DidErrorCode.InvalidDidDocument} if genesisBytes !== initialDocument hashBytes
   */
  public static async sidecar({ components, initialDocument }: Btc1ReadSidecar): Promise<Btc1DidDocument> {
    // Set intermediateDocument to a copy of initialDocument
    const intermediateDocument = initialDocument;

    /** Set the document.id to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.id = ID_PLACEHOLDER_VALUE;

    /** Set the document.verificationMethod[i].controller to {@link ID_PLACEHOLDER_VALUE} */
    intermediateDocument.verificationMethod =
          Btc1Utils.getVerificationMethods({ didDocument: intermediateDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: intermediateDocument.id }));

    // Sha256 hash the canonicalized byte array of the intermediateDocument
    const hashBytes = await process(intermediateDocument);

    // Validate the genesisBytes match the hashBytes
    if (bytesToHex(components.genesisBytes) !== hashBytes) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Genesis bytes do not match hash bytes of initial document');
    }

    return new Btc1DidDocument(initialDocument);
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#cas-retrieval | 4.2.2.2.2 CAS Retrieval}.
   *
   * The CAS Retrieval algorithm attempts to retrieve an initialDocument from a Content Addressable Storage (CAS) system
   * by converting the bytes in the identifier into a Content Identifier (CID). It takes in an identifier and
   * an identifierComponents object. It returns an initialDocument.
   *
   * @public
   * @static
   * @async
   * @param {DidReadCas} params Required params for calling the cas method
   * @param {string} params.identifier BTC1 DID used to resolve the DID Document
   * @param {DidComponents} params.components BTC1 DID components used to resolve the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object
   * @throws {DidError} if an error occurs while resolving from CAS
   * @throws {DidErrorCode.InvalidDidDocument} if the DID Document content is invalid
   */
  public static async cas({ identifier, components }: DidReadCas): Promise<Btc1DidDocument> {
    // Set hashBytes to genesisBytes
    const hashBytes = components.genesisBytes;

    // Create a CID from the hashBytes
    const cid = CID.create(1, 1, Digest.create(1, hashBytes));

    // Create a Helia node connection to IPFS
    const helia = strings(await createHelia());

    // Get the intermediateDocument from the Helia node
    const intermediateDocument = await helia.get(cid, {});

    // Validate the intermediateDocument is parsable JSON
    if (!JSON.parsable(intermediateDocument)) {
      throw new DidError(DidErrorCode.InvalidDidDocument, 'Invalid DID Document content');
    }

    // Parse the intermediateDocument into a Btc1DidDocument object
    const initialDocument = JSON.parse(intermediateDocument) as Btc1DidDocument;

    // Set the initialDocument id and verification method controller to the identifier
    initialDocument.id = identifier;
    initialDocument.verificationMethod =
          Btc1Utils.getVerificationMethods({ didDocument: initialDocument })
            .map((vm: DidVerificationMethod) => ({ ...vm, controller: initialDocument.id }));

    // Return the resolved initialDocument
    return new Btc1DidDocument(initialDocument);
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#resolve-initial-document | 4.2.2 Resolve Initial Document}.
   *
   * This algorithm resolves an initial DID document and validates it against the identifier for a specific did:btc1.
   * The algorithm takes in a did:btc1 identifier, identifier components object, resolutionsOptions object and returns
   * a valid initialDocument for that identifier.
   *
   * @public
   * @static
   * @async
   *
   * @param {ResolveInitialDocument} params Required parameters for calling the initialDocument operation.
   * @param {string} params.identifier The DID to be resolved.
   * @param {DidComponents} params.components The components of the identifier.
   * @param {DidResolutionOptions} params.options The options for resolving the DID Document.
   * @param {number} params.options.versionId The versionId for resolving the DID Document.
   * @param {UnixTimestamp} params.options.versionTime The versionTime for resolving the DID Document.
   * @param {BitcoinRpc} params.options.rpc BitcoinRpc client connection.
   * @param {SidecarDataCID | SidecarDataSMT} params.options.sidecarData The sidecar data for resolving the DID Document.
   * @returns {Promise<Btc1DidDocument>} The resolved DID Document object.
   * @throws {DidError} if the DID hrp is invalid, no sidecarData passed and hrp = "x".
   */
  public static async initialDocument({ identifier, components, options }: {
      identifier: string;
      components: DidComponents;
      options: DidResolutionOptions
    }): Promise<Btc1DidDocument> {
    // Deconstruct the hrp from the components
    const hrp = components.hrp;

    // Validate the hrp is either 'k' or 'x'
    if(!VALID_HRP.includes(hrp)) {
      throw new DidError(DidErrorCode.InvalidDid, `Invalid DID hrp ${hrp}`);
    }

    //  Make sure options.sidecarData is not null if hrp === x
    if (hrp === 'x' && !options.sidecarData) {
      throw new DidError(DidErrorCode.InvalidDid, 'External resolution required for non-deterministic DIDs');
    }

    return hrp === 'k'
      ? this.deterministic({ identifier, components })
      : await this.external({ identifier, components, options });

  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#resolve-target-document | 4.2.3 Resolve Target Document}.
   *
   * The Resolve Target Document algorithm resolves a DID document from an initial document by walking the Bitcoin
   * blockchain to identify Beacon Signals that announce DID Update Payloads applicable to the did:btc1 identifier being
   * resolved. Takes initialDocument and resolutionOptions. Returns valid targetDocument or throws an error.
   *
   * @public
   * @static
   * @async
   * @param {TargetDocumentParams} params Required parameters for resolving the target DID Document
   * @param {Btc1DidDocument} params.initialDocument The initial DID Document to resolve
   * @param {ResolutionOptions} params.options The options for resolving the DID Document
   * @param {?number} params.options.versionId The versionId for resolving the DID Document
   * @param {?UnixTimestamp} params.options.versionTime The versionTime for resolving the DID Document
   * @param {?BitcoinRpc} params.options.rpc BitcoinRpc client connection
   * @param {?SidecarData} params.options.sidecarData The sidecar data for resolving the DID Document
   * @returns {Btc1DidDocument} The resolved DID Document object with a validated single, canonical history
   */
  public static async targetDocument({ initialDocument, options }: TargetDocumentParams): Promise<Btc1DidDocument> {
    // If options.versionId is not null, set targetVersionId to options.versionId
    const targetVersionId = options.versionId;

    // If options.versionTime is not null, set targetTime to options.versionTime
    const targetTime = options.versionTime;

    // Set the targetBlockheight to the result of passing targetTime to the algorithm Determine Target Blockheight
    const targetBlockHeight = await this.determineTargetBlockHeight(targetTime, options.rpc);

    // Set sidecarData to options.sidrcarData
    const sidecarData = options.sidecarData;

    // Set currentVersionId to 1
    const currentVersionId = 1;

    // If the targetVersionId equals currentVersionId, return initialDocument
    if(currentVersionId === targetVersionId) {
      return new Btc1DidDocument(initialDocument);
    }

    // Set updateHashHistory to an empty array
    const updateHashHistory = new Array();

    // Set contemporaryBlockheight to 1
    const contemporaryBlockHeight = 1;

    // Set contemporaryDIDDocument to initialDocument
    const contemporaryDIDDocument = initialDocument;

    const genesisBytes = options.components.genesisBytes;

    // Set targetDocument to the result of passing contemporaryDIDDocument, contemporaryBlockheight,
    // currentVersionId, targetVersionId, targetBlockheight, updateHashHistory, and sidecarData
    // to the Traverse Blockchain History algorithm.
    return this.blochchainHistory({
      targetBlockHeight,
      currentVersionId,
      targetVersionId,
      updateHashHistory,
      contemporaryBlockHeight,
      sidecarData,
      contemporaryDIDDocument,
      genesisBytes
    });
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#determine-target-blockheight | 4.2.3.1 Determine Target Blockheight}.
   * @static
   * @async
   * @param {?UnixTimestamp} targetTime Unix timestamp used to find highest block height < targetTime.
   * If not provided, finds the highest bitcoin block height where confirmations > {@link DEFAULT_BLOCK_CONFIRMATIONS}.
   * @param {?BitcoinRpc} rpc Bitcoin rpc client connection.
   * @returns {BlockHeight} The target blockheight.
   */
  static async determineTargetBlockHeight(targetTime?: UnixTimestamp, rpc?: BitcoinRpc): Promise<number> {
    // If bitcoinClient is not defined, connect to default bitcoin node
    rpc ??= BitcoinRpc.connect();

    // Get the current block height
    const height = await rpc.getBlockCount();

    // Get the block hash at the current block height
    // const hash = await rpc.getBlockHash(height);

    // Get the block at the current height
    let block = await rpc.getBlock({ height }) as BlockV2;

    // Return block height response from targetBlockHeight
    if(!targetTime) {
      // Traverse Bitcoin blocks to find the largest block with confirmations >= DEFAULT_BLOCK_CONFIRMATIONS
      while (block.confirmations <= DEFAULT_BLOCK_CONFIRMATIONS) {
        // block.hash = await rpc.getBlockHash();
        block = await rpc.getBlock({ height: --block.height }) as BlockV2;
      }
      // Return the block height
      return block.height;
    }
    // Traverse Bitcoin blocks to find the largest block with timestamp < targetTime
    while (block.time > targetTime) {
      // block.hash = await rpc.getBlockHash(--block.height);
      block = await rpc.getBlock({ height: --block.height }) as BlockV2;
    }
    // Return the block height
    return block.height;
  }

  /**
   * TODO: Need to finish implementing the blochchainHistory method
   *
   * Implements {@link https://dcdpr.github.io/did-btc1/#traverse-blockchain-history | 4.2.3.2 Traverse Blockchain History}.
   *
   * The Traverse Blockchain History algorithm iterates over Bitcoin blocks, starting from the block with the,
   * contemporaryBlockheight to find beaconSignals emitted by Beacons within the contemporaryDIDDocument. Each
   * beaconSignal is processed to retrieve a didUpdatePayload to the DID document. Each update is applied to the
   * document and duplicates are ignored. If the algorithm reaches the block with the blockheight specified by a
   * targetBlockheight, the contemporaryDIDDocument at that blockheight is returned assuming a single canonical history
   * of the DID document has been constructed up to that point.
   *
   * @public
   * @static
   * @async
   * @param {ReadBlockchainParams} params The parameters for the traverseBlockchainHistory operation.
   * @param {Btc1DidDocument} params.contemporaryDIDDocument The DID Document at the contemporaryBlockheight.
   * @param {number} params.contemporaryBlockHeight The blockheight of the contemporaryDIDDocument.
   * @param {number} params.currentVersionId The current versionId of the DID Document.
   * @param {number} params.targetVersionId The target versionId of the DID Document.
   * @param {number} params.targetBlockheight The target blockheight to resolve the DID Document.
   * @param {boolean} params.updateHashHistory The hash history of the DID Document updates.
   * @param {ResolutionOptions} params.sidecarData The sidecar data for the DID Document.
   * @returns {Promise<Btc1DidDocument>} The resolved DID Document object with a validated single, canonical history.
   */
  public static async blochchainHistory({
    contemporaryDIDDocument,
    contemporaryBlockHeight,
    currentVersionId,
    targetVersionId,
    targetBlockHeight,
    updateHashHistory,
    sidecarData,
    genesisBytes
  }: {
    contemporaryDIDDocument: Btc1DidDocument;
    contemporaryBlockHeight: number | 1;
    currentVersionId: number | 1;
    targetVersionId?: number;
    targetBlockHeight: number;
    updateHashHistory: string[];
    sidecarData?: SidecarData;
    genesisBytes?: any;
  }): Promise<Btc1DidDocument> {
    console.log(`{
      contemporaryDIDDocument,
      sidecarData
    }`, {
      service : contemporaryDIDDocument.service,
      contemporaryDIDDocument,
      sidecarData,
    });
    const didDocument = contemporaryDIDDocument;

    // 1. Set contemporaryHash to the SHA256 hash of the contemporaryDIDDocument
    // TODO: NEED TO DEAL WITH CANONICALIZATION
    let contemporaryHash = await process(didDocument);

    // 2. Find all beacons in contemporaryDIDDocument: All service in contemporaryDIDDocument.services where
    //    service.type equals one of SingletonBeacon, CIDAggregateBeacon and SMTAggregateBeacon Beacon.
    // 3. For each beacon in beacons convert the beacon.serviceEndpoint to a Bitcoin address following BIP21.
    //    Set beacon.address to the Bitcoin address.
    const beacons = BeaconUtils.toBeaconServiceAddress(
      BeaconUtils.getBeaconServices({ didDocument })
    );

    while(contemporaryBlockHeight <= targetBlockHeight) {

      // 4. Set nextSignals to the result of calling algorithm Find Next Signals passing in contemporaryBlockheight and
      //    beacons.
      const nextSignals = await this.findNextSignals({ contemporaryBlockHeight, beacons });

      // 5. If nextSignals.blockheight is greater than targetBlockheight return contemporaryDIDDocument.
      if(nextSignals.blockheight > targetBlockHeight) {
        return new Btc1DidDocument(didDocument);
      }

      // 6. Set signals to nextSignals.signals.
      const signals = nextSignals.signals;

      // 7. Set updates to the result of calling algorithm Process Beacon Signals passing in signals and sidecarData.
      const updates = await this.processBeaconSignals(signals, sidecarData!);
      console.log('updates', updates);

      // 8. Set orderedUpdates to the list of updates ordered by the targetVersionId property.
      const orderedUpdates = updates.sort((a, b) => a.targetVersionId - b.targetVersionId);
      console.log('orderedUpdates', orderedUpdates);

      // 9. For update in orderedUpdates:
      //    1. If update.targetVersionId is less than or equal to currentVersionId, run Algorithm Confirm Duplicate
      //       Update passing in update, documentHistory, and contemporaryHash.
      //    2. If update.targetVersionId equals currentVersionId + 1:
      //       1. Check that update.sourceHash equals contemporaryHash, else MUST raise latePublishing error.
      //       2. Set contemporaryDIDDocument to the result of calling Apply DID Update algorithm passing in contemporaryDIDDocument, update.
      //       3. Increment currentVersionId
      //       4. If currentVersionId equals targetVersionId return contemporaryDIDDocument.
      //       5. Set updateHash to the result of passing update into the JSON Canonicalization and Hash algorithm
      //       6. Push updateHash onto updateHashHistory.
      //       7. Set contemporaryHash to result of passing contemporaryDIDDocument into the JSON Canonicalization and Hash algorithm.
      //    3. If update.targetVersionId is greater than currentVersionId + 1, MUST throw a LatePublishing error.
      for (let update of orderedUpdates) {

        // 9.1. If update.targetVersionId is less than or equal to currentVersionId run Confirm Duplicate Update passing in update, documentHistory, and contemporaryHash.
        if (update.targetVersionId <= currentVersionId) {
          await this.confirmDuplicateUpdate({ update, updateHashHistory });

        // 9.2. If update.targetVersionId equals currentVersionId + 1 ...
        } else if(update.targetVersionId === currentVersionId + 1) {
          // 9.2.1 Check that update.sourceHash equals contemporaryHash, else MUST raise latePublishing error.
          if(update.sourceHash !== contemporaryHash) {
            throw new Btc1ReadError(`Hash mismatch: ${update.sourceHash} !== ${contemporaryHash}`, 'LATE_PUBLISHING_ERROR');
          }

          // 9.2.2 Set contemporaryDIDDocument to the result of calling Apply DID Update passing in contemporaryDIDDocument, update.
          contemporaryDIDDocument = await this.applyDidUpdate({ contemporaryDIDDocument, update, genesisBytes });

          // 9.2.3 Increment currentVersionId
          currentVersionId++;
          if(currentVersionId === targetVersionId) {
            return new Btc1DidDocument(contemporaryDIDDocument);
          }
          const updateHash = await process(update);
          updateHashHistory.push(updateHash);
          contemporaryHash = await process(contemporaryDIDDocument);
        } else if (update.targetVersionId > currentVersionId + 1) {
          throw new Btc1ReadError(
            `Version Id Mismatch: target ${update.targetVersionId} cannot be > current+1 ${currentVersionId + 1}`,
            'LATE_PUBLISHING_ERROR'
          );
        }
      }

      // Increment the blockheight
      contemporaryBlockHeight++;
    }

    return new Btc1DidDocument(didDocument);
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#find-next-signals | 4.2.3.3 Find Next Signals}.
   *
   * Takes as inputs a Bitcoin blockheight specified by contemporaryBlockheight and an array of beacons and returns a
   * nextSignals object, containing a blockheight the signals were found in and an array of signals. Each signal is an
   * object containing beaconId, beaconType, and tx properties.
   *
   * @public
   * @static
   * @async
   * @param {FindNextSignals} params The parameters for the findNextSignals operation.
   * @param {number} params.blockheight The blockheight to start looking for beacon signals.
   * @param {Array<BeaconService>} params.target The target blockheight at which to stop finding signals.
   * @param {Array<BeaconService>} params.beacons The beacons to look for in the block.
   * @returns {Promise<BeaconSignal[]>} An array of BeaconSignal objects with blockHeight and signals.
   */
  public static async findNextSignals({ contemporaryBlockHeight: height, beacons }: any): Promise<BeaconSignal>{
    /**
     * Convert serviceEndpoint to bitcoin address and create mapping of address to beaconService object
     * E.g.
     * Map(1) {
     * '174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU' => {
     *    id: '#initialP2PKH',
     *    type: 'SingletonBeacon',
     *    serviceEndpoint: 'bitcoin:174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU',
     *    address: '174EZ9haVAZRoScHMAhSUBiDPdByTFKEyU'
     *  }
     * }
     */
    const beaconAddresses = BeaconUtils.getBeaconServiceAddressMap(beacons);

    //  TODO: Need to determine how to connect to a bitcoin node
    // Connect to the bitcoin node
    const rpc = BitcoinRpc.connect();

    // Get the block hash at the blockheight
    // const blockhash = await rpc.getBlockHash(height);

    // Get the block data at the blockhash
    const block = (await rpc.getBlock({ height })) as BlockV3 | undefined;

    // Create an empty array for beaconSignals
    const beaconSignal: BeaconSignal = {
      blockheight : height ?? block?.height,
      signals     : []
    };

    // If the block is null, return an empty beaconSignal
    if (!block) {
      // or: return beaconSignal;  // Possibly an empty or “no signals” result
      return beaconSignal;
    }

    // Iterate over each transaction in the block
    for (const tx of block.tx) {
      // Iterate over each input in the transaction
      for (const vin of tx.vin) {

        // If the vin is a coinbase transaction, continue ...
        if (vin.coinbase) {
          console.info(`Tx id ${tx.txid} is a coinbase tx, continuing ... `, vin);
          continue;
        }

        // If the txid from the vin is undefined, continue ...
        if (!vin.txid) {
          console.info(`No vin.txid for txid ${tx.txid}, continuing ... `, vin);
          continue;
        }

        // If the vout from the vin is undefined, continue
        if (vin.vout === undefined) {
          console.info(`No vout for vin txid ${vin.txid}, continuing ... `, vin);
          continue;
        }

        // Get the previous output transaction data
        const prevout = await rpc.getRawTransaction(vin.txid, 2) as RawTransactionV2;

        // If the previous output vout at the vin.vout index is undefined, continue ...
        if (!prevout.vout[vin.vout]) {
          console.info(`No vout ${vin.vout} for prevout id ${prevout.txid}, continuing ... `, prevout);
          continue;
        }

        // Get the address from the scriptPubKey from the prevvout (previous output's input at the vout index)
        const scriptPubKey = prevout.vout[vin.vout].scriptPubKey;

        // If the beaconAddress is undefined, continue ...
        if(!scriptPubKey.address) {
          console.info(`No address for prevout.vout[${vin.vout}].scriptPubKey, continuing ...`, prevout);
          continue;
        }

        // If the beaconAddress from prevvout scriptPubKey is not a beacon service endpoint address, continue ...
        const beacon = (beaconAddresses.get(scriptPubKey.address) ?? {}) as BeaconServiceAddress;
        if (!beacon || !(beacon.id && beacon.type)) {
          console.info(`No beacon signal for address ${beaconAddresses}, continuing ... `, prevout);
          continue;
        }


        // Log the found txid and beacon
        console.info(`Found beacon signal in txid ${tx.txid}`, beacon);

        // Set the blockheight to the block height
        beaconSignal.blockheight = block.height;

        // Push the signal object to to signals array
        beaconSignal.signals.push({
          beaconId      : beacon.id,
          beaconType    : beacon.type,
          beaconAddress : beacon.address,
          tx
        });
      };
    }

    return beaconSignal;
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#process-beacon-signals | 4.2.3.4 Process Beacon Signals}.
   *
   * The Process Beacon Signals algorithm takes in an array of struct beaconSignals and attempts to process these
   * signals according the type of the Beacon they were produced by. Each beaconSignal struct contains the properties
   * beaconId, beaconType, and a tx. Additionally, this algorithm takes in sidecarData passed into the resolver through
   * the resolutionOptions. If sidecarData is present it is used to process the Beacon Signals.
   *
   * @public
   * @static
   * @async
   * @param {Array<Signal>} signals The beacon signals to process.
   * @param {SidecarData} sidecarData The sidecar data for the DID Document.
   * @returns {DidUpdatePayload[]} The updated DID Document object.
   */
  public static async processBeaconSignals(signals: Array<Signal>, sidecarData: SidecarData): Promise<DidUpdatePayload[]> {
    return await Promise.all(
      signals.map(
        async (signal) => {
          // Deconstruct the signal
          const {
            beaconId: id,
            beaconType: type,
            beaconAddress: address,
            tx
          } = signal;

          // Create a new Beacon object
          const beacon = BeaconFactory.create({ id, type, serviceEndpoint: `bitcoin:${address}` });
          console.log('beacon', beacon);
          // Process the signal
          const updates = await beacon.processSignal(tx, sidecarData);

          // If the updates is null, throw an error
          if (!updates) {
            throw new Error(`Invalid updates from signal ${tx}`);
          }

          // Return the updatePayload
          return updates;
        }
      )
    );
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#confirm-duplicate-update | 4.2.3.5 Confirm Duplicate Update}.
   *
   * The Confirm Duplicate Update algorithm takes in a {@link DidUpdatePayload | DID Update Payload} and verifies that
   * the update is a duplicate against the hash history of previously applied updates. The algorithm takes in an update
   * and an array of hashes, updateHashHistory. It throws an error if the update is not a duplicate, otherwise it
   * returns.
   *
   * TODO: Does this algorithm need `contemporaryHash` passed in?
   *
   * @public
   * @static
   * @async
   * @param {{ update: DidUpdatePayload; updateHashHistory: string[]; }} params Parameters for confirmDuplicateUpdate.
   * @param {DidUpdatePayload} params.update The DID Update Payload to confirm.
   * @param {Array<string>} params.updateHashHistory The history of hashes for previously applied updates.
   * @returns {Promise<void>} A promise that resolves if the update is a duplicate, otherwise throws an error.
   * @throws {DidBtc1Error} if the update hash does not match the historical hash.
   */
  public static async confirmDuplicateUpdate({ update, updateHashHistory }: {
    update: DidUpdatePayload;
    updateHashHistory: string[];
  }): Promise<void> {
    // Hash the update payload
    const updateHash = await process(update);

    // Get the historical update hash from the updateHashHistory
    const historicalUpdateHash = updateHashHistory[update.targetVersionId - 2];

    // Check if the updateHash matches the historical hash
    if (historicalUpdateHash !== updateHash) {
      throw new Btc1ReadError(`Invalid duplicate: ${updateHash} does not match ${historicalUpdateHash}`, 'LATE_PUBLISHING_ERROR');
    }
  }

  /**
   * TODO: Where do we get the public key to instantiate cryptosuite?
   * TODO: Refactor Multikey to accept KeyPair, PrivateKey, PublicKey or any combo as JSON object(s) or bytes
   * TODO: Refactor Cryptosuite to default to RDFC
   * TODO: What is the mediaType?
   * TODO: How to ensure proof is valid invocation of root capability
   *
   * Implements {@link https://dcdpr.github.io/did-btc1/#apply-did-update | 4.2.3.6 Apply DID Update}.
   *
   * This algorithm attempts to apply a DID Update to a DID document, it first verifies the proof on the update is a
   * valid capabilityInvocation of the root authority over the DID being resolved. Then it applies the JSON patch
   * transformation to the DID document, checks the transformed DID document matches the targetHash specified by the
   * update and validates it is a conformant DID document before returning it. This algorithm takes inputs
   * contemporaryDIDDocument and an update.
   *
   * @public
   * @static
   * @async
   * @param {ApplyDidUpdateParams} params Parameters for applyDidUpdate.
   * @param {Btc1DidDocument} params.contemporaryDIDDocument The current DID Document to update.
   * @param {DidUpdatePayload} params.update The DID Update Payload to apply.
   * @param {Bytes} params.genesisBytes The genesis bytes for the DID Document.
   * @returns {Promise<Btc1DidDocument>}
   */
  public static async applyDidUpdate({ contemporaryDIDDocument, update, genesisBytes }: {
    contemporaryDIDDocument: Btc1DidDocument;
    update: DidUpdatePayload;
    genesisBytes: Bytes;
  }): Promise<Btc1DidDocument> {
    console.info('TODO: applyDidUpdate - Where do we get the public key to instantiate cryptosuite?');

    // Deconstruct the vm and capabilityInvocation from the DID Document.
    const { verificationMethod, capabilityInvocation } = contemporaryDIDDocument;

    // Validate the verificationMethod is not null.
    if(!verificationMethod) {
      throw new Btc1ReadError('No verificationMethod found in DID Document', 'INVALID_DID_DOCUMENT');
    }

    // Validate the capabilityInvocation is not null.
    if(!capabilityInvocation) {
      throw new Btc1ReadError('No capabilityInvocation found in DID Document', 'INVALID_DID_DOCUMENT');
    }

    // Deconstruct the id and controller from the verificationMethod.
    const { id, controller } = verificationMethod[0];

    // Construct a new KeyPair and Multikey.
    const keyPair = new KeyPair({ publicKey: genesisBytes });
    // TODO: Refactor Multikey to accept KeyPair, PrivateKey, PublicKey or JSON or bytes?
    const multikey = new Multikey({ id, controller, keyPair });
    console.info('TODO: Refactor Multikey to accept KeyPair, PrivateKey, PublicKey or JSON or bytes.', multikey);

    // 1. Instantiate a schnorr-secp256k1-2025 cryptosuite instance.
    // TODO: Refactor Cryptosuite to default to RDFC
    const cryptosuite = new Cryptosuite({ cryptosuite: 'bip340-jcs-2025', multikey });
    console.info('TODO: Refactor Cryptosuite to default to RDFC.', cryptosuite);

    // 2. Set expectedProofPurpose to capabilityInvocation.
    const expectedPurpose = capabilityInvocation[0] as string;

    // 3. Set mediaType to ????
    // TODO: What is the mediaType?
    const mediaType = 'application/json';
    console.info('TODO: What is the mediaType?', mediaType);

    // 4. Set documentBytes to the bytes representation of update.
    const document  = await canonicalize(update);
    // 5. Set verificationResult to the result of passing mediaType, documentBytes, cryptosuite, and
    //    expectedProofPurpose into the Verify Proof algorithm defined in the VC Data Integrity specification.
    const diProof = new DataIntegrityProof(cryptosuite);
    const verificationResult = await diProof.verifyProof({ mediaType, document, expectedPurpose });
    console.info('TODO: How to ensure proof is valid invocation of root capability?', verificationResult);

    // 6.
    // TODO: How to ensure proof is valid invocation of root capability
    // 7. Set targetDIDDocument to a copy of contemporaryDIDDocument.
    let targetDIDDocument = contemporaryDIDDocument;

    // 8. Use JSON Patch to apply the update.patch to the targetDIDDOcument.
    targetDIDDocument = JsonPatch.apply(targetDIDDocument, update.patch);

    // 9. Verify that targetDIDDocument is conformant with the data model specified by the DID Core specification.
    Btc1DidDocument.validate(targetDIDDocument);

    // 10. Set targetHash to the SHA256 hash of targetDIDDocument.
    const targetHash = await process(targetDIDDocument);

    // 11. Check that targetHash equals update.targetHash, else raise InvalidDIDUpdate error.
    if (targetHash !== update.targetHash) {
      throw new Btc1ReadError(`Invalid update: ${targetHash} does not match ${update.targetHash}`, 'INVALID_DID_UPDATE');
    }
    // 12. Return targetDIDDocument.
    return targetDIDDocument;
  }
}