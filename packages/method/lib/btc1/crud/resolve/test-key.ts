import { /*Btc1Identifier, Btc1Read,*/ DidBtc1, DidResolutionOptions } from '../../../../src/index.js';
import resolutionOptions from '../../../in/k1qgps/resolutionOptions.json' with { type: 'json' };
const options =  resolutionOptions as DidResolutionOptions;
options.versionTime = 1745944297;

const identifier = 'did:btc1:k1qgpzs6takyvuhv3dy8epaqhwee6eamxttprpn4k48ft4xyvw5sp3mvqqavunt';
// const components = Btc1Identifier.decode(identifier);
// console.log('components:', components);

// const initialDocument = await Btc1Read.initialDocument({ identifier, components, options });
// console.log('initialDocument:', initialDocument);

// const targetDocument = await Btc1Read.targetDocument({ initialDocument, options });
// console.log('targetDocument:', targetDocument);

const resolution = await DidBtc1.resolve(identifier, options);
console.log('resolution:', resolution);