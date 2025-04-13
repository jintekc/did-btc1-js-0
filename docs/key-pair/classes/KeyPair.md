[**@did-btc1/key-pair v0.4.6**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / KeyPair

# Class: KeyPair

Defined in: [key-pair.ts:24](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L24)

Encapsulates a PublicKey and a PrivateKey object as a single KeyPair object.
 KeyPair

## Implements

- [`IKeyPair`](../interfaces/IKeyPair.md)

## Constructors

### Constructor

> **new KeyPair**(`privateKey`): `KeyPair`

Defined in: [key-pair.ts:37](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L37)

Creates an instance of KeyPair. Must provide a at least a private key.
Can optionally provide btoh a private and public key, but must be a valid pair.

#### Parameters

##### privateKey

`KeyPairParams` = `{}`

The private key object

#### Returns

`KeyPair`

## Accessors

### privateKey

#### Get Signature

> **get** **privateKey**(): [`PrivateKey`](PrivateKey.md)

Defined in: [key-pair.ts:78](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L78)

Set the PrivateKey.

##### See

IKeyPair.privateKey

##### Throws

If the private key is not available

##### Returns

[`PrivateKey`](PrivateKey.md)

The PrivateKey object

#### Throws

If the private key is not available.

#### Implementation of

[`IKeyPair`](../interfaces/IKeyPair.md).[`privateKey`](../interfaces/IKeyPair.md#privatekey)

***

### publicKey

#### Get Signature

> **get** **publicKey**(): [`PublicKey`](PublicKey.md)

Defined in: [key-pair.ts:67](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L67)

Get the PublicKey.

##### See

IKeyPair.publicKey

##### Returns

[`PublicKey`](PublicKey.md)

The PublicKey object

#### Set Signature

> **set** **publicKey**(`publicKey`): `void`

Defined in: [key-pair.ts:58](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L58)

Set the PublicKey.

##### See

IKeyPair.publicKey

##### Parameters

###### publicKey

[`PublicKey`](PublicKey.md)

The PublicKey object

##### Returns

`void`

#### Implementation of

[`IKeyPair`](../interfaces/IKeyPair.md).[`publicKey`](../interfaces/IKeyPair.md#publickey)

## Methods

### json()

> **json**(): `KeyPairJSON`

Defined in: [key-pair.ts:92](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L92)

JSON representation of a KeyPair.

#### Returns

`KeyPairJSON`

The KeyPair as a JSON object

#### See

IKeyPair.json

#### Implementation of

[`IKeyPair`](../interfaces/IKeyPair.md).[`json`](../interfaces/IKeyPair.md#json)
