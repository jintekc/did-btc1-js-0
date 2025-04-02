[**@did-btc1/key-pair v0.4.3**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / IPublicKey

# Interface: IPublicKey

<<<<<<< HEAD
Defined in: [interface.ts:82](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L82)
=======
Defined in: [interface.ts:82](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L82)
>>>>>>> a27f4cb (cli@0.1.0)

Interface for the PublicKey class.
 IPublicKey

## Properties

### bytes

> **bytes**: `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:87](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L87)
=======
Defined in: [interface.ts:87](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L87)
>>>>>>> a27f4cb (cli@0.1.0)

Compressed public key getter.

***

### hex

> `readonly` **hex**: `Hex`

<<<<<<< HEAD
Defined in: [interface.ts:129](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L129)
=======
Defined in: [interface.ts:129](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L129)
>>>>>>> a27f4cb (cli@0.1.0)

Public key hex string getter.

***

### multibase

> `readonly` **multibase**: `string`

<<<<<<< HEAD
Defined in: [interface.ts:117](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L117)
=======
Defined in: [interface.ts:117](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L117)
>>>>>>> a27f4cb (cli@0.1.0)

Public key multibase getter.

#### Returns

The public key as a base58btc multibase string.

***

### parity

> `readonly` **parity**: `number`

<<<<<<< HEAD
Defined in: [interface.ts:99](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L99)
=======
Defined in: [interface.ts:99](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L99)
>>>>>>> a27f4cb (cli@0.1.0)

Public key parity getter.

***

### prefix

> `readonly` **prefix**: `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:123](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L123)
=======
Defined in: [interface.ts:123](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L123)
>>>>>>> a27f4cb (cli@0.1.0)

Public key multibase prefix getter.

***

### uncompressed

> `readonly` **uncompressed**: `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:93](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L93)
=======
Defined in: [interface.ts:93](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L93)
>>>>>>> a27f4cb (cli@0.1.0)

Uncompressed public key getter.

***

### x

> `readonly` **x**: `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:105](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L105)
=======
Defined in: [interface.ts:105](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L105)
>>>>>>> a27f4cb (cli@0.1.0)

Public key x-coordinate getter.

***

### y

> `readonly` **y**: `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:111](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L111)
=======
Defined in: [interface.ts:111](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L111)
>>>>>>> a27f4cb (cli@0.1.0)

Public key y-coordinate getter.

## Methods

### decode()

> **decode**(): `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:135](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L135)
=======
Defined in: [interface.ts:135](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L135)
>>>>>>> a27f4cb (cli@0.1.0)

Decode the base58btc multibase string to the compressed public key prefixed with 0x02.

#### Returns

`Bytes`

The public key as a 33-byte compressed public key with header.

***

### encode()

> **encode**(): `string`

<<<<<<< HEAD
Defined in: [interface.ts:141](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L141)
=======
Defined in: [interface.ts:141](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L141)
>>>>>>> a27f4cb (cli@0.1.0)

Encode the PublicKey as an x-only base58btc multibase public key.

#### Returns

`string`

The public key formatted a base58btc multibase string.

***

### equals()

> **equals**(`other`): `boolean`

<<<<<<< HEAD
Defined in: [interface.ts:148](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L148)
=======
Defined in: [interface.ts:148](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L148)
>>>>>>> a27f4cb (cli@0.1.0)

Public key equality check. Checks if `this` public key is equal to `other` public key.

#### Parameters

##### other

[`PublicKey`](../classes/PublicKey.md)

The public key to compare.

#### Returns

`boolean`

True if the public keys are equal.

***

### json()

> **json**(): `PublicKeyJSON`

<<<<<<< HEAD
Defined in: [interface.ts:154](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L154)
=======
Defined in: [interface.ts:154](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L154)
>>>>>>> a27f4cb (cli@0.1.0)

JSON representation of a PublicKey object.

#### Returns

`PublicKeyJSON`

The PublicKey as a JSON object.
