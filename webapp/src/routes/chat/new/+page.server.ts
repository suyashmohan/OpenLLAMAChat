import prisma from "$lib/prisma";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const conversations = await prisma.conversation.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { conversations };
}) satisfies PageServerLoad;

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const chat_input = data.get("chat_input");
    const conversation = await prisma.conversation.create({
      data: {
        label: chat_input?.toString() || "New Chat",
      },
    });
    await prisma.message.create({
      data: {
        role: "user",
        content: chat_input?.toString() || "New Chat",
        conversationId: conversation.id,
      },
    });

    throw redirect(303, `/chat/${conversation.id}`);
  },
};
