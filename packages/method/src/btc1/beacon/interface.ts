import { DidServiceEndpoint, DidService as IDidService } from '@web5/dids';
import { RawTransactionV2 } from '../../bitcoin/types.js';
import { SidecarData } from '../../index.js';
import { DidUpdatePayload } from '../crud/interface.js';

/**
 * Beacon interface
 * @export
 * @interface IBeacon
 * @type {IBeacon}
 */
export interface IBeacon {
    /**
     * A unique identifier for the Beacon
     * @type {string}
     */
    id: string;

    /**
     * The type of the Beacon
     * @type {string}
     */
    type: string;

    /**
     * The service endpoint of the Beacon
     * @type {string}
     */
    serviceEndpoint: string;

    /**
     * Returns the Beacon Service object
     * @type {BeaconService}
     */
    service: BeaconService;

    /**
     * Generates a Beacon Signal Transaction
     * @param {string} didUpdatePayload The DID update payload
     * @returns {BeaconSignal} The Beacon Signal
     */
    generateSignal(didUpdatePayload: string): BeaconSignal;

    /**
     * Processes a Beacon Signal
     * @param {RawTransactionV2} tx The raw transaction
     * @param {SidecarData} [sidecarData] The sidecar data
     * @returns {Promise<DidUpdatePayload | undefined>} The DID update payload
     */
    processSignal(tx: RawTransactionV2, sidecarData?: SidecarData): Promise<DidUpdatePayload | undefined>;
}

export interface BeaconService extends IDidService {
    serviceEndpoint: DidServiceEndpoint;
    casType?: string;
}

export interface BeaconServiceAddress extends BeaconService {
    address: string;
}
export interface Signal {
  beaconId: string;
  beaconType: string;
  beaconAddress: string;
  tx: RawTransactionV2;
}
export interface BeaconSignal {
  blockheight: number;
  signals: Array<Signal>;
}