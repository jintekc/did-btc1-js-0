import { CIDAggregateBeacon } from './cid-aggregate.js';
import { Beacon } from './beacon.js';
import { BeaconService } from './interface.js';
import { SingletonBeacon } from './singleton.js';
import { SMTAggregateBeacon } from './smt-aggregate.js';
import { DidBtc1Error } from '@did-btc1/common';

/**
 * Factory for Beacon creation
 */
export class BeaconFactory {
  static create(params: BeaconService): Beacon {
    switch (params.type) {
      case 'SingletonBeacon':
        return new SingletonBeacon(params);
      case 'CIDAggregateBeacon':
        return new CIDAggregateBeacon(params);
      case 'SMTAggregateBeacon':
        return new SMTAggregateBeacon(params);
      default:
        throw new DidBtc1Error('Invalid Beacon Type', { type: 'BEACON_ERROR' });
    }
  }
}
