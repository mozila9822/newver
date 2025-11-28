# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment processing for the VoyagerLuxury booking system.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in the top right)
3. Navigate to **Developers** → **API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

## Step 2: Configure Environment Variables

### For Server (Backend)

Create a `.env` file in the root directory or set environment variables:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### For Client (Frontend)

Create a `.env` file in the root directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:** The `VITE_` prefix is required for Vite to expose the variable to the client-side code.

## Step 3: Update Code with Your Keys

### Option 1: Use Environment Variables (Recommended)

1. Create `.env` file in the project root:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
   ```

2. The code will automatically use these values.

### Option 2: Hardcode for Testing (Not Recommended for Production)

If you want to test quickly, you can temporarily hardcode the keys:

**In `server/stripe.ts`:**
```typescript
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here';
```

**In `client/src/components/booking-modal.tsx`:**
```typescript
const stripePromise = loadStripe('pk_test_your_key_here');
```

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to a booking page and try to make a booking

3. Use Stripe test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **Requires Authentication:** `4000 0025 0000 3155`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC

## Step 5: Database Migration

The database schema has been updated to include `payment_intent_id` in the bookings table. If you need to update an existing database:

```sql
ALTER TABLE bookings ADD COLUMN payment_intent_id VARCHAR(255);
```

## How It Works

1. **User initiates booking** → Booking form is displayed
2. **User selects payment method** → If "new card" is selected, a payment intent is created
3. **Stripe Elements form** → Secure card input form is displayed
4. **Payment processing** → Stripe processes the payment securely
5. **Booking confirmation** → On successful payment, booking is saved with payment intent ID

## Production Setup

When ready for production:

1. Switch to **Live Mode** in Stripe Dashboard
2. Get your **live** API keys (starts with `pk_live_...` and `sk_live_...`)
3. Update environment variables with live keys
4. Update `server/stripe.ts` to use live keys
5. Test thoroughly before going live

## Security Notes

- **Never commit** your secret keys to version control
- Always use environment variables for sensitive data
- The secret key should only be used on the server
- The publishable key is safe to use in client-side code

## Support

For Stripe-related issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues, check the server logs and browser console for error messages.

