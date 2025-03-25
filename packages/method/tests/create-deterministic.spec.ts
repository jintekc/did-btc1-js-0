import { expect } from 'chai';
import { DidBtc1 } from '../src/did-btc1.js';
import { idTypes, networks, versions } from './test-data.js';
import { KeyPair } from '@did-btc1/key-pair';
import { canonicalization } from '@did-btc1/common';

/**
 * DidBtc1 Create Key Test Cases
 *
 * publicKey
 * idType=key, publicKey
 * idType=key, publicKey, version
 * idType=key, publicKey, network
 * idType=key, publicKey, version, network
 */
describe('DidBtc1 Create Deterministic', () => {
  canonicalization.setAlgorithm('JCS');
  const idType = idTypes.key as 'key';
  const privateKey = new Uint8Array([
    189,  38, 143, 201, 181, 132,  46, 71,
    232,  89, 206, 136, 196, 208, 94, 153,
    101, 219, 165,  94, 235, 242, 29, 164,
    176, 161, 99, 193, 209,  97,  23, 158
  ]);
  const keypair = new KeyPair({ privateKey});
  const pubKeyBytes = keypair.publicKey.bytes;

  it('should create a deterministic (idType=key) identifier and DID document from a publicKey',
    async () => {
      const result = await DidBtc1.create({ idType, pubKeyBytes });
      expect(result).to.exist;
    });

  it('should create a deterministic (idType=key) identifier and DID document from a publicKey and version',
    async () => {
      const results = await Promise.all(
        versions.map(async (version: string) =>
          await DidBtc1.create({ idType, pubKeyBytes, options: { version }})
        )
      );
      expect(results.length).to.equal(5);
    });

  it('should create a deterministic (idType=key) identifier and DID document from a publicKey and network',
    async () => {
      const results = await Promise.all(
        networks.map(
          async (network: string) =>
            await DidBtc1.create({ idType, pubKeyBytes, options: { network } })
        )
      );
      expect(results.length).to.equal(4);
    });

  it('should create a deterministic (idType=key) identifier and DID document from a publicKey, version and network',
    async () => {
      const results = await Promise.all(
        versions
          .flatMap((version: string) => networks.map((network: string) => [version, network]))
          .map(
            async ([version, network]: string[]) =>
              await DidBtc1.create({ idType, pubKeyBytes, options: { version, network } })
          )
      );
      expect(results.length).to.equal(20);
    });
});
