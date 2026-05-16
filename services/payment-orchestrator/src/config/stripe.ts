import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'Em hỏi sao nhạc anh hay, anh gọi đó là bí thuật.');

export { stripe }