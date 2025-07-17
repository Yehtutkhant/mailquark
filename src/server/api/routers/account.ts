import z from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { authorizeAccountAccess } from "./thread";
import { FREE_CREDITS_PER_DAY } from "@/lib/constants";

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        id: true,
        name: true,
        emailAddress: true,
      },
    });
  }),

  getRemainingChatbotCredits: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const today = new Date().toDateString();

      const chatbotInteraction = await ctx.db.chatbotInteraction.findUnique({
        where: {
          day: today,
          userId: ctx.auth.userId,
        },
      });

      const remainingCredits =
        FREE_CREDITS_PER_DAY - (chatbotInteraction?.count || 0);
      return { remainingCredits };
    }),
});
