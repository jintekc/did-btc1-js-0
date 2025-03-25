import { Did } from '@web5/dids';

export interface DidComponents extends Did {
    hrp: string;
    genesisBytes: Uint8Array;
    version: string;
    network: string;
    idBech32: string;
};