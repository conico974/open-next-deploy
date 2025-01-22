import { AwsClient } from "aws4fetch";

import { Queue } from "@opennextjs/aws/types/overrides.js";

let awsClient: AwsClient | null = null;

const awsFetch = (body: string) => {
  const REVALIDATION_QUEUE_REGION = process.env.REVALIDATION_QUEUE_REGION;
  if (!awsClient) {
    awsClient = new AwsClient({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });
  }
  return awsClient.fetch(
    `https://sqs.${REVALIDATION_QUEUE_REGION ?? "us-east-1"}.amazonaws.com`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.0",
        "X-Amz-Target": "AmazonSQS.SendMessage",
      },
      body,
    },
  );
};
const queue: Queue = {
  send: async ({ MessageBody, MessageDeduplicationId, MessageGroupId }) => {
    try {
      const REVALIDATION_QUEUE_URL = process.env.REVALIDATION_QUEUE_URL;
      const result = await awsFetch(
        JSON.stringify({
          QueueUrl: REVALIDATION_QUEUE_URL,
          MessageBody: JSON.stringify(MessageBody),
          MessageDeduplicationId,
          MessageGroupId,
        }),
      );
    } catch (e) {
      console.error(e);
    }
  },
  name: "sqs",
};

export default queue;
