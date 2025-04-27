import { DEFAULT_RPC_CLIENT_CONFIG } from '../../src/bitcoin/constants.js';
import BitcoinRpc from '../../src/bitcoin/rpc-client.js';
import { BlockV3 } from '../../src/index.js';

const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);
let height = 0;
while(height < 499) {
    const block = await rpc.getBlock({ height }) as BlockV3;
    console.log(`block #${height}`, block);
    height++;
}