import { varint } from 'multiformats/basics';

export const ID_PLACEHOLDER_VALUE = 'did:btc1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
export const MULTIKEY_HEADER = 0x2561;
export const SECP256K1_XONLY_PUBLIC_KEY_PREFIX = varint.encodeTo(MULTIKEY_HEADER, new Uint8Array());
export const OP_RETURN = 0x6a;
export const OP_PUSH32 = 0x20;
export const VALID_HRP = ['k', 'x'];
export const MULTIBASE_URI_PREFIX = 'urn:mb:';

export const W3C_DID_V1 = 'https://www.w3.org/ns/did/v1';
export const W3C_DATA_INTEGRITY_V1 = 'https://w3id.org/security/data-integrity/v1';
export const W3C_DATA_INTEGRITY_V2 = 'https://w3id.org/security/data-integrity/v2';
export const BTC1_DID_DOCUMENT_V1 = 'https://jintekc.github.io/did-btc1-js/ns/did-document/v1';
export const W3C_ZCAP_V1 = 'https://w3id.org/zcap/v1';
export const W3C_JSONLD_PATCH_V1 = 'https://w3id.org/json-ld-patch/v1';
export const W3C_MULTIKEY_V1 = 'https://w3id.org/security/multikey/v1';
export const W3C_DID_RESOLUTION_V1 = 'https://w3id.org/did-resolution/v1';
export const CONTEXT_URL_MAP = {
  w3c : {
    did  : {
      v1 : W3C_DID_V1,
    },
    didresolution : {
      v1 : W3C_DID_RESOLUTION_V1,
    },
    dataintegrity   : {
      v1 : W3C_DATA_INTEGRITY_V1,
      v2 : W3C_DATA_INTEGRITY_V2,
    },
    zcap : {
      v1 : W3C_ZCAP_V1,
    },
    jsonldpatch : {
      v1 : W3C_JSONLD_PATCH_V1,
    },
    multikey : {
      v1 : W3C_MULTIKEY_V1,
    },
  },
  btc1 : {
    diddocument : {
      v1 : BTC1_DID_DOCUMENT_V1,
    },
  },

};

export const BTC1_DID_DOCUMENT_CONTEXT = [
  CONTEXT_URL_MAP.w3c.did.v1,
  CONTEXT_URL_MAP.w3c.dataintegrity.v2,
  CONTEXT_URL_MAP.btc1.diddocument.v1
];
export const BTC1_MULTIKEY_CONTEXT = [
  CONTEXT_URL_MAP.w3c.did.v1,
  CONTEXT_URL_MAP.w3c.multikey.v1
];
export const BTC1_DID_UPDATE_PAYLOAD_CONTEXT = [
  CONTEXT_URL_MAP.w3c.zcap.v1,
  CONTEXT_URL_MAP.w3c.dataintegrity.v2,
  CONTEXT_URL_MAP.w3c.jsonldpatch.v1, CONTEXT_URL_MAP.btc1.diddocument.v1
];