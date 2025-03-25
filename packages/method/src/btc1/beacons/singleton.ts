import { canonicalization } from '@did-btc1/cryptosuite';
import { base58btc } from 'multiformats/bases/base58';
import BitcoinRpc from '../../bitcoin/rpc-client.js';
import { RawTransactionV2, SignedRawTx } from '../../bitcoin/types.js';
import { SingletonBeaconError } from '../../utils/errors.js';
import { DidUpdatePayload } from '../crud/interface.js';
import { SingletonSidecar } from '../../types/crud.js';
import { Btc1VerificationMethod } from '../did-document.js';
import { Beacon } from './beacon.js';
import { BeaconService, BeaconSignal } from './interface.js';

/**
 * Implements {@link https://dcdpr.github.io/did-btc1/#singleton-beacon | 5.1 Singleton Beacon}.
 *
 * A Singleton Beacon enables a single entity to independently post a DID Update Payload in a Beacon Signal. Its is a
 * Beacon that can be used to publish a single DID Update Payload targeting a single DID document. The serviceEndpoint
 * for this Beacon Type is a Bitcoin address represented as a URI following the BIP21 scheme. It is recommended that
 * this Bitcoin address be under the sole control of the DID controller. How the Bitcoin address and the cryptographic
 * material that controls it are generated is left to the implementation.
 *
 * @export
 * @class SingletonBeacon
 * @type {SingletonBeacon}
 * @extends {Beacon}
 */
export class SingletonBeacon extends Beacon {
  constructor(params: BeaconService) {
    super({ ...params, type: 'SingletonBeacon' });
  }

  get service(): BeaconService {
    return {
      type            : this.type,
      id              : this.id,
      serviceEndpoint : this.serviceEndpoint
    };
  }

  public generateSignal(didUpdatePayload: string): BeaconSignal {
    throw new Error('Method not implemented.' + didUpdatePayload);
  }

  /**
   * TODO: Finish implementation per spec
   * Implements {@link https://dcdpr.github.io/did-btc1/#process-singleton-beacon-signal | 5.1.3 Process Singleton Beacon Signal}.
   *
   * The Process Singleton Beacon Signal algorithm is called by the Process Beacon Signals algorithm as part of the Read
   * operation. It takes a Bitcoin transaction representing a Beacon Signal and optional signalSidecarData containing
   * any sidecar data provided to the resolver for the Beacon Signal identified by the Bitcoin transaction identifier.
   * It returns the DID Update payload announced by the Beacon Signal or throws an error.
   *
   * @public
   * @param {RawTransactionV2} tx Bitcoin transaction representing a Beacon Signal.
   * @param {?SidecarDataSingleton} sidecarData Optional sidecar data for the Beacon Signal.
   * @returns {DidUpdatePayload} The DID Update payload announced by the Beacon Signal.
   * @throws {DidError} if the signalTx is invalid or the signalSidecarData is invalid.
   */
  public async processSignal(tx: RawTransactionV2, sidecarData?: SingletonSidecar): Promise<DidUpdatePayload | undefined> {
    // Get the first output of the transaction
    const txOut = tx.vout[0];
    console.log('txOut', txOut);

    // Check if the first output is an OP_RETURN script
    const [OP_RETURN, UPDATE_PAYLOAD_HASH] = txOut.scriptPubKey.asm.split(' ');
    if (!OP_RETURN || OP_RETURN !== 'OP_RETURN') {
      return undefined;
    };

    // const hashBytes = scriptAsm.slice('OP_RETURN '.length, scriptAsm.length);
    console.log('UPDATE_PAYLOAD_HASH', UPDATE_PAYLOAD_HASH);

    // Extract the 32 bytes after the OP_RETURN
    const signalsMetadataMap = new Map(Object.entries(sidecarData!.signalsMetadata));
    console.log('signalsMetadataMap', signalsMetadataMap);

    const didUpdatePayload = signalsMetadataMap.get(tx.txid)?.updatePayload;
    console.log('didUpdatePayload', didUpdatePayload);
    if(!didUpdatePayload) {
      throw new Error('InvalidSidecarData: Update payload not found in signal metadata.');
    }

    // Check if the hashBytes are in the sidecarData
    if (sidecarData) {
      const updateHashBytes = await canonicalization.process(didUpdatePayload);
      console.log('updateHashBytes', updateHashBytes);

      const updateHash = Buffer.from(updateHashBytes).toString('hex');
      console.log('updateHash', updateHash);

      if (updateHash !== UPDATE_PAYLOAD_HASH) {
        throw new Error('InvalidSidecarData: Update payload hash does not match transaction hash.');
      }
    } else {
      // TODO: Step 6
      // Else:
      //  Set didUpdatePayload to the result of passing hashBytes into the Fetch Content from Addressable Storage algorithm.
      //  If didUpdatePayload is null, MUST raise a latePublishingError. MAY identify Beacon Signal to resolver and request additional Sidecar data be provided.
    }

    return didUpdatePayload;
  }


  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#broadcast-did-update-attestation | 5.1.2 Broadcast Singleton Beacon Signal}.
   *
   * The Broadcast Singleton Beacon Signal algorithm is called by the Announce DID Update algorithm as part of the
   * Update operation, if the Beacon being used is of the type SingletonBeacon. It takes as input a Beacon service and a
   * secured didUpdatePayload. The algorithm constructs a Bitcoin transaction that spends from the Beacon address
   * identified in the service and contains a transaction output of the format [OP_RETURN, OP_PUSH32, <hashBytes>],
   * where hashBytes is the SHA256 hash of the canonical didUpdatePayload. The Bitcoin transaction is then signed and
   * broadcast to the Bitcoin network, thereby publicly announcing a DID update in a Beacon Signal. It returns a
   * signalMetadata object mapping the Bitcoin transaction identifier of the Beacon Signal to the necessary data needed
   * to verify the signal announces a specific DID Update Payload.
   *
   * @public
   * @static
   * @async
   *
   * @param {BeaconService} params.beaconService The beacon service to broadcast the did update attestation for.
   * @param {DidVerificationMethod} params.didUpdateInvocation The verificationMethod object to be used for signing.
   * @returns {SignedRawTx} Successful output of a bitcoin transaction.
   * @throws {SingletonBeaconError} if the bitcoin address is invalid or unfunded.
   */
  public async broadcastSignal(beaconService: BeaconService, didUpdateInvocation: Btc1VerificationMethod): Promise<SignedRawTx> {
    console.log('didUpdateInvocation', didUpdateInvocation);

    // Connect to the default bitcoind node
    const rpc = BitcoinRpc.connect();

    // Decode the beaconService serviceEndpoint
    const addressUri = beaconService.serviceEndpoint as string;

    // Decode the addressUri to a bitcoin address
    const bitcoinAddress = base58btc.decode(addressUri);

    // Validate the bitcoin address
    if (!bitcoinAddress) {
      throw new SingletonBeaconError(`Invalid bitcoin address: ${addressUri}`, 'BROADCAST_BEACON_ERROR');
    }

    // TODO: check if bitcoinAddress is funded; if not, fund it
    // Construct a raw transaction
    const hexstring = await rpc.createRawTransaction({
      inputs     : [{ txid: '', vout: 0 }],
      outputs    : { address: addressUri, data: '' },
      locktime   : 0,
      replacable : false
    });

    // Sign the raw transaction
    const signedRawTx = await rpc.signRawTransaction({ hexstring });

    // Broadcast the signed raw transaction
    await rpc.sendRawTransaction(signedRawTx.hex, true);

    // Return the signed raw transaction
    return signedRawTx;
  }
}