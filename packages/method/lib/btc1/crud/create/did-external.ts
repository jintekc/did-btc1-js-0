import { DidBtc1, IntermediateDocument } from '../../../../src/index.js';

// const pubKeyBytes = new Uint8Array([
//   3, 147,  88, 104, 169, 222, 126,
//   240, 163,  35, 114, 143, 194, 209,  28,
//   255,  72, 250, 175, 176, 247, 124, 245,
//   215,  91, 220, 129, 191,  13,  20,  58,
//   47,  32
// ]);
const intermediateDocument = {
  '@context' : [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/multikey/v1',
    'https://github.com/dcdpr/did-btc1'
  ],
  'id'             : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'authentication' : [
    '#initialKey'
  ],
  'assertionMethod' : [
    '#initialKey'
  ],
  'capabilityInvocation' : [
    '#initialKey'
  ],
  'capabilityDelegation' : [
    '#initialKey'
  ],
  'verificationMethod' : [
    {
      'id'                 : '#initialKey',
      'type'               : 'Multikey',
      'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'publicKeyMultibase' : 'zQ3shpZHFLt431a2Wwuz8E4X5MHEHcEiWcJYL56pWE3Qdk6PR'
    }
  ],
  'service' : [
    {
      'id'              : '#initialP2PKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:mydQ4tayp5vRsmzBC2ok4pm4N4CgyJCNHx'
    },
    {
      'id'              : '#initialP2WPKH',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1qc64yvtfhvw0la3snqsjtadl0z33jdrradwxn2x'
    },
    {
      'id'              : '#initialP2TR',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1phs8emctdn8j6hwthx8m7ns0v2kpu22psplyvcf0kqpexrd2raj6quyjahs'
    }
  ]
} as IntermediateDocument;
const response = await DidBtc1.create({
  idType  : 'EXTERNAL',
  intermediateDocument,
  options : { version: 1, network: 'bitcoin' },
});

console.log('Created BTC1 Identifier and Initial Document:', JSON.stringify(response, null, 4));