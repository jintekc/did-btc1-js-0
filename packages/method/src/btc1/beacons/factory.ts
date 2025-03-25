import { CIDAggregateBeacon } from './cid-aggregate.js';
import { Beacon } from '../../interfaces/beacon.js';
import { BeaconService } from '../../interfaces/ibeacon.js';
import { SingletonBeacon } from './singleton.js';
import { SMTAggregateBeacon } from './smt-aggregate.js';
import { DidBtc1Error } from '@did-btc1/common';
import { SidecarData } from '../../index.js';

/**
 * Factory for Beacon creation
 */
export class BeaconFactory {
  static create(params: BeaconService, sidecar?: SidecarData): Beacon {
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
