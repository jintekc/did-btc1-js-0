import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { Btc1DidDocument, IntermediateDidDocument } from '../src/index.js';
import { Btc1IdentifierTypes } from '@did-btc1/common';

/**
 * DidBtc1 Create External Test Cases
 * idType=external, intermediateDocument
 * idType=external, intermediateDocument, version
 * idType=external, intermediateDocument, network
 */
describe('DidBtc1 Create External', () => {
  const expectedDid = 'did:btc1:x1q20n602dgh7awm6akhgne0mjcmfpnjpc9jrqnrzuuexglrmklzm6u98hgvp';

  it('should create external identifier and DID document',
    async () => {
      const intermediateDocument = new IntermediateDidDocument({
        '@context' : [
          'https://www.w3.org/TR/did-1.1',
          'https://did-btc1/TBD/context'
        ],
        'id'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'controller' : [
          'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        ],
        'verificationMethod' : [
          {
            'id'                 : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-0',
            'type'               : 'Multikey',
            'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'publicKeyMultibase' : 'zQ3shtiWU2YmQJnwWBZ69DtWrLck6VWajEs64joMqRS5KXcZ5'
          },
          {
            'id'                 : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-1',
            'type'               : 'Multikey',
            'controller'         : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'publicKeyMultibase' : 'zQ3shNmrN4M1vcMtT57dfyYvVPhSVnzo8QUgcz4E5ZzJSzi4w'
          }
        ],
        'authentication' : [
          'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-0'
        ],
        'capabilityInvocation' : [
          'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-1'
        ],
        'capabilityDelegation' : [
          'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#key-1'
        ],
        'service' : [
          {
            'id'              : 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx#service-0',
            'type'            : 'SingletonBeacon',
            'serviceEndpoint' : 'bitcoin:bcrt1qser62ssp8n49yh5famt93m7tdgwqv76r3j9d5n'
          }
        ]
      });
      const {did, initialDocument} = await DidBtc1.create({ idType: Btc1IdentifierTypes.EXTERNAL, intermediateDocument });
      console.log('did:', did);
      console.log('initialDocument:', initialDocument);
      expect(did).to.equal(expectedDid);
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
});