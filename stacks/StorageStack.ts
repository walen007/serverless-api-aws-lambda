import { StackContext, Bucket } from 'sst/constructs';

export function StorageStack({ stack }: StackContext): { bucket: Bucket } {
  const bucket = new Bucket(stack, 'uploads');
  return { bucket };
}
