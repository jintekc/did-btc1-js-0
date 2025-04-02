[**@did-btc1/key-pair v0.4.3**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / KeyPairUtils

# Class: KeyPairUtils

<<<<<<< HEAD
Defined in: [key-pair.ts:98](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/key-pair.ts#L98)
=======
Defined in: [key-pair.ts:98](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/key-pair.ts#L98)
>>>>>>> a27f4cb (cli@0.1.0)

Utility class for creating and working with KeyPair objects.
 KeyPairUtils

## Constructors

### Constructor

> **new KeyPairUtils**(): `KeyPairUtils`

#### Returns

`KeyPairUtils`

## Methods

### equals()

> `static` **equals**(`keyPair`, `keyPair1`): `boolean`

<<<<<<< HEAD
Defined in: [key-pair.ts:153](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/key-pair.ts#L153)
=======
Defined in: [key-pair.ts:153](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/key-pair.ts#L153)
>>>>>>> a27f4cb (cli@0.1.0)

Compares two KeyPair objects for equality.

#### Parameters

##### keyPair

[`KeyPair`](KeyPair.md)

The main keyPair.

##### keyPair1

[`KeyPair`](KeyPair.md)

The other keyPair.

#### Returns

`boolean`

True if the public key and private key hex are equal, false otherwise.

***

### fromPrivateKey()

> `static` **fromPrivateKey**(`data`): [`KeyPair`](KeyPair.md)

<<<<<<< HEAD
Defined in: [key-pair.ts:105](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/key-pair.ts#L105)
=======
Defined in: [key-pair.ts:105](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/key-pair.ts#L105)
>>>>>>> a27f4cb (cli@0.1.0)

Static method creates a new KeyPair from a PrivateKey object or private key bytes.

#### Parameters

##### data

The private key bytes

`Bytes` | [`PrivateKey`](PrivateKey.md)

#### Returns

[`KeyPair`](KeyPair.md)

A new KeyPair object

***

### fromSecret()

> `static` **fromSecret**(`secret`): [`KeyPair`](KeyPair.md)

<<<<<<< HEAD
Defined in: [key-pair.ts:131](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/key-pair.ts#L131)
=======
Defined in: [key-pair.ts:131](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/key-pair.ts#L131)
>>>>>>> a27f4cb (cli@0.1.0)

Static method creates a new KeyPair (PrivateKey/PublicKey) bigint secret.

#### Parameters

##### secret

`bigint`

The private key secret

#### Returns

[`KeyPair`](KeyPair.md)

A new KeyPair object

***

### generate()

> `static` **generate**(): [`KeyPair`](KeyPair.md)

<<<<<<< HEAD
Defined in: [key-pair.ts:171](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/key-pair.ts#L171)
=======
Defined in: [key-pair.ts:171](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/key-pair.ts#L171)
>>>>>>> a27f4cb (cli@0.1.0)

Static method to generate a new random PrivateKey / PublicKey KeyPair.

#### Returns

[`KeyPair`](KeyPair.md)

A new PrivateKey object.

***

### toHex()

> `static` **toHex**(`keyBytes`): `Hex`

<<<<<<< HEAD
Defined in: [key-pair.ts:143](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/key-pair.ts#L143)
=======
Defined in: [key-pair.ts:143](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/key-pair.ts#L143)
>>>>>>> a27f4cb (cli@0.1.0)

Converts key bytes to a hex string.

#### Parameters

##### keyBytes

`Bytes`

The key bytes (private or public).

#### Returns

`Hex`

The key bytes as a hex string.
