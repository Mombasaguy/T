import Stripe from "stripe";
import { getStripeSync } from './stripeClient';
import { storage } from "./storage";
import { getSearchLimitForPlan } from "@shared/schema";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
    
    console.log('[Stripe Webhook] Event processed successfully');
  }
}

export async function handleCheckoutCompleted(
  event: Stripe.CheckoutSessionCompletedEvent
) {
  const session = event.data.object;
  
  console.log("Checkout completed:", session.id);
  
  const userId = session.client_reference_id || session.metadata?.userId || 'guest';
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  if (!customerId || !subscriptionId) {
    console.error("Missing customer or subscription ID");
    return;
  }
  
  const plan = session.metadata?.plan || 'professional';
  const searchesLimit = getSearchLimitForPlan(plan as any);
  
  const existingSub = await storage.getSubscription(userId);
  
  if (existingSub) {
    await storage.updateSubscription(userId, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan,
      status: 'trialing',
      searchesLimit,
      searchesUsed: 0,
    });
  } else {
    await storage.createSubscription({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan,
      status: 'trialing',
      searchesUsed: 0,
      searchesLimit,
    });
  }
  
  console.log(`Subscription created for user ${userId}, plan: ${plan}`);
}

export async function handleSubscriptionUpdated(
  event: Stripe.CustomerSubscriptionUpdatedEvent
) {
  const subscription = event.data.object as Stripe.Subscription;
  
  console.log("Subscription updated:", subscription.id);
  
  // Look up by stripeSubscriptionId first, then fall back to userId in metadata
  let existingSub = await storage.getSubscriptionByStripeId(subscription.id);
  if (!existingSub && subscription.metadata?.userId) {
    existingSub = await storage.getSubscription(subscription.metadata.userId);
  }
  
  if (!existingSub) {
    console.error("Subscription not found for:", subscription.id);
    return;
  }
  
  const status = subscription.status;
  const periodEnd = (subscription as any).current_period_end;
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
  
  await storage.updateSubscription(existingSub.userId, {
    status: status as any,
    currentPeriodEnd: currentPeriodEnd ?? undefined,
  });
  
  console.log(`Subscription ${subscription.id} status: ${status}`);
}

export async function handleSubscriptionDeleted(
  event: Stripe.CustomerSubscriptionDeletedEvent
) {
  const subscription = event.data.object;
  
  console.log("Subscription cancelled:", subscription.id);
  
  // Look up by stripeSubscriptionId first, then fall back to userId in metadata
  let existingSub = await storage.getSubscriptionByStripeId(subscription.id);
  if (!existingSub && subscription.metadata?.userId) {
    existingSub = await storage.getSubscription(subscription.metadata.userId);
  }
  
  if (!existingSub) {
    console.error("Subscription not found for:", subscription.id);
    return;
  }
  
  await storage.cancelSubscription(existingSub.userId);
  
  console.log(`User ${existingSub.userId} downgraded to free tier`);
}

export async function handleInvoicePaymentSucceeded(
  event: Stripe.InvoicePaymentSucceededEvent
) {
  const invoice = event.data.object as Stripe.Invoice;
  
  console.log("Payment succeeded:", invoice.id);
  
  if (invoice.billing_reason === 'subscription_cycle') {
    const subscriptionId = (invoice as any).subscription as string;
    console.log(`New billing cycle for subscription: ${subscriptionId}`);
  }
}

export async function handleInvoicePaymentFailed(
  event: Stripe.InvoicePaymentFailedEvent
) {
  const invoice = event.data.object;
  
  console.log("Payment failed:", invoice.id);
  
  const customerId = invoice.customer as string;
  console.log(`Payment failed for customer: ${customerId}`);
}
