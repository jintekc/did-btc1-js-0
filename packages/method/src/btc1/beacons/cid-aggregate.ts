import { RawTransactionV2, SignedRawTx } from '../../bitcoin/types.js';
import { CIDAggregateSidecar, SidecarData, SignalsMetadata } from '../../types/crud.js';
import { Beacon } from '../../interfaces/beacon.js';
import { BeaconService, BeaconSignal } from '../../interfaces/ibeacon.js';
import { Btc1VerificationMethod } from '../utils/did-document.js';
import { DidUpdatePayload } from '../../interfaces/crud.js';

export class CIDAggregateBeacon extends Beacon {
  constructor(service: BeaconService, sidecar?: SidecarData) {
    super({ ...service, type: 'CIDAggregateBeacon' }, sidecar as CIDAggregateSidecar);
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
  processSignal(signal: RawTransactionV2, signalsMetadata: SignalsMetadata): Promise<DidUpdatePayload | undefined> {
    throw new Error('Method not implemented.' + signal + signalsMetadata);
  }
  broadcastSignal(beaconService: BeaconService, didUpdateInvocation: Btc1VerificationMethod): Promise<SignedRawTx> {
    throw new Error('Method not implemented.' + beaconService + didUpdateInvocation);
  }
}
