import { Btc1Appendix, Btc1Read, DidResolutionOptions } from '../../../../src/index.js';
import initialDidDocument from './initialDidDocument.json' with { type: 'json' };
import resolutionOptions from './resolutionOptions.json' with { type: 'json' };

const options =  resolutionOptions as DidResolutionOptions;

const identifier = initialDidDocument.id;
const components = Btc1Appendix.parse(identifier);
console.log('components:', components);

const initialDocument = await Btc1Read.initialDocument({ identifier, components, options });
console.log('initialDocument:', initialDocument);

const targetDocument = await Btc1Read.targetDocument({ initialDocument, options });
console.log('targetDocument:', targetDocument);