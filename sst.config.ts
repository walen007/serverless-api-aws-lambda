import { SSTConfig } from 'sst';
import { ApiStack, QueueStack, StorageStack, DBStack } from './stacks';

const AWS_SERVERLESS_APP = process.env.AWS_SERVERLESS_APP || 'doinstruct';
const AWS_SERVERLESS_STAGE = process.env.AWS_SERVERLESS_STAGE || 'development';
const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';

export default {
  config() {
    return {
      stage: AWS_SERVERLESS_STAGE,
      name: AWS_SERVERLESS_APP,
      region: AWS_REGION,
    };
  },

  stacks(app) {
    app.stack(DBStack);
    app.stack(StorageStack);
    app.stack(QueueStack);
    app.stack(ApiStack);
  },
} satisfies SSTConfig;
