import prisma from "$lib/prisma";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const conversationId = parseInt(params.id);
  let messages;
  if (conversationId) {
    messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        conversationId,
      },
    });
  }

  const conversations = await prisma.conversation.findMany();

  return { messages, conversations, conversationId };
}) satisfies PageServerLoad;
