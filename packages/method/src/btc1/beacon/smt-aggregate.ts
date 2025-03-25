import { RawTransactionV2 } from '../../bitcoin/types.js';
import { DidUpdatePayload } from '../crud/interface.js';
import { SidecarData } from '../crud/types.js';
import { Beacon } from './index.js';
import { BeaconService, BeaconSignal } from './interface.js';
import { BeaconParams } from './types.js';

export class SMTAggregateBeacon extends Beacon {
  constructor(params: BeaconParams) {
    super({ ...params, type: 'CIDAggregateBeacon' });
  }

  get service(): BeaconService {
    return {
      type            : this.type,
      id              : this.id,
      serviceEndpoint : this.serviceEndpoint
    };
  }
  generateSignal(didUpdatePayload: string): BeaconSignal {
    throw new Error('Method not implemented.' + didUpdatePayload);
  }
  processSignal(tx: RawTransactionV2, sidecarData?: SidecarData): Promise<DidUpdatePayload | undefined> {
    throw new Error('Method not implemented.' + tx + sidecarData);
  }
}
