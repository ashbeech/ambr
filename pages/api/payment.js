import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const calculateItemCost = async (itemId) => {
  if (!itemId) {
    throw new Error("Invalid item: no ID provided");
  }

  try {
    const product = await stripe.products.retrieve(itemId);
    if (!product.default_price) {
      throw new Error("Invalid product: no default price");
    }
    if (!product.metadata.transfers) {
      throw new Error("Invalid product: no transfers metadata");
    }

    const price = await stripe.prices.retrieve(product.default_price);
    return {
      price: price.unit_amount,
      currency: price.currency,
      description: product.name,
      transfers: product.metadata.transfers,
    };
  } catch (err) {
    console.error(`Error loading product ${itemId}:`, err.message);
    return {
      price: 0,
      currency: "",
      description: "",
      transfers: "",
    };
  }
};

export default async function handler(req, res) {
  try {
    const { idHash, items } = req.body;

    const costs = await Promise.all(
      items.map((item) => calculateItemCost(item.id))
    );

    let totalCost = 0;
    let transfers = 0;
    let currency = "";
    let description = "";

    costs.forEach((cost) => {
      totalCost += cost.price;
      transfers += cost.transfers;
      currency = cost.currency;
      description = cost.description;
    });

    const paymentIntent = await stripe.paymentIntents.create({
      metadata: {
        idHash: idHash,
        transfers: transfers,
      },
      amount: totalCost,
      currency: currency,
      description: description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.setHeader("Content-Type", "application/json");
    res.send(paymentIntent);
  } catch (err) {
    console.error("Error creating payment intent:", err.message);
    res.status(500).send({ error: "Something went wrong" });
  }
}
