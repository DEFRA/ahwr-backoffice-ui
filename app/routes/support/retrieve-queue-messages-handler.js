import Joi from "joi";
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { config } from "../../config/index.js";

export const peekMessages = async (queueUrl, limit, logger) => {
  logger.info("Creating SQS client");
  const client = new SQSClient({ region: config.aws.region, endpoint: config.aws.endpointUrl });
  logger.info("Created SQS client");

  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: limit,
    VisibilityTimeout: 2,
    WaitTimeSeconds: 0,
    AttributeNames: ["All"],
    MessageAttributeNames: ["All"],
  });
  const res = await client.send(command);

  logger.info(`Retrieved ${res.Messages?.length || 0} messages`);

  return (res.Messages || []).map((msg) => ({
    id: msg.MessageId,
    body: msg.Body,
    attributes: msg.Attributes,
    messageAttributes: msg.MessageAttributes,
  }));
};

export const retrieveQueueMessages = {
  action: "retrieveQueueMessages",
  validation: {
    queueUrl: Joi.string().trim().required(),
    messageCount: Joi.number().integer().empty("").min(1).default(1),
    action: Joi.string().required(),
  },
  handler: async (request, h) => {
    const { queueUrl, messageCount } = request.payload;
    const logger = request.logger;

    let messagesDocument;
    try {
      const messages = await peekMessages(queueUrl, messageCount, logger);
      messagesDocument = JSON.stringify(messages);
    } catch (error) {
      logger.error({ error });
      messagesDocument = error.message;
    }

    return h.view("support", { messagesDocument, scrollTo: "messagesDocument" });
  },
  errorIdentifier: '"queueUrl"',
  errorHandler: (receivedError) => ({
    ...receivedError,
    message: "Queue url missing",
    href: "#queue-url",
  }),
};
