import BitcoinRpc from '../../src/bitcoin/rpc-client.js';
import { Btc1Read, DEFAULT_RPC_CLIENT_CONFIG } from '../../src/index.js';

const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);
const beacons = [
  [
    {
      'id'              : '#initial_p2pkh',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:muRxiMKmqP5HeA4njajdmuL7tQfrKjcNgb'
    },
    {
      'id'              : '#initial_p2wpkh',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1qnzsq0ejh4jkuqdslqn7vxdu589pxe45gkyfmhx'
    },
    {
      'id'              : '#initial_p2tr',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1pez6hwgel8rn7hykyzkxl4xxtna6clsvev5pgwquqn3ulqkkz7v7skh4md6'
    },
    {
      'id'              : '#linked-domain',
      'type'            : 'LinkedDomains',
      'serviceEndpoint' : 'https://contact-me.com'
    }
  ]
];

const initialDocument = {
  'id'       : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
  '@context' : [
    'https://www.w3.org/ns/did/v1',
    'https://did-btc1/TBD/context'
  ],
  'verificationMethod' : [
    {
      'id'                 : '#initialKey',
      'type'               : 'Multikey',
      'controller'         : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
      'publicKeyMultibase' : 'z66Ppr1hk7fkH6Corq9M62V4uT31tv4j4AZwCxrCUKC5Vofy'
    }
  ],
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
  'service' : [
    {
      'id'              : '#initial_p2pkh',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:muRxiMKmqP5HeA4njajdmuL7tQfrKjcNgb'
    },
    {
      'id'              : '#initial_p2wpkh',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1qnzsq0ejh4jkuqdslqn7vxdu589pxe45gkyfmhx'
    },
    {
      'id'              : '#initial_p2tr',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1pez6hwgel8rn7hykyzkxl4xxtna6clsvev5pgwquqn3ulqkkz7v7skh4md6'
    }
  ]
};
const contemporaryDidDocument = {
  'id'       : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
  '@context' : [
    'https://www.w3.org/ns/did/v1',
    'https://did-btc1/TBD/context'
  ],
  'verificationMethod' : [
    {
      'id'                 : '#initialKey',
      'type'               : 'Multikey',
      'controller'         : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
      'publicKeyMultibase' : 'z66Ppr1hk7fkH6Corq9M62V4uT31tv4j4AZwCxrCUKC5Vofy'
    }
  ],
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
  'service' : [
    {
      'id'              : '#initial_p2pkh',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:muRxiMKmqP5HeA4njajdmuL7tQfrKjcNgb'
    },
    {
      'id'              : '#initial_p2wpkh',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1qnzsq0ejh4jkuqdslqn7vxdu589pxe45gkyfmhx'
    },
    {
      'id'              : '#initial_p2tr',
      'type'            : 'SingletonBeacon',
      'serviceEndpoint' : 'bitcoin:bcrt1pez6hwgel8rn7hykyzkxl4xxtna6clsvev5pgwquqn3ulqkkz7v7skh4md6'
    },
    {
      'id'              : '#linked-domain',
      'type'            : 'LinkedDomains',
      'serviceEndpoint' : 'https://contact-me.com'
    }
  ]
};
const sidecarData = {
  'did'             : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
  'signalsMetadata' : {
    'f23ff93716c1190b384769cb45eea3efedc9b762b3a65b32547faba311ab5bfa' : {
      'updatePayload' : {
        '@context' : [
          'https://w3id.org/security/v2',
          'https://w3id.org/zcap/v1',
          'https://w3id.org/json-ld-patch/v1'
        ],
        'patch' : [
          {
            'op'    : 'add',
            'path'  : '/service/3',
            'value' : {
              'id'              : '#linked-domain',
              'type'            : 'LinkedDomains',
              'serviceEndpoint' : 'https://contact-me.com'
            }
          }
        ],
        'sourceHash'      : '9EUnJwoNB1DZF4yUmb8iFsBjXkUkSg9Hjq2P1NS96AX7',
        'targetHash'      : 'BZ4n8wiDWFRBV4Zu6aDV4WFsRPn3Jmu2Nb4xW9ebW8fj',
        'targetVersionId' : 2,
        'proof'           : {
          'type'               : 'DataIntegrityProof',
          'cryptosuite'        : 'schnorr-secp256k1-jcs-2025',
          'verificationMethod' : 'did:btc1:regtest:k1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf#initialKey',
          'proofPurpose'       : 'capabilityInvocation',
          'capability'         : 'urn:zcap:root:did%3Abtc1%3Aregtest%3Ak1qvadgpl5qfuz6emq7c8sqw28z0r0gzvyra3je3pp2cuk83uqnnyvckvw8cf',
          'capabilityAction'   : 'Write',
          '@context'           : [
            'https://w3id.org/security/v2',
            'https://w3id.org/zcap/v1',
            'https://w3id.org/json-ld-patch/v1'
          ],
          'proofValue' : 'z5xYgTCPgBW7ZAYywGkhznBXKKtjMX4cudM3Zc29GdHWe1QvV4hLmzuL2vYcb3gzc5ZyAm1KezfbYXHU6TuDaChCm'
        }
      }
    }
  }
};

const response = await Btc1Read.targetDocument({
  initialDocument,
  options : {
    sidecarData,
    versionTime : 1742394188
  }
});
console.log('response:', response);