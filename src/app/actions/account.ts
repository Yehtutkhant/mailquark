import type {
  EmailMessage,
  SyncResponse,
  SyncUpdatedResponse,
} from "@/lib/types";
import axios from "axios";

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
          daysWithin: 3,
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
}
