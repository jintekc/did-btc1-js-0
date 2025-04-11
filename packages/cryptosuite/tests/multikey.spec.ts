import { KeyPairError, MultikeyError } from '@did-btc1/common';
import { KeyPair, PrivateKey, PrivateKeyUtils, PublicKey } from '@did-btc1/key-pair';
import { expect } from 'chai';
import { Multikey } from '../src/index.js';

/**
 * Multikey Test Cases
 * 1. id, controller only → should throw
 * 2. id, controller, privateKey → should succeed
 * 3. id, controller, publicKey → should succeed
 * 4. id, controller, privateKey, publicKey → should succeed
 */
describe('Multikey instantiated', () => {
  const privateKeyBytes = new Uint8Array([
    69, 112, 198, 176,  14, 103, 100,  73,
    35, 179, 169,  83,  80, 213, 189, 190,
    118, 200,   5,  43,  20,  46, 148,  60,
    109,  37, 134, 164, 162, 174, 185, 201
  ]);
  const keys = new KeyPair({ privateKey: privateKeyBytes });
  const publicKey = keys.publicKey;
  // Multikey Constants
  const id = '#initialKey';
  const controller = 'did:btc1:regtest:k1qtwrw6r00e3rh6hv02ak42mweykcg0u7n478vl5ks4ugfppl9dfs7m3gyfg';
  const fullId = `${controller}${id}`;
  const publicKeyMultibase = 'zQ3shcERTF2BZqz4v51hDdPdM4di9xFWNadCakCkQmNEZPdPt';
  const verificationMethod = { id, type: 'Multikey', controller, publicKeyMultibase };
  const message = Buffer.from('Hello BTC1!');
  const validSignature = new Uint8Array([
    85,  48,  48, 200, 201, 230, 173,  26, 182,  77,  38,
    134, 190, 167, 208,  58, 190, 165, 243, 187,  71, 193,
    232, 243,   1, 110, 127,  15, 234, 208,  21, 154, 111,
    110, 141, 130,  83, 111, 128, 223,  85, 221, 218, 127,
    240, 108,  12,  95,  69, 101, 185, 118, 100, 215, 127,
    204,  11, 107,  75, 251, 240, 246,  93, 113
  ]);
  const invalidSignature =  new Uint8Array([
    25, 105, 158, 232,  91,   7,  61,   8,   2, 215, 191,
    122,  47,  51, 195, 195, 207,  95, 213, 226,  72, 224,
    10, 153,  84,  66, 197, 186, 110, 108,  91, 156, 195,
    157, 126,  82,  51,  10, 167, 163, 240, 244, 231, 140,
    202, 250, 220, 245, 132,  34, 102,  64, 202,  24,  97,
    163,  84,  73, 128,   5, 188, 219,  47, 133
  ]);

  /**
   * Incomplete parameters
   */
  describe('No KeyPair', () => {
    it('should throw MultikeyError', () => {
      expect(() => new Multikey({ id, controller }))
        .to.throw(MultikeyError, 'Argument missing: "keyPair" required');
    });
  });

  /**
   * All parameters
   */
  describe('KeyPair', () => {
    const multikey = new Multikey({ id, controller, keyPair: keys });

    it('should successfully construct a new Multikey', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, privateKey, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(PrivateKey);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.privateKey.equals(keys.privateKey)).to.be.true;
      expect(multikey.publicKey.equals(keys.publicKey)).to.be.true;
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should resolve verification of a valid schnorr signature to true', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should resolve verification of an invalid schnorr signature to false', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should contain a PublicKey in x-only base58btc format', () => {
      const publicKey = multikey.publicKey;
      expect(publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(publicKey.multibase).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(JSON.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(keys.publicKey)).to.be.true;
    });
  });

  /**
   * Key Pair with Public Key passed only
   */
  describe('Verification KeyPair (PublicKey-Only)', () => {
    const keyPair = new KeyPair({ publicKey });
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey with publicKey only', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
    });

    it('should have proper variables: id, controller, publicKey', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(() => multikey.privateKey).to.throw(KeyPairError, 'Private key not available');
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.publicKey.equals(publicKey)).to.be.true;
    });

    it('should throw KeyPairError', () => {
      expect(() => multikey.sign(message))
        .to.throw(KeyPairError, 'Private key not available');
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to bytes', () => {
      expect(multikey.publicKey.decode()).to.be.instanceOf(Uint8Array);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(JSON.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
    });
  });

  /**
   * Key Pair with PrivateKey passed only
   */
  describe('Sign/Verify KeyPair (PrivateKey-PublicKey)', () => {
    const keyPair = new KeyPair({ privateKey: keys.privateKey });
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey with a keyPair', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, keyPair', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(PrivateKey);
      expect(multikey.privateKey.equals(keyPair.privateKey)).to.be.true;
      expect(multikey.publicKey.equals(keyPair.publicKey)).to.be.true;
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to public key bytes', () => {
      expect(multikey.publicKey.decode()).to.be.instanceOf(Uint8Array);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(JSON.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
    });
  });

  /**
   * Key Pair from Secret
   */
  describe('Sign/Verify KeyPair (PrivateKey.fromSecret)', () => {
    const SECRET = 31408844715744742771434292216794392628447163656691664006588916258271600228809n;
    const privateKey = PrivateKeyUtils.fromSecret(SECRET);
    const keyPair = new KeyPair({ privateKey });
    const multikey = new Multikey({ id, controller, keyPair });

    it('should successfully construct a new Multikey with a keyPair', () => {
      expect(multikey).to.exist.and.to.be.instanceOf(Multikey);
    });

    it('should have proper variables: id, controller, keyPair', () => {
      expect(multikey.id).to.equal(id);
      expect(multikey.controller).to.equal(controller);
      expect(multikey.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikey.privateKey).to.exist.and.to.be.instanceOf(PrivateKey);
      expect(multikey.privateKey.equals(privateKey)).to.be.true;
      expect(multikey.publicKey.equals(publicKey)).to.be.true;
      expect(multikey.privateKey.secret).to.equal(SECRET);
    });

    it('should create a valid schnorr signature', () => {
      const signature = multikey.sign(message);
      expect(signature).to.exist.and.to.be.instanceOf(Uint8Array);
      expect(signature.length).to.equal(64);
    });

    it('should verify that a valid schnorr signature was produced by the Multikey', () => {
      expect(multikey.verify(validSignature, message)).to.be.true;
    });

    it('should verify that an invalid schnorr signature was not produced by the Multikey', () => {
      expect(multikey.verify(invalidSignature, message)).to.be.false;
    });

    it('should encode publicKey from bytes to Multikey Format', () => {
      expect(multikey.publicKey.encode()).to.equal(publicKeyMultibase);
    });

    it('should decode publicKeyMultibase from Multikey Format to public key bytes', () => {
      expect(multikey.publicKey.decode()).to.be.instanceOf(Uint8Array);
    });

    it('should have a matching full id', () => {
      expect(multikey.fullId()).to.equal(fullId);
    });

    it('should return a valid, matching verification method', () => {
      expect(JSON.deepEqual(multikey.toVerificationMethod(), verificationMethod)).to.equal(true);
    });

    it('should construct a valid Multikey with matching data given a valid verification method', () => {
      const multikeyFromVm = multikey.fromVerificationMethod(verificationMethod);
      expect(multikeyFromVm).to.exist.and.to.be.instanceOf(Multikey);
      expect(multikeyFromVm.id).to.equal(id);
      expect(multikeyFromVm.controller).to.equal(controller);
      expect(multikeyFromVm.publicKey).to.exist.and.to.be.instanceOf(PublicKey);
      expect(multikeyFromVm.publicKey.equals(publicKey)).to.be.true;
      expect(() => multikeyFromVm.privateKey.secret).to.throw(KeyPairError, 'Private key not available');
    });
  });
});