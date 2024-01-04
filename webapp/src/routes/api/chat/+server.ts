import { LangChainStream, type Message, StreamingTextResponse } from "ai";
import type { RequestHandler } from "./$types";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, HumanMessage } from "langchain/schema";

export const POST = (async ({ request }) => {
  const { messages }: { messages: Message[] } = await request.json();
  const { stream, handlers } = LangChainStream();

  const model = new ChatOllama({
    model: "mistral",
    numCtx: 2048,
    stop: ["<|endoftext|>", "User:", "Assistant:", "System:"],
  });

  model.call(
    messages.map((m) =>
      m.role == "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
    {},
    [handlers],
  ).catch(console.error);

  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
