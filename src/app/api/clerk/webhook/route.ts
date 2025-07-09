import { db } from "@/server/db";
import type { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { data } = await req.json();
    await db.user.create({
      data: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        emailAddress: data.email_addresses[0].email_address,
        imageUrl: data.image_url,
      },
    });

    return new Response("User created from clerk web hook", { status: 200 });
  } catch (err) {
    console.log("Web hook error: ", err);
    return new Response("Error from clerk web hook", { status: 400 });
  }
};
