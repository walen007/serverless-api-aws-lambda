import AWS from 'aws-sdk';

const sqs = new AWS.SQS();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveQueueMessage(queueUrl: string, messageBody: string): Promise<any> {
  return await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    })
    .promise();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteQueueMessage(queueUrl: string): Promise<any> {
  return await sqs.deleteQueue({ QueueUrl: queueUrl }).promise();
}
