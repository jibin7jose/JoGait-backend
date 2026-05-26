import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

// In a real environment, you would run: npm install stripe
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only corporate accounts / clinicians should be setting up billing
    if (req.user?.role !== 'clinician' && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. Only clinicians can subscribe to corporate features.' });
      return;
    }

    const { paymentMethodId, priceId } = req.body;

    if (!paymentMethodId || !priceId) {
      res.status(400).json({ error: 'Payment method and Price ID are required' });
      return;
    }

    /* 
      TODO: Implement actual Stripe logic here:
      1. Fetch User from DB to get their `stripeCustomerId`
      2. If none, create a new Stripe Customer using `stripe.customers.create()`
      3. Attach the `paymentMethodId` to the customer
      4. Create the subscription using `stripe.subscriptions.create({ customer, items: [{ price: priceId }] })`
      5. Save the resulting `subscriptionId` back to the User record in the database
    */

    res.status(200).json({ 
      message: 'Subscription processed successfully (Mock)', 
      subscriptionStatus: 'active',
      plan: priceId
    });
  } catch (error) {
    console.error('Stripe billing error:', error);
    res.status(500).json({ error: 'Internal server error processing payment' });
  }
};
