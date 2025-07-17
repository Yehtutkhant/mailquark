import { db } from "@/server/db";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

import { emailAddressSchema } from "@/lib/types";
import { Account } from "@/app/actions/account";
import type { Prisma } from "@prisma/client";
import { OramaClient } from "@/app/actions/orama";

export const threadRouter = createTRPCRouter({
  getThreadsCount: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "trash", "sent"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      let emailCondition: Prisma.EmailWhereInput;
      if (input.tab === "inbox") {
        emailCondition = {
          NOT: [
            { sysLabels: { has: "sent" } },
            { sysLabels: { has: "draft" } },
            { sysLabels: { has: "trash" } },
          ],
        };
      } else if (input.tab === "trash") {
        emailCondition = { sysLabels: { has: "trash" } };
      } else if (input.tab === "sent") {
        emailCondition = { sysLabels: { has: "sent" } };
      } else {
        emailCondition = {};
      }
      return await ctx.db.thread.count({
        where: {
          accountId: account.id,
          emails: { some: emailCondition },
        },
      });
    }),
  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.enum(["inbox", "trash", "sent"]),
        done: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const acc = new Account(account.accessToken);
      acc.syncUpdatedEmails().catch(console.error);

      let emailCondition: Prisma.EmailWhereInput;
      if (input.tab === "inbox") {
        if (input.done) {
          emailCondition = {
            NOT: [
              { sysLabels: { has: "unread" } },
              { sysLabels: { has: "sent" } },
              { sysLabels: { has: "draft" } },
              { sysLabels: { has: "trash" } },
            ],
          };
        } else {
          emailCondition = {
            sysLabels: { has: "unread" },
            NOT: [
              { sysLabels: { has: "sent" } },
              { sysLabels: { has: "trash" } },
              { sysLabels: { has: "draft" } },
            ],
          };
        }
      } else if (input.tab === "trash") {
        emailCondition = { sysLabels: { has: "trash" } };
      } else if (input.tab === "sent") {
        emailCondition = { sysLabels: { has: "sent" } };
      } else {
        emailCondition = {};
      }

      return await ctx.db.thread.findMany({
        where: {
          accountId: account.id,

          emails: { some: emailCondition },
        },
        include: {
          emails: {
            where: emailCondition,
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
        from: { name: account.name, address: account.emailAddress },
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

  sendEmail: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        subject: z.string(),
        body: z.string(),
        from: emailAddressSchema,
        to: z.array(emailAddressSchema),
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        replyTo: emailAddressSchema,
        inReplyTo: z.string().optional(),
        threadId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.accessToken);
      return await acc.sendEmail({
        from: input.from,
        subject: input.subject,
        body: input.body,
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        replyTo: input.replyTo,
        inReplyTo: input.inReplyTo,
        threadId: input.threadId,
      });
    }),

  markAsRead: privateProcedure
    .input(
      z.object({
        messageId: z.string().optional(),
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.messageId) throw new Error("No messageId found");
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.accessToken);

      return await acc.updateEmailStatus({
        messageId: input.messageId,
      });
    }),

  deleteEmail: privateProcedure
    .input(
      z.object({
        messageId: z.string().optional(),
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.messageId) throw new Error("No messageId found");
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const acc = new Account(account.accessToken);

      return await acc.deleteEmail({
        messageId: input.messageId,
      });
    }),

  searchEmails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        search: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );
      const orama = new OramaClient(account.id);
      await orama.initialize();
      const results = await orama.searchIndex({ term: input.search });
      return results;
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
