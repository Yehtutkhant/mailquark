import { OramaClient } from "@/app/actions/orama";
import { turndown } from "@/lib/turndown";
import { db } from "@/server/db";
import { getEmbeddings } from "./app/actions/embedding";

const orama = new OramaClient("130909");
await orama.initialize();

// const emails = await db.email.findMany({
//   select: {
//     subject: true,
//     body: true,
//     bodySnippet: true,
//     from: true,
//     to: true,
//     sentAt: true,
//     threadId: true,
//   },
// });

// for (const email of emails) {
//   const body = turndown.turndown(email.body ?? email.bodySnippet ?? "");
//   const embeddings = await getEmbeddings(body);
//   console.log(embeddings.length);
//   await orama.insertToOrama({
//     subject: email.subject,
//     body: turndown.turndown(email.body ?? email.bodySnippet ?? ""),
//     rawBody: body,
//     from: `${email.from.name} <${email.from.address}>`,
//     to: email.to.map((email) => `${email.name} <${email.address}>`),
//     sentAt: new Date(email.sentAt).toLocaleString(),
//     threadId: email.threadId,
//     accountId: "130862",
//     embeddings,
//   });
// }

const results = await orama.searchVector({
  term: "link",
});

console.log(results);

for (const hit of results.hits) {
  console.log(hit.document.subject);
}
