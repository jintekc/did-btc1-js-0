import { DidBtc1Error } from '../../utils/error.js';
import { Beacon } from './index.js';
import { CIDAggregateBeacon } from './cid-aggregate.js';
import { SingletonBeacon } from './singleton.js';
import { SMTAggregateBeacon } from './smt-aggregate.js';
import { BeaconParams } from './types.js';

/**
 * Factory for Beacon creation
 */
export class BeaconFactory {
  static create(params: BeaconParams): Beacon {
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
