import BitcoinRpc from '../../src/bitcoin/rpc-client.js';
import { BlockV3, DEFAULT_RPC_CLIENT_CONFIG } from '../../src/index.js';

const targetTime = 1739565192; // block 1160
const rpc = BitcoinRpc.connect(DEFAULT_RPC_CLIENT_CONFIG);

async function getBlockSafe(height: number) {
  const block = await rpc.getBlock({ height }) as BlockV3;
  if(!block) {
    throw new Error('No block found at height ' + height);
  }
  return block;
}

async function targetTimeBlockHeight(targetTime: number) {
  let height = await rpc.getBlockCount();
  let block = await getBlockSafe(height) as BlockV3;

  do {
    block = await getBlockSafe(--height);
  } while (block.time > targetTime);

  return block;
}

const targetTimeBlock = await targetTimeBlockHeight(targetTime);
console.log(`Found first block with time < targetTime of ${targetTime}`);
console.log(`Block #${targetTimeBlock.height}`);
console.log(`Block hash: ${targetTimeBlock.hash}`);
console.log('Block', targetTimeBlock);