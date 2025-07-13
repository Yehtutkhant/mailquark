import { db } from "@/server/db";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { threadId } from "worker_threads";

export const threadRouter = createTRPCRouter({
  getThreadsCount: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "draft", "sent"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const filters: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filters.inboxStatus = true;
      } else if (input.tab === "draft") {
        filters.draftStatus = true;
      } else if (input.tab === "sent") {
        filters.sentStatus = true;
      }
      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          ...filters,
        },
      });
    }),
  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "draft", "sent"]),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const filters: Prisma.ThreadWhereInput = {};
      if (input.tab === "inbox") {
        filters.inboxStatus = true;
      } else if (input.tab === "draft") {
        filters.draftStatus = true;
      } else if (input.tab === "sent") {
        filters.sentStatus = true;
      }
      filters.done = {
        equals: input.done,
      };
      return await ctx.db.thread.findMany({
        where: {
          accountId: account.id,
          ...filters,
        },
        include: {
          emails: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              body: true,
              bodySnippet: true,
              emailLabel: true,
              sysLabels: true,
              subject: true,
              id: true,
              sentAt: true,
            },
          },
        },
        take: 50,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
    }),

  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input.threadId,
        },
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });
      if (!thread || thread.emails.length < 1)
        throw new Error("Thread not found");
      const lastExternalEmail = thread.emails
        .reverse()
        .find((email) => email.from.address !== account.emailAddress);
      if (!lastExternalEmail) throw new Error("No external email found");
      return {
        id: lastExternalEmail.internetMessageId,
        subject: lastExternalEmail.subject,
        from: { name: account.name, email: account.emailAddress },
        to: [
          lastExternalEmail.from,
          ...lastExternalEmail.to.filter(
            (to) => to.address !== account.emailAddress,
          ),
        ],
        cc: lastExternalEmail.cc.filter(
          (cc) => cc.address !== account.emailAddress,
        ),
        sentAt: lastExternalEmail.sentAt,
      };
    }),
});

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      name: true,
      emailAddress: true,
      accessToken: true,
    },
  });
  if (!account) throw new Error("Account not found");
  return account;
};
