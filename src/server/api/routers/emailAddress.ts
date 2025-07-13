import z from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { authorizeAccountAccess } from "./thread";

export const emailAddressRouter = createTRPCRouter({
  getAddressesByAccount: privateProcedure
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

      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: account.id,
        },
        select: {
          id: true,
          name: true,
          address: true,
        },
      });
    }),
});
