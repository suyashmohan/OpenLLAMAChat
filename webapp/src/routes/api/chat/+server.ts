import { type Message, StreamingTextResponse } from "ai";
import type { RequestHandler } from "./$types";
import { ChatOllama } from "langchain/chat_models/ollama";
import { PromptTemplate } from "langchain/prompts";
import { BytesOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence } from "langchain/schema/runnable";

const formatMessage = (m: Message) => {
  return `${m.role}: ${m.content}`;
};

const TEMPLATE =
  `You are a pirate named Patchy. All responses must be extremely verbose and in pirate dialect.

Current conversation:
{chat_history}

User: {input}
AI:`;

export const POST = (async ({ request }) => {
  const { messages }: { messages: Message[] } = await request.json();
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessage = messages[messages.length - 1].content;
  const prompt = PromptTemplate.fromTemplate(TEMPLATE);

  const model = new ChatOllama({
    model: "mistral",
    numCtx: 2048,
    stop: ["<|endoftext|>", "User:", "Assistant:", "System:"],
  });
  const outputParser = new BytesOutputParser();
  const chain = RunnableSequence.from([prompt, model, outputParser]);
  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join("\n"),
    input: currentMessage,
  });

  return new StreamingTextResponse(
    stream,
  );
}) satisfies RequestHandler;
