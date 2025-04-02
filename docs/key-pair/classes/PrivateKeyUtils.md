[**@did-btc1/key-pair v0.4.3**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PrivateKeyUtils

# Class: PrivateKeyUtils

<<<<<<< HEAD
Defined in: [private-key.ts:187](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L187)
=======
Defined in: [private-key.ts:186](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L186)
>>>>>>> a27f4cb (cli@0.1.0)

Utility class for creating and working with PrivateKey objects.
 PrivateKeyUtils

## Constructors

### Constructor

> **new PrivateKeyUtils**(): `PrivateKeyUtils`

#### Returns

`PrivateKeyUtils`

## Methods

### computePublicKey()

> `static` **computePublicKey**(`privateKeyBytes`): `Bytes`

<<<<<<< HEAD
Defined in: [private-key.ts:270](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L270)
=======
Defined in: [private-key.ts:254](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L254)
>>>>>>> a27f4cb (cli@0.1.0)

Computes the public key bytes from a private key bytes.

#### Parameters

##### privateKeyBytes

`Bytes`

The private key bytes

#### Returns

`Bytes`

The public key bytes

#### Throws

If the public key is not compressed or not derived

***

### fromSecret()

> `static` **fromSecret**(`secret`): [`PrivateKey`](PrivateKey.md)

<<<<<<< HEAD
Defined in: [private-key.ts:254](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L254)
=======
Defined in: [private-key.ts:238](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L238)
>>>>>>> a27f4cb (cli@0.1.0)

Create a new PrivateKey object from a bigint secret.

#### Parameters

##### secret

`bigint`

The secret bigint

#### Returns

[`PrivateKey`](PrivateKey.md)

A new PrivateKey object

***

### isValid()

> `static` **isValid**(`bytes`): `boolean`

<<<<<<< HEAD
Defined in: [private-key.ts:244](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L244)
=======
Defined in: [private-key.ts:228](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L228)
>>>>>>> a27f4cb (cli@0.1.0)

Checks if the private key is valid.

#### Parameters

##### bytes

`Bytes`

The private key bytes

#### Returns

`boolean`

True if the private key is valid, false otherwise

***

### randomBytes()

> `static` **randomBytes**(): `Bytes`

<<<<<<< HEAD
Defined in: [private-key.ts:298](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L298)
=======
Defined in: [private-key.ts:282](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L282)
>>>>>>> a27f4cb (cli@0.1.0)

Static method to generate random private key bytes.

#### Returns

`Bytes`

Uint8Array of 32 random bytes.

***

### toBytes()

> `static` **toBytes**(`secret`): `Bytes`

<<<<<<< HEAD
Defined in: [private-key.ts:221](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L221)
=======
Defined in: [private-key.ts:205](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L205)
>>>>>>> a27f4cb (cli@0.1.0)

Convert a private key bytes to a bigint secret.

#### Parameters

##### secret

`bigint`

The private key secret.

#### Returns

`Bytes`

The private key secret as private key bytes.

***

### toKeyPair()

> `static` **toKeyPair**(`bytes`): [`KeyPair`](KeyPair.md)

Defined in: [private-key.ts:194](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L194)

Convert a PrivateKey or PrivateKeyBytes to a KeyPair.

#### Parameters

##### bytes

`Bytes`

#### Returns

[`KeyPair`](KeyPair.md)

The KeyPair object containing the public and private keys

#### Throws

If the private key is not valid

***

### toSecret()

> `static` **toSecret**(`bytes`): `bigint`

<<<<<<< HEAD
Defined in: [private-key.ts:211](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/private-key.ts#L211)
=======
Defined in: [private-key.ts:195](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/private-key.ts#L195)
>>>>>>> a27f4cb (cli@0.1.0)

Convert a bigint secret to private key bytes.

#### Parameters

##### bytes

`Bytes`

The private key bytes

#### Returns

`bigint`

The private key bytes as a bigint secret
