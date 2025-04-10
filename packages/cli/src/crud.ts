
import { Btc1Error, Logger } from '@did-btc1/common';
import { DidBtc1 } from '@did-btc1/method';
import { ICommand } from './cli.js';

export default class CRUD implements ICommand {
  async execute({ options, action }: { options?: any; action?: string }): Promise<void> {
    try {
      switch (action) {
        case 'create':
          await DidBtc1.create(options);
          break;
        case 'read':
        case 'resolve':
          await DidBtc1.resolve(options);
          break;
        case 'update':
          await DidBtc1.update(options);
          break;
        case 'delete':
        case 'deactivate':
          // await DidBtc1.deactivate(options);
          Logger.warn('// TODO: Update once DidBtc1.deactivate implemented');
          break;
        default:
          throw new Btc1Error(`Invalid command: ${action}`, 'INVALID_COMMAND');
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }
}
