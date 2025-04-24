import { BitcoinRpcError, Btc1Error } from '@did-btc1/common';
import { BlockResponse, BlockV0, BlockV1, BlockV2, BlockV3, GetBlockParams, RawTransactionResponse, RawTransactionV0, RawTransactionV1, RawTransactionV2, VerbosityLevel } from '../types/bitcoin.js';

export interface RestClientConfigParams {
  host: string;
  port: number;
  headers?: { [key: string]: string };
}

export class RestClientConfig {
  host: string;
  port: number;
  headers?: { [key: string]: string };
  constructor({ host, port, headers }: RestClientConfigParams) {
    this.host = host;
    this.port = port;
    this.headers = headers;
  }
}

export interface ApiCallParams {
  path: string;
  url?: string;
  method?: string;
  body?: any
};

/**
 * Implements a strongly-typed BitcoinRestClient to connect to remote bitcoin node via REST API.
 * @class BitcoinRest
 * @type {BitcoinRest}
 */
export default class BitcoinRestClient {
  /**
   * The encapsulated {@link RestClientConfig} object.
   * @private
   */
  private _config: {
    host: string;
    port: number;
    headers?: { [key: string]: string };
  };

  constructor(config: RestClientConfig){
    this._config = config;
  }

  public async apiCall({ path, url, method, body }: ApiCallParams): Promise<any> {
    // Construct the URL if not provided
    url ??= `http://${this._config.host}:${this._config.port}/${path}`;

    // Set the method to GET if not provided
    method ??= 'GET';

    // Construct the request options
    const requestInit = {
      method,
      headers : {
        'Content-Type' : 'application/json',
        ...this._config.headers,
      },
    } as any;

    // If the method is POST or PUT, add the body to the request
    if(body) {
      requestInit.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(url, requestInit);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Btc1Error(
        `Request failed: ${response.status} - ${response.statusText}`,
        'FAILED_HTTP_REQUEST',
        response
      );
    }

    // Parse the response as JSON and return it
    return await response.json();
  }

  /**
   * Get the configuration object.
   * @private
   */
  get config() {
    return this._config;
  }

  /**
   * Returns the block data associated with a `blockhash` of a valid block.
   * @param {GetBlockParams} params See {@link GetBlockParams} for details.
   * @param {?string} params.blockhash The blockhash of the block to query.
   * @param {?number} params.height The block height of the block to query.
   * @param {?VerbosityLevel} params.verbosity The verbosity level. See {@link VerbosityLevel}.
   * @returns {BlockResponse} A promise resolving to a {@link BlockResponse} formatted depending on `verbosity` level.
   * @throws {BitcoinRpcError} If neither `blockhash` nor `height` is provided.
   */
  public async getBlock({ blockhash, height, verbosity }: GetBlockParams): Promise<BlockResponse | undefined> {
    // Check if blockhash or height is provided, if neither throw an error
    if(!blockhash && height === undefined) {
      throw new BitcoinRpcError('blockhash or height required', 'INVALID_PARAMS_GET_BLOCK', { blockhash, height });
    }

    // If height is provided, get the blockhash
    blockhash ??= await this.getBlockHash(height!);
    if(!blockhash || typeof blockhash !== 'string') {
      return undefined;
    }
    // Get the block data
    const block = await this.apiCall({ path: 'getblock', body: {blockhash, verbosity: verbosity ?? 3} });

    // Return the block data depending on verbosity level
    switch(verbosity) {
      case 0:
        return block as BlockV0;
      case 1:
        return block as BlockV1;
      case 2:
        return block as BlockV2;
      case 3:
        return block as BlockV3;
      default:
        return block as BlockV3;
    }
  }

  /**
   * Returns the blockhash of the block at the given height in the active chain.
   */
  public async getBlockHash(height: number): Promise<string> {
    return await this.apiCall({ path: 'getblockhash',  body: {height} });
  }

  /**
   * Get detailed information about a transaction.
   *
   * By default, this call only returns a transaction if it is in the mempool. If -txindex is enabled
   * and no blockhash argument is passed, it will return the transaction if it is in the mempool or any block.
   * If a blockhash argument is passed, it will return the transaction if the specified block is available and
   * the transaction is in that block.
   * @async
   * @param {string} txid The transaction id (required).
   * @param {?VerbosityLevel} verbosity Response format: 0 (hex), 1 (json) or 2 (jsonext).
   * @param {?string} blockhash The block in which to look for the transaction (optional).
   * @returns {GetRawTransaction} A promise resolving to data about a transaction in the form specified by verbosity.
   */
  public async getRawTransaction(txid: string, verbosity?: VerbosityLevel, blockhash?: string): Promise<RawTransactionResponse> {
    // Get the raw transaction
    const rawTransaction = await this.apiCall({
      path   : 'getrawtransaction',
      method : 'POST',
      body   : { txid, verbosity, blockhash }
    });
    // Return the raw transaction based on verbosity
    switch(verbosity) {
      case 0:
        return rawTransaction as RawTransactionV0;
      case 1:
        return rawTransaction as RawTransactionV1;
      case 2:
        return rawTransaction as RawTransactionV2;
      default:
        return rawTransaction as RawTransactionV2;
    }
  }
}