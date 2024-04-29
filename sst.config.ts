import { SSTConfig } from 'sst';
import { DoinstructApiStack } from './stacks/DoinstructApiStack';

export default {
  config() {
    return {
      stage: 'dev',
      name: 'doinstruct',
      region: 'eu-central-1',
    };
  },
  stacks(app) {
    app.stack(DoinstructApiStack);
  },
} satisfies SSTConfig;
