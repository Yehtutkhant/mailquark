import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { headers } from "next/headers";
import Stripe from "stripe";

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

  console.log("Received event: ", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
      {
        expand: ["items.data.price.product"],
      },
    );
    if (!session.client_reference_id) {
      return new Response("No client_reference_id found", { status: 400 });
    }

    const plan = subscription.items.data[0]?.price;
    if (!plan) {
      return new Response("No plan found", { status: 400 });
    }

    const productId = (plan.product as Stripe.Product).id;
    if (!productId) {
      return new Response("No product found", { status: 400 });
    }

    const item = subscription.items.data[0];
    if (!item?.current_period_end) {
      return new Response("No current_period_end found", { status: 400 });
    }

    await db.stripeSubscription.create({
      data: {
        userId: session.client_reference_id,
        priceId: plan.id,
        customerId: subscription.customer as string,
        currentPeriodEnd: new Date(item.current_period_end * 1000),
        subscriptionId: subscription.id,
      },
    });

    return new Response("Webhook Received", { status: 200 });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    const subscription = await stripe.subscriptions.retrieve(
      invoice.parent?.subscription_details?.subscription as string,
      {
        expand: ["items.data.price.product"],
      },
    );

    const plan = subscription.items.data[0]?.price;
    if (!plan) {
      return new Response("No plan found", { status: 400 });
    }

    const productId = (plan.product as Stripe.Product).id;
    if (!productId) {
      return new Response("No product found", { status: 400 });
    }

    const item = subscription.items.data[0];
    if (!item?.current_period_end) {
      return new Response("No current_period_end found", { status: 400 });
    }

    const existingSubscription = await db.stripeSubscription.findUnique({
      where: {
        subscriptionId: subscription.id as string,
      },
    });
    if (!existingSubscription) {
      return new Response("No subscription created yet", { status: 200 });
    }
    await db.stripeSubscription.update({
      where: {
        subscriptionId: subscription.id,
      },
      data: {
        priceId: plan.id,
        currentPeriodEnd: new Date(item.current_period_end * 1000),
      },
    });

    return new Response("Webhook Received", { status: 200 });
  }

  if (event.type === "customer.subscription.updated") {
    const updatedSub = event.data.object as Stripe.Subscription;

    const item = updatedSub.items.data[0];
    if (!item?.current_period_end) {
      return new Response("No current_period_end found", { status: 400 });
    }

    const existingSubscription = await db.stripeSubscription.findUnique({
      where: {
        subscriptionId: updatedSub.id as string,
      },
    });
    if (!existingSubscription) {
      return new Response("No subscription created yet", { status: 200 });
    }

    await db.stripeSubscription.update({
      where: {
        subscriptionId: updatedSub.id as string,
      },
      data: {
        updatedAt: new Date(),
        currentPeriodEnd: new Date(item.current_period_end * 1000),
      },
    });

    return new Response("Webhook Received", { status: 200 });
  }

  return new Response("Webhook Received", { status: 200 });
}
