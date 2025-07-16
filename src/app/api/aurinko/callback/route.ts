import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const params = new URL(req.url);

  return NextResponse.redirect(
    `https://api.aurinko.io/v1/auth/callback${params.search}`,
    307,
  );
}
