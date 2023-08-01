import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getProduct = async (itemId) => {
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
      id: itemId,
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
    if (req.body) {
      const { ids } = req.body;
      const products = await Promise.all(ids.map((id) => getProduct(id)));
      res.setHeader("Content-Type", "application/json");
      res.send(products);
    } else {
      res.status(500).send({ error: "No ids provided." });
    }
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).send({ error: "Something went wrong" });
  }
}
