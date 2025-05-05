import { DidUpdatePayload } from '@did-btc1/common';
import { DidServiceEndpoint } from '@web5/dids';
import { RawTransactionV2 } from '../types/bitcoin.js';
import { CIDAggregateSidecar, SidecarData, SignalsMetadata, SingletonSidecar, SMTAggregateSidecar } from '../types/crud.js';
import { BeaconService, BeaconSignal, IBeacon } from './ibeacon.js';
import { RawTransactionRest } from '../bitcoin/rest-client.js';

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#update-beacons | 5. Beacons}.
 * Beacons are the mechanism by which a DID controller announces an update to their DID document by broadcasting an
 * attestation to this update onto the public Bitcoin network. Beacons are identified by a Bitcoin address and emit
 * Beacon Signals by broadcasting a valid Bitcoin transaction that spends from this Beacon address. These transactions
 * include attestations to a set of didUpdatePayloads, either in the form of Content Identifiers (CIDs) or Sparse Merkle
 * Tree (SMT) roots. Beacons are included as a service in DID documents, with the Service Endpoint identifying a Bitcoin
 * address to watch for Beacon Signals. All Beacon Signals broadcast from this Beacon MUST be processed as part of
 * resolution (see Read). The type of the Beacon service in the DID document defines how Beacon Signals SHOULD be
 * processed.
 * did:btc1 supports different Beacon Types, with each type defining a set of algorithms for:
 *  1. How a Beacon can be established and added as a service to a DID document.
 *  2. How attestations to DID updates are broadcast within Beacon Signals.
 *  3. How a resolver processes a Beacon Signal, identifying, verifying, and applying the authorized mutations to a
 *     DID document for a specific DID.
 * This is an extendable mechanism, such that in the future new Beacon Types could be added. It would be up to the
 * resolver to determine if the Beacon Type is a mechanism they support and are willing to trust. If they are unable to
 * support a Beacon Type and a DID they are resolving uses that type then the DID MUST be treated as invalid.
 * The current, active Beacons of a DID document are specified in the document’s service property. By updating the DID
 * document, a DID controller can change the set of Beacons they can use to broadcast updates to their DID document over
 * time. Resolution of a DID MUST process signals from all Beacons identified in the latest DID document and apply them
 * in order determined by the version specified by the didUpdatePayload.
 * All resolvers of did:btc1 DIDs MUST support the core Beacon Types defined in this specification.
 *
 * @abstract
 * @class Beacon
 * @type {Beacon}
 */
export abstract class Beacon implements IBeacon {
  public id: string;
  public type: string;
  public serviceEndpoint: DidServiceEndpoint;
  public sidecar?: SingletonSidecar | CIDAggregateSidecar | SMTAggregateSidecar;

  constructor({ id, type, serviceEndpoint }: BeaconService, sidecar?: SidecarData) {
    this.id = id;
    this.type = type;
    this.serviceEndpoint = serviceEndpoint;
    this.sidecar = sidecar;
  }

  /**
   * Returns the Beacon Service object.
   */
  abstract get service(): BeaconService;

  /**
   * Generates a Beacon Signal (implemented by subclasses).
   */
  abstract generateSignal(didUpdatePayload: string): BeaconSignal;

  /**
   * Processes a Beacon Signal (implemented by subclasses).
   */
  abstract processSignal(signal: RawTransactionRest | RawTransactionV2, signalsMetadata: SignalsMetadata): Promise<DidUpdatePayload | undefined>

  /**
   * Broadcasts a Beacon Signal (implemented by subclasses).
   */
  abstract broadcastSignal(didUpdatePayload: DidUpdatePayload): Promise<SignalsMetadata>;
}