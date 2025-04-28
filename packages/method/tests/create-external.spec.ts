import { ID_PLACEHOLDER_VALUE } from '@did-btc1/common';
import { PublicKey } from '@did-btc1/key-pair';
import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { BeaconUtils, Btc1DidDocument, getNetwork, IntermediateDidDocument } from '../src/index.js';

/**
 * DidBtc1 Create External Test Cases
 * idType=external, intermediateDocument
 * idType=external, intermediateDocument, version
 * idType=external, intermediateDocument, network
 */
describe('DidBtc1 Create External', () => {
  const version = 1;
  const expectedDidMap = new Map<string, string>([
    ['bitcoin', 'did:btc1:x1qryscfzk5eqpjegser84gyg3rz5rkpprk8wlhz5l8u894vl0ddpx6z42p4y'],
    ['signet', 'did:btc1:x1q8yscfzk5eqpjegser84gyg3rz5rkpprk8wlhz5l8u894vl0ddpx6c2l7kn'],
    ['regtest', 'did:btc1:x1qtyscfzk5eqpjegser84gyg3rz5rkpprk8wlhz5l8u894vl0ddpx6lzfknr'],
    ['testnet3', 'did:btc1:x1q0yscfzk5eqpjegser84gyg3rz5rkpprk8wlhz5l8u894vl0ddpx69aufs5'],
    ['testnet4', 'did:btc1:x1qnyscfzk5eqpjegser84gyg3rz5rkpprk8wlhz5l8u894vl0ddpx63jvxe2']
  ]);
  const networkDidEntries = Object.entries(expectedDidMap);
  const idType = 'EXTERNAL';
  const pubKeyBytes = new Uint8Array([
    3, 147,  88, 104, 169, 222, 126,
    240, 163,  35, 114, 143, 194, 209,  28,
    255,  72, 250, 175, 176, 247, 124, 245,
    215,  91, 220, 129, 191,  13,  20,  58,
    47,  32
  ]);
  const publicKey = new PublicKey(pubKeyBytes);
  const publicKeyMultibase = publicKey.multibase;
  const service = BeaconUtils.generateBeaconServices({
    identifier : ID_PLACEHOLDER_VALUE,
    network    : getNetwork('bitcoin'),
    type       : 'SingletonBeacon',
    publicKey  : publicKey.bytes
  });
  const verificationMethod = [
    {
      id                 : `${ID_PLACEHOLDER_VALUE}#initialKey`,
      type               : 'Multikey',
      controller         : ID_PLACEHOLDER_VALUE,
      publicKeyMultibase
    }
  ];

  it('should create external identifier and DID document',
    async () => {
      const intermediateDocument = new IntermediateDidDocument({ id: ID_PLACEHOLDER_VALUE, verificationMethod, service });
      const {did, initialDocument} = await DidBtc1.create({ idType, intermediateDocument });

      expect(did).to.equal(expectedDidMap.get('bitcoin'));
      expect(initialDocument).to.be.instanceOf(Btc1DidDocument);

      expect(initialDocument.verificationMethod[0].id).to.equal(intermediateDocument.verificationMethod[0].id);
      expect(initialDocument.verificationMethod[0].type).to.equal(intermediateDocument.verificationMethod[0].type);
      expect(initialDocument.verificationMethod[0].controller).to.equal(intermediateDocument.verificationMethod[0].controller);
      expect(initialDocument.verificationMethod[0].publicKeyMultibase).to.equal(intermediateDocument.verificationMethod[0].publicKeyMultibase);

      expect(initialDocument.service[0].id).to.equal(intermediateDocument.service[0].id);
      expect(initialDocument.service[0].type).to.equal(intermediateDocument.service[0].type);
      expect(initialDocument.service[0].serviceEndpoint).to.equal(intermediateDocument.service[0].serviceEndpoint);
    }
  );

  it('should create new DID and BTC1 DID Document using version and intermediateDocument',
    async () => {
      const intermediateDocument = new IntermediateDidDocument({ id: ID_PLACEHOLDER_VALUE, verificationMethod, service });
      const {did, initialDocument} = await DidBtc1.create({ idType, intermediateDocument, options: { version }});

      expect(did).to.equal(did);
      expect(initialDocument).to.be.instanceOf(Btc1DidDocument);

      expect(initialDocument.verificationMethod[0].id).to.equal(intermediateDocument.verificationMethod[0].id);
      expect(initialDocument.verificationMethod[0].type).to.equal(intermediateDocument.verificationMethod[0].type);
      expect(initialDocument.verificationMethod[0].controller).to.equal(intermediateDocument.verificationMethod[0].controller);
      expect(initialDocument.verificationMethod[0].publicKeyMultibase).to.equal(intermediateDocument.verificationMethod[0].publicKeyMultibase);

      expect(initialDocument.service[0].id).to.equal(intermediateDocument.service[0].id);
      expect(initialDocument.service[0].type).to.equal(intermediateDocument.service[0].type);
      expect(initialDocument.service[0].serviceEndpoint).to.equal(intermediateDocument.service[0].serviceEndpoint);
    }
  );

  it('should create new DID and BTC1 DID Document using network and intermediateDocument',
    async () => {
      await Promise.all(
        networkDidEntries.map(
          async ([network, didExpected]) => {
            const intermediateDocument = new IntermediateDidDocument({ id: ID_PLACEHOLDER_VALUE, verificationMethod, service });
            const {did, initialDocument} = await DidBtc1.create({ idType, intermediateDocument, options: { network } });

            expect(did).to.equal(didExpected);
            expect(initialDocument).to.be.instanceOf(Btc1DidDocument);
            expect(initialDocument.verificationMethod[0].id).to.equal(intermediateDocument.verificationMethod[0].id);
            expect(initialDocument.verificationMethod[0].type).to.equal(intermediateDocument.verificationMethod[0].type);
            expect(initialDocument.verificationMethod[0].controller).to.equal(intermediateDocument.verificationMethod[0].controller);
            expect(initialDocument.verificationMethod[0].publicKeyMultibase).to.equal(intermediateDocument.verificationMethod[0].publicKeyMultibase);
            expect(initialDocument.service[0].id).to.equal(intermediateDocument.service[0].id);
            expect(initialDocument.service[0].type).to.equal(intermediateDocument.service[0].type);
            expect(initialDocument.service[0].serviceEndpoint).to.equal(intermediateDocument.service[0].serviceEndpoint);
          })
      );
    });
});