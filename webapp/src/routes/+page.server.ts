import prisma from "$lib/prisma";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const response = await prisma.message.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return { messages: response };
}) satisfies PageServerLoad;
