"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type Stripe from "stripe";

export async function createCheckoutSession() {
  let session: Stripe.Response<Stripe.Checkout.Session>;
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: "price_1RlbGbIXrLaCJe76LWg6X7hl", quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
      client_reference_id: userId,
    });
  } catch (error) {
    console.log("Error in creating checkout session: ", error);
    throw error;
  }

  redirect(session?.url as string);
}

export async function createBillingPortalSession() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const subscription = await db.stripeSubscription.findUnique({
    where: {
      userId,
    },
  });

  if (!subscription) throw new Error("Subscription not found");
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/mail`,
  });
  redirect(session.url as string);
}

export async function getSubscriptionStatus() {
  const { userId } = await auth();
  if (!userId) return false;
  const subscription = await db.stripeSubscription.findUnique({
    where: {
      userId,
    },
  });

  if (!subscription) return false;
  return subscription.currentPeriodEnd > new Date();
}
