import { RawTransactionV2, SignedRawTx } from '../../bitcoin/types.js';
import { DidUpdatePayload } from '../crud/interface.js';
import { SidecarData } from '../../types/crud.js';
import { Beacon } from './beacon.js';
import { BeaconService, BeaconSignal } from './interface.js';
import { Btc1VerificationMethod } from '../did-document.js';

export class SMTAggregateBeacon extends Beacon {
  constructor(params: BeaconService) {
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
  broadcastSignal(beaconService: BeaconService, didUpdateInvocation: Btc1VerificationMethod): Promise<SignedRawTx> {
    throw new Error('Method not implemented.' + beaconService + didUpdateInvocation);
  }
}
