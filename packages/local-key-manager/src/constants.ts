import { varint } from 'multiformats/basics';

export const MULTIKEY_HEADER = 0x2561;
export const SECP256K1_XONLY_PUBLIC_KEY_PREFIX = varint.encodeTo(MULTIKEY_HEADER, new Uint8Array());