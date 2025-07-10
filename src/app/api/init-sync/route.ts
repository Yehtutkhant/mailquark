import { Account } from "@/app/actions/account";
import { syncToDb } from "@/app/actions/sync-to-db";
import { db } from "@/server/db";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, accountId } = await req.json();
  if (!userId || !accountId)
    return NextResponse.json(
      { message: "account id or user id is invalid for intial sync" },
      { status: 401 },
    );

  const accountData = await db.account.findUnique({
    where: {
      userId,
      id: accountId,
    },
  });
  if (!accountData)
    return NextResponse.json(
      { message: "account not found for initial sync" },
      { status: 401 },
    );

  const account = new Account(accountData.accessToken);
  const initialSyncedData = await account.performSync();
  if (!initialSyncedData)
    return NextResponse.json(
      { message: "Failed to perform initial sync" },
      { status: 500 },
    );
  const { emails, deltaToken } = initialSyncedData;

  await db.account.update({
    where: {
      id: accountId,
    },
    data: {
      nextDeltaToken: deltaToken,
    },
  });

  await syncToDb(emails, accountId);

  return NextResponse.json({ message: "success" }, { status: 201 });
}
