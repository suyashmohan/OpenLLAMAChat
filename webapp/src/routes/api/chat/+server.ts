import { LangChainStream, type Message, StreamingTextResponse } from "ai";
import type { RequestHandler } from "./$types";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, BaseMessage, HumanMessage } from "langchain/schema";
import prisma from "$lib/prisma";

export const POST = (async ({ request }) => {
  const reqJson = await request.json();
  const { messages }: { messages: Message[] } = reqJson;
  const lastMessage = messages.at(-1);
  const conversationId = reqJson.conversationId;
  const { stream, handlers } = LangChainStream();

  if (lastMessage?.role === "user" && messages.length > 1) {
    await prisma.message.create({
      data: {
        role: lastMessage.role,
        content: lastMessage.content.toString(),
        conversationId,
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
          conversationId,
        },
      });
    }
  });

  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
