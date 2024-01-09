import { LangChainStream, type Message, StreamingTextResponse } from "ai";
import type { RequestHandler } from "./$types";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema";
import prisma from "$lib/prisma";

export const POST = (async ({ request }) => {
  const { messages }: { messages: Message[] } = await request.json();
  const { stream, handlers } = LangChainStream();

  const lastMessage = messages.at(-1);
  if (lastMessage?.role === "user") {
    await prisma.message.create({
      data: {
        role: lastMessage.role,
        content: lastMessage.content.toString(),
      },
    });
  }

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
  ).catch(console.error).then(async (msg: void | BaseMessage) => {
    if (msg) {
      await prisma.message.create({
        data: {
          role: "assistant",
          content: msg.content.toString(),
        },
      });
    }
  });

  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
