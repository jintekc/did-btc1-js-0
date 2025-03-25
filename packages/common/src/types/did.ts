export type DID = 'did';
export type MethodName = string;
export type MethodSpecificId = string;
export type DecentralizedIdentifierExplicit = `${DID}:${MethodName}:${MethodSpecificId}`;
export type DecentralizedIdentifier = string;
export type Btc1MethodName = 'btc1';
export type Btc1DeterministicPrefix = 'k';
export type Btc1ExternalPrefix = 'x';
export type Btc1Prefix = `${Btc1DeterministicPrefix | Btc1ExternalPrefix}1`;
export type Bech32Id = string;
export type Btc1Id = `${Btc1Prefix}${Bech32Id}`
export type Btc1IdentifierExplicit = `${DID}:${Btc1MethodName}:${Btc1Id}`;
export type Btc1Identifier = string;
export type Controller = Btc1Identifier;
export type Id = 'initialKey';
export type FullId = `${Controller}#${Id}`;
export enum DidBtc1IdTypes {
    key = 'key',
    external = 'external'
};
export enum Btc1Networks {
    mainnet = 'mainnet',
    testnet = 'testnet',
    signet = 'signet',
    regtest = 'regtest'
};
export type KeyIdentifier = string;
export type BeaconUri = string;
export type Btc1Network = 'mainnet' | 'testnet' | 'signet' | 'regtest';
export type DidPlaceholder = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

