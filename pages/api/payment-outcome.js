import { buffer } from "micro";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// TEMP: SHould not be in production
console.warn("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
console.warn("STRIPE_WEBHOOK_SECRET:", webhookSecret);

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).send("Method Not Allowed");
    }

    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    console.warn("BUFFER:", buf);
    console.warn("SIG:", sig);

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return res.status(400).send("Webhook Error: Invalid signature");
    }

    // Handle the event
    try {
      switch (event.type) {
        case "payment_intent.created":
          /*           console.log("payment_intent.created:", event.data.object.id);
          console.log("DEBUG:", event.data.object);

          await prisma.$transaction([
            prisma.payment.create({
              data: {
                paymentId: event.data.object.id,
                amount: event.data.object.amount,
                status: event.data.object.status,
                description: event.data.object.description,
                idHash: event.data.object.metadata.idHash,
                transfers: parseInt(event.data.object.metadata.transfers),
              },
            }),
          ]);

          console.log("Payment created in database:", event.data.object.id); */
          break;

        case "payment_intent.succeeded":
          console.log(event.type, event.data.object.id);

          console.log("payment_intent.created:", event.data.object.id);
          console.log("DEBUG:", event.data.object);

          await prisma.$transaction([
            prisma.payment.create({
              data: {
                paymentId: event.data.object.id,
                amount: event.data.object.amount,
                status: event.data.object.status,
                description: event.data.object.description,
                idHash: event.data.object.metadata.idHash,
                transfers: parseInt(event.data.object.metadata.transfers),
              },
            }),

            // NOTE: I don't believe we need to handle payment_intent.created from the webhook,
            // it creates database bloat.
            // I think we only need to handle payment_intent.succeeded/failure as this will be the 0/1 states we care about
            // BUT TODO: need to test this works as expected.

            /*           await prisma.$transaction([
            prisma.payment.update({
              where: {
                paymentId: event.data.object.id,
              },
              data: {
                status: event.data.object.status,
              },
            }), */
            prisma.user.update({
              where: {
                idHash: event.data.object.metadata.idHash,
              },
              data: {
                fileTransfersRemaining: {
                  increment: parseInt(event.data.object.metadata.transfers),
                },
              },
            }),
          ]);
          console.log("Payment created in database:", event.data.object.id);
          console.log("Payment updated in database:", event.data.object.id);
          break;

        case "charge.succeeded":
          console.log(event.type, event.data.object.id);
          break;

        case "payment_intent.payment_failed":
          break;

        default:
          console.warn(`Unhandled event type: ${event.type}`);
          break;
      }
    } catch (error) {
      console.error("Error processing event:", error);
      return res
        .status(500)
        .send(`Webhook Error: Unable to process event: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

export default handler;

// Increase serverTimeout to 60 seconds
export const config = {
  api: {
    bodyParser: false,
    serverTimeout: 60000,
  },
};
