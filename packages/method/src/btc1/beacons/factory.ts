import { DidBtc1Error } from '@did-btc1/common';
import { Beacon } from '../../interfaces/beacon.js';
import { BeaconService } from '../../interfaces/ibeacon.js';
import { SidecarData } from '../../types/crud.js';
import { CIDAggregateBeacon } from './cid-aggregate.js';
import { SingletonBeacon } from './singleton.js';
import { SMTAggregateBeacon } from './smt-aggregate.js';

/**
 * Beacon Factory pattern to create Beacon instances.
 * @class BeaconFactory
 * @type {BeaconFactory}
 */
export class BeaconFactory {
  static establish(params: BeaconService, sidecar?: SidecarData): Beacon {
    switch (params.type) {
      case 'SingletonBeacon':
        return new SingletonBeacon(params, sidecar);
      case 'CIDAggregateBeacon':
        return new CIDAggregateBeacon(params, sidecar);
      case 'SMTAggregateBeacon':
        return new SMTAggregateBeacon(params, sidecar);
      default:
        throw new DidBtc1Error('Invalid Beacon Type', { type: 'BEACON_ERROR' });
    }
  }
}
