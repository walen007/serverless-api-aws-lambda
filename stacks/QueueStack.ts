import { StackContext, Queue, use, Bucket, RDS } from 'sst/constructs';
import { StorageStack, DBStack } from '../stacks';

type QueueStackReturn = { queue: Queue; bucket: Bucket; postgres: RDS };

export function QueueStack({ stack }: StackContext): QueueStackReturn {
  const { bucket } = use(StorageStack);
  const { postgres } = use(DBStack);

  const queue = new Queue(stack, 'Queue', {
    consumer: {
      function: {
        handler: 'packages/functions/src/consumer.main',
        bind: [postgres, bucket],
      },
    },
  });

  return {
    queue,
    bucket,
    postgres,
  };
}
