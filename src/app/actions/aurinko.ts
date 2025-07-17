"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { getSubscriptionStatus } from "./stripe-action";
import { db } from "@/server/db";
import { FREE_ACCOUNTS_PER_USER, PRO_ACCOUNTS_PER_USER } from "@/lib/constants";

export async function getAurinkoAuthUrl(serviceType: "Google" | "Office365") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const isSubscribed = await getSubscriptionStatus();
  const accounts = await db.account.count({ where: { userId } });
  if (isSubscribed) {
    if (accounts >= PRO_ACCOUNTS_PER_USER) {
      throw new Error("You have reached the maxmium accounts for you plan");
    }
  } else {
    if (accounts >= FREE_ACCOUNTS_PER_USER) {
      throw new Error("You have reached the maxmium accounts for you plan");
    }
  }

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/returnUrl`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
}

export async function exchangeCodeforToken(code: string) {
  console.log(code);
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRET as string,
        },
      },
    );

    return response.data as {
      accountId: number;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching Aurinko token:", error.response?.data);
    } else {
      console.error("Unexpected error fetching Aurinko token:", error);
    }
    throw error;
  }
}

export async function getAurinkoLinkedAccount(token: string) {
  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching Aurinko account:", error.response?.data);
    } else {
      console.error("Unexpected error fetching Aurinko account:", error);
    }
    throw error;
  }
}
