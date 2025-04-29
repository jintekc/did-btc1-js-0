import { ID_PLACEHOLDER_VALUE } from '@did-btc1/common';
import { KeyPair, PrivateKeyUtils } from '@did-btc1/key-pair';
import { BeaconUtils, DidBtc1, getNetwork, IntermediateDidDocument } from '../../../../src/index.js';

const networks = [
  'bitcoin',
  'signet',
  'regtest',
  'testnet3',
  'testnet4',
];

const privateKeyBytes = PrivateKeyUtils.randomBytes();
const keys = new KeyPair({ privateKey: privateKeyBytes });
console.log('keys:', keys);

for(const network of networks) {
  const verificationMethod = [
    {
      id                 : `${ID_PLACEHOLDER_VALUE}#initialKey`,
      type               : 'Multikey',
      controller         : ID_PLACEHOLDER_VALUE,
      publicKeyMultibase : keys.publicKey.multibase
    }
  ];
  const service = BeaconUtils.generateBeaconServices({
    identifier : ID_PLACEHOLDER_VALUE,
    network    : getNetwork(network),
    type       : 'SingletonBeacon',
    publicKey  : keys.publicKey.bytes
  });
  const intermediateDocument = new IntermediateDidDocument({ id: ID_PLACEHOLDER_VALUE, verificationMethod, service });
  const response = await DidBtc1.create({
    idType  : 'EXTERNAL',
    intermediateDocument,
    options : { version: 1, network },
  });

  console.log('Created BTC1 Identifier and Initial Document:', JSON.stringify(response, null, 4));
}