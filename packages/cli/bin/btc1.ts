#!/usr/bin/env node
import { DidBtc1CLI } from '../src/cli.js';

// 1. Instantiate your CLI class
const cli = new DidBtc1CLI();

// 2. Parse the real CLI arguments
cli.run();

// 3. Optionally force exit
process.exit(0);
