import type {
  EmailAddress,
  EmailMessage,
  SyncResponse,
  SyncUpdatedResponse,
} from "@/lib/types";
import { db } from "@/server/db";
import axios from "axios";
import { syncToDb } from "./sync-to-db";

const API_BASE_URL = "https://api.aurinko.io/v1";

export class Account {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  private async startSync() {
    const response = await axios.post<SyncResponse>(
      `${API_BASE_URL}/email/sync`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 5,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  private async getUpdatedSync({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    const response = await axios.get<SyncUpdatedResponse>(
      `${API_BASE_URL}/email/sync/updated`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          deltaToken: deltaToken ?? null,
          pageToken: pageToken ?? null,
        },
      },
    );
    return response.data;
  }

  async performSync() {
    try {
      let syncResponse = await this.startSync();
      if (!syncResponse.ready) {
        new Promise((resolve) => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }

      let deltaToken: string = syncResponse.syncUpdatedToken;
      let updatedSyncResponse = await this.getUpdatedSync({ deltaToken });

      if (updatedSyncResponse.nextDeltaToken) {
        deltaToken = updatedSyncResponse.nextDeltaToken;
      }

      let emails: EmailMessage[] = updatedSyncResponse.records;

      while (updatedSyncResponse.nextPageToken) {
        updatedSyncResponse = await this.getUpdatedSync({
          pageToken: updatedSyncResponse.nextPageToken,
        });
        emails = emails.concat(updatedSyncResponse.records);
        if (updatedSyncResponse.nextDeltaToken) {
          deltaToken = updatedSyncResponse.nextDeltaToken;
        }
      }
      return {
        emails,
        deltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error initial email syncing: ", error.response?.data);
      } else {
        console.error("Unexpected error in initial email syncing: ", error);
      }
      throw error;
    }
  }
  async sendEmail({
    threadId,
    from,
    body,
    subject,
    inReplyTo,
    to,
    cc,
    bcc,
    replyTo,
    references,
  }: {
    threadId?: string;
    from: EmailAddress;
    body: string;
    subject: string;
    inReplyTo?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
    references?: string;
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/email/messages`,
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          to,
          cc,
          bcc,
          replyTo: [replyTo],
          threadId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            returnIds: true,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error sending email to aurinko: ", error.response?.data);
      } else {
        console.error("Unexpected error in sending email to aurinko: ", error);
      }
      throw error;
    }
  }

  async syncUpdatedEmails() {
    console.log("syncing last emails");
    const account = await db.account.findFirst({
      where: {
        accessToken: this.token,
      },
    });

    if (!account) throw new Error("No account found");
    if (!account.nextDeltaToken) throw new Error("No next delta token found");

    const updatedSyncResponse = await this.getUpdatedSync({
      deltaToken: account.nextDeltaToken ?? undefined,
    });
    let storedDeltaToken = account.nextDeltaToken;
    if (updatedSyncResponse.nextDeltaToken) {
      storedDeltaToken = updatedSyncResponse.nextDeltaToken;
    }

    let emails: EmailMessage[] = updatedSyncResponse.records;
    while (updatedSyncResponse.nextPageToken) {
      emails.concat(updatedSyncResponse.records);
      if (updatedSyncResponse.nextDeltaToken) {
        storedDeltaToken = updatedSyncResponse.nextDeltaToken;
      }
    }

    try {
      await syncToDb(emails, account.id);
      await db.account.update({
        where: {
          id: account.id,
        },
        data: {
          nextDeltaToken: storedDeltaToken,
        },
      });
    } catch (error) {
      console.error("Error syncing updated emails");
    }
  }
}
