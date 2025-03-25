
export type BeaconType = 'SingletonBeacon' | 'CIDAggregateBeacon' | 'SMTAggregateBeacon';
export type BeaconParams = {
  id: string;
  type: string;
  serviceEndpoint: string;
  casType?: string;
}
