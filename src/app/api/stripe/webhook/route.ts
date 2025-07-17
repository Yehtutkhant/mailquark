import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    return new Response("Webhook Error", { status: 400 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  console.log("Received event: ", event.type);

  return new Response("Webhook Received", { status: 200 });
}
