import Stripe from 'stripe';
import { storage } from './storage';

// Initialize Stripe - will be updated from database
let stripeInstance: Stripe | null = null;

export async function getStripeInstance(): Promise<Stripe | null> {
  try {
    const stripeSettings = await storage.getPaymentSettingByProvider('stripe');
    
    if (!stripeSettings || !stripeSettings.enabled || !stripeSettings.secretKey) {
      return null;
    }

    // Create new instance if settings changed or don't exist
    // Check if we need to recreate the instance by comparing keys
    const currentKey = (stripeInstance as any)?._api?.auth?.[0] || '';
    if (!stripeInstance || currentKey !== stripeSettings.secretKey) {
      stripeInstance = new Stripe(stripeSettings.secretKey, {
        apiVersion: '2025-11-17.clover',
      });
    }

    return stripeInstance;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return null;
  }
}

// Legacy export for backward compatibility (uses env var as fallback)
export const stripe = (async () => {
  const instance = await getStripeInstance();
  if (instance) return instance;
  
  // Fallback to environment variable if database doesn't have settings
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey) {
    return new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }
  
  return null;
})();

// Helper function to convert price string to cents (Stripe uses cents)
export function convertPriceToCents(priceString: string): number {
  // Remove currency symbols and extract number
  const numericValue = parseFloat(priceString.replace(/[^0-9.]/g, ''));
  // Convert to cents (multiply by 100)
  return Math.round(numericValue * 100);
}

