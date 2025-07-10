import {
  exchangeCodeforToken,
  getAurinkoLinkedAccount,
} from "@/app/actions/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const params = req.nextUrl.searchParams;

    if (params.get("status") !== "success")
      return NextResponse.json(
        { message: "Failed to link account" },
        { status: 400 },
      );

    const code = params.get("code");
    if (!code)
      return NextResponse.json(
        { message: "Failed to get code" },
        { status: 400 },
      );

    const token = await exchangeCodeforToken(code);
    if (!code)
      return NextResponse.json(
        { message: "Failed to exchange token" },
        { status: 400 },
      );

    console.log(token);

    const account = await getAurinkoLinkedAccount(token.accessToken);
    await db.account.upsert({
      where: {
        id: token.accountId.toString(),
      },
      update: {
        accessToken: token.accessToken.toString(),
      },
      create: {
        id: token.accountId.toString(),
        accessToken: token.accessToken.toString(),
        emailAddress: account.email,
        name: account.name,
        userId,
      },
    });

    waitUntil(
      axios
        .post(`${process.env.NEXT_PUBLIC_URL}/api/init-sync`, {
          accountId: token.accountId.toString(),
          userId,
        })
        .then((response) => {
          console.log("Synced initial data: ", response.data);
        })
        .catch((error) => {
          console.error("Failed to sync initial data", error);
        }),
    );

    return NextResponse.redirect(new URL("/mail", process.env.NEXT_PUBLIC_URL));
  } catch (err) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
