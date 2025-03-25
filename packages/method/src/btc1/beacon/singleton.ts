import { canonicalization } from '@did-btc1/cryptosuite';
import { RawTransactionV2 } from '../../bitcoin/types.js';
import { DidUpdatePayload } from '../crud/interface.js';
import { SingletonSidecar } from '../crud/types.js';
import { Beacon } from './index.js';
import { BeaconService, BeaconSignal } from './interface.js';
import { BeaconParams } from './types.js';

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
  constructor(params: BeaconParams) {
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
}