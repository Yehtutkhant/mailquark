import { db } from "@/server/db";
import { create, insert, search, type AnyOrama } from "@orama/orama";
import { restore, persist } from "@orama/plugin-data-persistence";

export class OramaClient {
  //@ts-ignore
  private orama: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }
  async saveIndextoDb() {
    const index = await persist(this.orama, "json");
    await db.account.update({
      where: {
        id: this.accountId,
      },
      data: {
        oramaIndex: index,
      },
    });
  }

  async initialize() {
    try {
      const account = await db.account.findUnique({
        where: {
          id: this.accountId,
        },
      });

      if (!account) throw new Error("Account not found");

      if (account.oramaIndex) {
        this.orama = await restore("json", account.oramaIndex as string);
      } else {
        this.orama = create({
          schema: {
            subject: "string",
            body: "string",
            rawBody: "string",
            from: "string",
            to: "string[]",
            sentAt: "string",
            threadId: "string",
            accountId: "string",
          },
        });
        this.saveIndextoDb();
      }
    } catch (error) {
      console.error("Failed initialize orama: ", error);
      throw error;
    }
  }

  async insertToOrama(document: any) {
    //@ts-ignore
    console.log(document);
    try {
      insert(this.orama, {
        document,
      });
      await this.saveIndextoDb();
    } catch (error) {
      console.error("Failed insert index to orama: ", error);
      throw error;
    }
  }

  async searchIndex({ term }: { term: string }) {
    const results = search(this.orama, {
      term,
      where: {
        accountId: this.accountId,
      },
    });
    return results;
  }
}
