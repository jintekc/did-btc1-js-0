import BitcoinRpc from '../src/bitcoin/rpc-client.js';
import { BlockV3, DEFAULT_RPC_CLIENT_CONFIG } from '../src/index.js';

const time = 1296688602; // block 171`
const targetTime = new Date(time).toUnixTimestamp();
const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);

(async () => {
  const start = performance.now(); // Use high-res timer
  let height = await rpc.getBlockCount();
  let block = await rpc.getBlock({ height }) as BlockV3;

  let iterations = 0;

  while (block.time > targetTime) {
    block = await rpc.getBlock({ height: --block.height }) as BlockV3;
    iterations++;
  }
  const end = performance.now();
  console.log(`Block found: ${block.height}`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Elapsed time: ${(end - start).toFixed(2)} ms`);
})();