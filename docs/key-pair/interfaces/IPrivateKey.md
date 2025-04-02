[**@did-btc1/key-pair v0.4.3**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / IPrivateKey

# Interface: IPrivateKey

<<<<<<< HEAD
Defined in: [interface.ts:20](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L20)
=======
Defined in: [interface.ts:20](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L20)
>>>>>>> a27f4cb (cli@0.1.0)

Interface for the PrivateKey class.
 IPrivateKey

## Properties

### bytes

> `readonly` **bytes**: `Bytes`

<<<<<<< HEAD
Defined in: [interface.ts:25](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L25)
=======
Defined in: [interface.ts:25](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L25)
>>>>>>> a27f4cb (cli@0.1.0)

Get the private key bytes.

***

### hex

> `readonly` **hex**: `Hex`

<<<<<<< HEAD
Defined in: [interface.ts:44](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L44)
=======
Defined in: [interface.ts:44](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L44)
>>>>>>> a27f4cb (cli@0.1.0)

Get the private key as a hex string.

***

### point

> `readonly` **point**: `bigint`

<<<<<<< HEAD
Defined in: [interface.ts:38](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L38)
=======
Defined in: [interface.ts:38](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L38)
>>>>>>> a27f4cb (cli@0.1.0)

Get the private key point.

***

### secret

> **secret**: `bigint`

<<<<<<< HEAD
Defined in: [interface.ts:32](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L32)
=======
Defined in: [interface.ts:32](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L32)
>>>>>>> a27f4cb (cli@0.1.0)

Getter returns the private key bytes in secret form.
Setter allows alternative method of using a bigint secret to genereate the private key bytes.

## Methods

### computePublicKey()

> **computePublicKey**(): [`PublicKey`](../classes/PublicKey.md)

<<<<<<< HEAD
Defined in: [interface.ts:59](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L59)
=======
Defined in: [interface.ts:59](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L59)
>>>>>>> a27f4cb (cli@0.1.0)

Uses the private key to compute the corresponding public key.

#### Returns

[`PublicKey`](../classes/PublicKey.md)

A new PublicKey object.

#### See

PrivateKeyUtils.computePublicKey

***

### equals()

> **equals**(`other`): `boolean`

<<<<<<< HEAD
Defined in: [interface.ts:51](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L51)
=======
Defined in: [interface.ts:51](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L51)
>>>>>>> a27f4cb (cli@0.1.0)

Checks if this private key is equal to another private key.

#### Parameters

##### other

[`PrivateKey`](../classes/PrivateKey.md)

#### Returns

`boolean`

True if the private keys are equal.

***

### isValid()

> **isValid**(): `boolean`

<<<<<<< HEAD
Defined in: [interface.ts:66](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L66)
=======
Defined in: [interface.ts:66](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L66)
>>>>>>> a27f4cb (cli@0.1.0)

Checks if the private key is valid.

#### Returns

`boolean`

Whether the private key is valid.

***

### json()

> **json**(): `PrivateKeyJSON`

<<<<<<< HEAD
Defined in: [interface.ts:73](https://github.com/jintekc/did-btc1-js/blob/4e83e31069f73b9a38a52892558302bd20237e8b/packages/key-pair/src/interface.ts#L73)
=======
Defined in: [interface.ts:73](https://github.com/jintekc/did-btc1-js/blob/c20c1728a05708ad9c42efd6a120ce1032864286/packages/key-pair/src/interface.ts#L73)
>>>>>>> a27f4cb (cli@0.1.0)

JSON representation of a PrivateKey object.

#### Returns

`PrivateKeyJSON`

The PrivateKey as a JSON object.
