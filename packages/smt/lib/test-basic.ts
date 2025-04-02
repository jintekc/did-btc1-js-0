import { newBranch } from '../src/branch.js';
import { LeafNode } from '../src/leaf.js';

// Example usage
const leaf1 = new LeafNode(new TextEncoder().encode('Hello'), 42n);
const leaf2 = new LeafNode(new TextEncoder().encode('World'), 100n);

const branch = newBranch(leaf1, leaf2);
console.log('Branch hash:', Buffer.from(branch.nodeHash()).toString('hex'));
console.log('Branch sum:', branch.nodeSum());
