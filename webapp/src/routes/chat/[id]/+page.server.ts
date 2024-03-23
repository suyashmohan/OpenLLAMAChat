import prisma from "$lib/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const conversationId = params.id;

  if (conversationId) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
    });

    if (conversation === null) {
      redirect(302, "/chat/new");
    }
  }

  const messages = await prisma.message.findMany({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      conversationId,
    },
  });

  const conversations = await prisma.conversation.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return { messages, conversations, conversationId };
}) satisfies PageServerLoad;
