[**@did-btc1/key-pair v0.4.6**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PublicKey

# Class: PublicKey

Defined in: [public-key.ts:26](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L26)

Encapsulates a secp256k1 public key.
Provides get methods for different formats (compressed, x-only, multibase).
Provides helpers methods for comparison and serialization.
 PublicKey

## Implements

- [`IPublicKey`](../interfaces/IPublicKey.md)

## Constructors

### Constructor

> **new PublicKey**(`bytes`): `PublicKey`

Defined in: [public-key.ts:36](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L36)

Creates an instance of PublicKey.

#### Parameters

##### bytes

`Bytes`

The public key byte array.

#### Returns

`PublicKey`

#### Throws

if the byte length is not 32 (x-only) or 33 (compressed)

## Accessors

### bytes

#### Get Signature

> **get** **bytes**(): `Uint8Array`

Defined in: [public-key.ts:53](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L53)

Get the public key bytes.
See [IPublicKey Method bytes](../interfaces/IPublicKey.md#bytes) for more details.

##### Returns

`Uint8Array`

The public key bytes

Compressed public key getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`bytes`](../interfaces/IPublicKey.md#bytes)

***

### hex

#### Get Signature

> **get** **hex**(): `Hex`

Defined in: [public-key.ts:123](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L123)

Returns the raw public key as a hex string.
See [IPublicKey Method hex](../interfaces/IPublicKey.md#hex) for more details.

##### Returns

`Hex`

The public key as a hex string.

Public key hex string getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`hex`](../interfaces/IPublicKey.md#hex)

***

### multibase

#### Get Signature

> **get** **multibase**(): `string`

Defined in: [public-key.ts:103](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L103)

Get the multibase public key.
See [IPublicKey Method multibase](../interfaces/IPublicKey.md#multibase) for more details.

##### Returns

`string`

The public key in base58btc x-only multibase format.

Public key multibase getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`multibase`](../interfaces/IPublicKey.md#multibase)

***

### parity

#### Get Signature

> **get** **parity**(): `number`

Defined in: [public-key.ts:73](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L73)

Get the parity byte of the public key.
See [IPublicKey Method parity](../interfaces/IPublicKey.md#parity) for more details.

##### Returns

`number`

The parity byte of the public key.

Public key parity getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`parity`](../interfaces/IPublicKey.md#parity)

***

### prefix

#### Get Signature

> **get** **prefix**(): `Bytes`

Defined in: [public-key.ts:113](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L113)

Get the public key prefix bytes.
See [IPublicKey Method prefix](../interfaces/IPublicKey.md#prefix) for more details.

##### Returns

`Bytes`

The 2-byte prefix of the public key.

Public key multibase prefix getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`prefix`](../interfaces/IPublicKey.md#prefix)

***

### uncompressed

#### Get Signature

> **get** **uncompressed**(): `Bytes`

Defined in: [public-key.ts:63](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L63)

Get the uncompressed public key.
See [IPublicKey Method uncompressed](../interfaces/IPublicKey.md#uncompressed) for more details.

##### Returns

`Bytes`

The 65-byte uncompressed public key (0x04, x, y).

Uncompressed public key getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`uncompressed`](../interfaces/IPublicKey.md#uncompressed)

***

### x

#### Get Signature

> **get** **x**(): `Bytes`

Defined in: [public-key.ts:83](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L83)

Get the x-coordinate of the public key.
See [IPublicKey Method x](../interfaces/IPublicKey.md#x) for more details.

##### Returns

`Bytes`

The 32-byte x-coordinate of the public key.

Public key x-coordinate getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`x`](../interfaces/IPublicKey.md#x)

***

### y

#### Get Signature

> **get** **y**(): `Bytes`

Defined in: [public-key.ts:93](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L93)

Get the y-coordinate of the public key.
See [IPublicKey Method y](../interfaces/IPublicKey.md#y) for more details.

##### Returns

`Bytes`

The 32-byte y-coordinate of the public key.

Public key y-coordinate getter.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`y`](../interfaces/IPublicKey.md#y)

## Methods

### decode()

> **decode**(): `Bytes`

Defined in: [public-key.ts:133](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L133)

Decodes the multibase string to the 34-byte corresponding public key (2 byte prefix + 32 byte public key).
See [IPublicKey Method](../interfaces/IPublicKey.md#decode) for more details.

#### Returns

`Bytes`

The decoded public key: prefix and public key bytes

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`decode`](../interfaces/IPublicKey.md#decode)

***

### encode()

> **encode**(): `string`

Defined in: [public-key.ts:161](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L161)

Encodes compressed secp256k1 public key from bytes to BIP340 base58btc multibase format
See [IPublicKey Method](../interfaces/IPublicKey.md#encode) for more details.

#### Returns

`string`

The public key encoded in base-58-btc multibase format

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`encode`](../interfaces/IPublicKey.md#encode)

***

### equals()

> **equals**(`other`): `boolean`

Defined in: [public-key.ts:189](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L189)

Compares this public key to another public key.
See [IPublicKey Method equals](../interfaces/IPublicKey.md#equals) for more details.

#### Parameters

##### other

`PublicKey`

The other public key to compare

#### Returns

`boolean`

True if the public keys are equal, false otherwise.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`equals`](../interfaces/IPublicKey.md#equals)

***

### json()

> **json**(): `PublicKeyJSON`

Defined in: [public-key.ts:198](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L198)

Public key JSON representation.
See [IPublicKey.json](../interfaces/IPublicKey.md#json) for more details.

#### Returns

`PublicKeyJSON`

The public key as a JSON object.

#### Implementation of

[`IPublicKey`](../interfaces/IPublicKey.md).[`json`](../interfaces/IPublicKey.md#json)
