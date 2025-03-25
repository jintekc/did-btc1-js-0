import { RawTransactionV2, SignedRawTx } from '../../bitcoin/types.js';
import { Beacon } from '../../interfaces/beacon.js';
import { DidUpdatePayload } from '../../interfaces/crud.js';
import { BeaconService, BeaconSignal } from '../../interfaces/ibeacon.js';
import { SidecarData, SignalsMetadata, SMTAggregateSidecar } from '../../types/crud.js';
import { Btc1VerificationMethod } from '../utils/did-document.js';

export class SMTAggregateBeacon extends Beacon {
  constructor(service: BeaconService, sidecar?: SidecarData) {
    super({ ...service, type: 'CIDAggregateBeacon' }, sidecar as SMTAggregateSidecar);
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
  processSignal(signal: RawTransactionV2, signalsMetadata?: SignalsMetadata): Promise<DidUpdatePayload | undefined> {
    throw new Error('Method not implemented.' + signal + signalsMetadata);
  }
  broadcastSignal(beaconService: BeaconService, didUpdateInvocation: Btc1VerificationMethod): Promise<SignedRawTx> {
    throw new Error('Method not implemented.' + beaconService + didUpdateInvocation);
  }
}
