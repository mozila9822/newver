import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Lock, User, CreditCard, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { Link } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "./stripe-payment-form";

// Initialize Stripe - Will be loaded from database
let stripePromiseInstance: Promise<any> | null = null;

async function getStripePromise(): Promise<any> {
  try {
    const res = await fetch('/api/payment-settings/stripe');
    if (res.ok) {
      const stripeSettings = await res.json();
      if (stripeSettings.enabled && stripeSettings.publishableKey) {
        return loadStripe(stripeSettings.publishableKey);
      }
    }
  } catch (error) {
    // Silently fail - Stripe might not be configured yet
    console.warn('Stripe settings not available:', error);
  }
  // Fallback to environment variable if available
  const envKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (envKey) {
    return loadStripe(envKey);
  }
  // Return null if no Stripe configuration is available
  return null;
}

const getStripePromiseInstance = () => {
  if (!stripePromiseInstance) {
    stripePromiseInstance = getStripePromise();
  }
  return stripePromiseInstance;
};

// Wrapper component for Stripe Elements
function StripeElementsWrapper({ children, clientSecret }: { children: ReactNode; clientSecret: string }) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    getStripePromise().then(promise => {
      if (promise) {
        setStripePromise(promise);
      } else {
        setStripeError('Stripe is not configured. Please contact support or use another payment method.');
      }
    }).catch(error => {
      console.error('Error initializing Stripe:', error);
      setStripeError('Failed to initialize payment system. Please try again or use another payment method.');
    });
  }, []);

  if (stripeError) {
    return (
      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
        {stripeError}
      </div>
    );
  }

  if (!stripePromise) {
    return <div className="text-sm text-muted-foreground">Loading payment form...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemPrice: string;
  subTitle?: string;
}

export default function BookingModal({ isOpen, onClose, itemTitle, itemPrice, subTitle }: BookingModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { paymentCards, addBooking } = useStore();
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"saved" | "new" | "bank_transfer">("new");
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [bankTransferDetails, setBankTransferDetails] = useState<any>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  // Pre-fill user data when modal opens or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || ""
      });
      
      // Default to saved card if available
      if (paymentCards.length > 0) {
        setPaymentMethod("saved");
        setSelectedCardId(paymentCards[0].id);
      }
    }
  }, [user, isOpen, paymentCards]);

  // Fetch bank transfer details when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBankTransferDetails();
    }
  }, [isOpen]);

  const fetchBankTransferDetails = async () => {
    try {
      const res = await fetch('/api/payment-settings/bank_transfer');
      if (res.ok) {
        const settings = await res.json();
        if (settings.enabled) {
          setBankTransferDetails(settings);
        }
      }
    } catch (error) {
      // Silently fail - bank transfer might not be configured
      console.warn('Bank transfer settings not available:', error);
    }
  };

  // Create payment intent when user selects new payment method
  useEffect(() => {
    if (paymentMethod === "new" && !clientSecret && isOpen) {
      createPaymentIntent();
    }
  }, [paymentMethod, isOpen]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: itemPrice,
          currency: 'usd',
          metadata: {
            itemTitle,
            customerName: formData.name,
            customerEmail: formData.email,
          }
        })
      });

      if (response.ok) {
        const { clientSecret: secret, paymentIntentId: intentId } = await response.json();
        setClientSecret(secret);
        setPaymentIntentId(intentId);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create payment intent' }));
        throw new Error(errorData.message || 'Failed to create payment intent');
      }
    } catch (error: any) {
      console.error('Payment intent creation error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Stripe may not be configured. Please use bank transfer or contact support.",
        variant: "destructive"
      });
      // Don't prevent user from using other payment methods
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsSubmitting(true);
    
    try {
      // Confirm payment on server
      const confirmResponse = await fetch('/api/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment confirmation failed');
      }

      // Save booking to database with payment intent ID
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData.name,
          item: itemTitle,
          date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          amount: itemPrice,
          status: "Confirmed",
          payment_intent_id: paymentIntentId
        })
      });

      if (bookingResponse.ok) {
        const newBooking = await bookingResponse.json();
        setStep(2); // Success step
        
        // Also update local store
        addBooking(newBooking);

        toast({
          title: "Payment Successful & Booked",
          description: `Your reservation for ${itemTitle} has been confirmed and payment processed.`,
        });
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Payment was successful but booking creation failed. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using bank transfer, create booking with Pending status
    if (paymentMethod === "bank_transfer") {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: formData.name,
            item: itemTitle,
            date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            amount: itemPrice,
            status: "Pending"
          })
        });

        if (response.ok) {
          const newBooking = await response.json();
          setStep(2);
          addBooking(newBooking);

          toast({
            title: "Booking Created",
            description: `Your booking is pending payment confirmation. Please complete the bank transfer using the details provided.`,
          });
        } else {
          throw new Error('Failed to create booking');
        }
      } catch (error) {
        toast({
          title: "Booking Failed",
          description: "There was an error creating your booking. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    // If using saved card, process directly (mock payment for saved cards)
    if (paymentMethod === "saved" && selectedCardId) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: formData.name,
            item: itemTitle,
            date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            amount: itemPrice,
            status: "Confirmed"
          })
        });

        if (response.ok) {
          const newBooking = await response.json();
          setStep(2);
          addBooking(newBooking);

          toast({
            title: "Payment Successful & Booked",
            description: `Paid with card ending in ${paymentCards.find(c => c.id === selectedCardId)?.last4}. Reservation saved.`,
          });
        } else {
          throw new Error('Failed to create booking');
        }
      } catch (error) {
        toast({
          title: "Booking Failed",
          description: "There was an error creating your booking. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
    // For new card, payment will be handled by Stripe form
  };

  const reset = () => {
    setStep(1);
    setDate(undefined);
    setClientSecret(null);
    setPaymentIntentId(null);
    setPaymentMethod("new");
    setBankTransferDetails(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
      <DialogContent className="sm:max-w-[500px] font-sans max-h-[90vh] overflow-y-auto">
        {!user ? (
          // Not logged in state
          <div className="py-8 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="font-serif text-2xl mb-2">Account Required</DialogTitle>
              <DialogDescription>
                You must be logged in to book <span className="font-semibold text-primary">{itemTitle}</span>.
              </DialogDescription>
            </div>
            <div className="w-full space-y-3">
              <Link href="/login">
                <Button className="w-full" onClick={onClose}>
                  <User className="w-4 h-4 mr-2" /> Sign In / Register
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Creating an account allows you to manage bookings, earn rewards, and get exclusive offers.
            </p>
          </div>
        ) : step === 1 ? (
          // Booking Form
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Book Your Experience</DialogTitle>
              <DialogDescription>
                Complete your reservation for <span className="font-semibold text-primary">{itemTitle}</span>.
                {subTitle && <div className="mt-1 font-medium text-foreground">{subTitle}</div>}
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-muted/30 p-4 rounded-md mb-4 border border-border/50">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price per unit</span>
                  <span className="font-semibold text-lg text-primary">{itemPrice}</span>
               </div>
            </div>

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe" 
                  required 
                  className="focus-visible:ring-secondary" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com" 
                  required 
                  className="focus-visible:ring-secondary" 
                />
              </div>

              <div className="grid gap-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Label className="mb-3 block">Payment Method</Label>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(v) => setPaymentMethod(v as "saved" | "new" | "bank_transfer")}
                  className="flex flex-col gap-3"
                >
                    {paymentCards.length > 0 && (
                      <>
                        <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/20 transition-colors">
                          <RadioGroupItem value="saved" id="pm-saved" />
                          <Label htmlFor="pm-saved" className="flex items-center gap-2 cursor-pointer font-normal flex-1">
                            <CreditCard className="w-4 h-4" /> Pay with saved card
                          </Label>
                        </div>
                        
                        {paymentMethod === "saved" && (
                      <div className="pl-6 pr-2 pb-2 space-y-2">
                        <RadioGroup 
                          value={selectedCardId} 
                          onValueChange={setSelectedCardId}
                        >
                          {paymentCards.map(card => (
                            <div key={card.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value={card.id} id={card.id} />
                                <Label htmlFor={card.id} className="font-normal cursor-pointer">
                                  {card.brand} •••• {card.last4}
                                </Label>
                              </div>
                              <span className="text-xs text-muted-foreground">{card.expiry}</span>
                            </div>
                          ))}
                        </RadioGroup>
                        </div>
                      )}
                      </>
                    )}

                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/20 transition-colors">
                      <RadioGroupItem value="new" id="pm-new" />
                      <Label htmlFor="pm-new" className="flex items-center gap-2 cursor-pointer font-normal flex-1">
                        <CreditCard className="w-4 h-4 text-muted-foreground" /> Enter new card details
                      </Label>
                    </div>
                    
                    {paymentMethod === "new" && clientSecret && (
                      <div className="pl-2 pt-2">
                        <StripeElementsWrapper clientSecret={clientSecret}>
                          <StripePaymentForm
                            amount={itemPrice}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                        </StripeElementsWrapper>
                      </div>
                    )}
                    {paymentMethod === "new" && !clientSecret && (
                      <div className="pl-2 text-xs text-muted-foreground">
                        Initializing secure payment form...
                      </div>
                    )}

                    {bankTransferDetails && bankTransferDetails.enabled && (
                      <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/20 transition-colors">
                        <RadioGroupItem value="bank_transfer" id="pm-bank" />
                        <Label htmlFor="pm-bank" className="flex items-center gap-2 cursor-pointer font-normal flex-1">
                          <Building2 className="w-4 h-4 text-muted-foreground" /> Bank Transfer
                        </Label>
                      </div>
                    )}

                    {paymentMethod === "bank_transfer" && bankTransferDetails && (
                      <div className="pl-2 pt-2 space-y-4 border rounded-md p-4 bg-muted/20">
                        <div>
                          <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
                          <div className="space-y-3 text-sm">
                            {bankTransferDetails.additionalConfig?.bankName && (
                              <div>
                                <span className="font-medium text-muted-foreground">Bank Name:</span>
                                <span className="ml-2">{bankTransferDetails.additionalConfig.bankName}</span>
                              </div>
                            )}
                            {bankTransferDetails.additionalConfig?.accountHolderName && (
                              <div>
                                <span className="font-medium text-muted-foreground">Account Holder:</span>
                                <span className="ml-2">{bankTransferDetails.additionalConfig.accountHolderName}</span>
                              </div>
                            )}
                            {bankTransferDetails.additionalConfig?.accountNumber && (
                              <div>
                                <span className="font-medium text-muted-foreground">Account Number:</span>
                                <span className="ml-2 font-mono">{bankTransferDetails.additionalConfig.accountNumber}</span>
                              </div>
                            )}
                            {bankTransferDetails.additionalConfig?.routingNumber && (
                              <div>
                                <span className="font-medium text-muted-foreground">Routing Number:</span>
                                <span className="ml-2 font-mono">{bankTransferDetails.additionalConfig.routingNumber}</span>
                              </div>
                            )}
                            {bankTransferDetails.additionalConfig?.swiftCode && (
                              <div>
                                <span className="font-medium text-muted-foreground">SWIFT Code:</span>
                                <span className="ml-2 font-mono">{bankTransferDetails.additionalConfig.swiftCode}</span>
                              </div>
                            )}
                            {bankTransferDetails.additionalConfig?.bankAddress && (
                              <div>
                                <span className="font-medium text-muted-foreground">Bank Address:</span>
                                <span className="ml-2">{bankTransferDetails.additionalConfig.bankAddress}</span>
                              </div>
                            )}
                            {bankTransferDetails.additionalConfig?.instructions && (
                              <div className="pt-2 border-t">
                                <span className="font-medium text-muted-foreground block mb-1">Instructions:</span>
                                <p className="text-xs text-muted-foreground whitespace-pre-line">
                                  {bankTransferDetails.additionalConfig.instructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs text-yellow-800">
                          <strong>Note:</strong> Please include your booking reference in the transfer memo. Your booking will be confirmed once payment is received.
                        </div>
                      </div>
                    )}
                  </RadioGroup>
                </div>

              {(paymentMethod === "saved" || paymentMethod === "bank_transfer") && (
                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : paymentMethod === "bank_transfer" ? "Confirm Booking" : `Pay ${itemPrice} & Confirm`}
                  </Button>
                </DialogFooter>
              )}
              {paymentMethod === "new" && !clientSecret && (
                <DialogFooter className="mt-6">
                  <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-white" disabled>
                    Initializing Payment...
                  </Button>
                </DialogFooter>
              )}
            </form>
          </>
        ) : (
          // Success State
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="font-serif text-2xl">
              {paymentMethod === "bank_transfer" ? "Booking Created!" : "Booking Confirmed!"}
            </DialogTitle>
            <p className="text-muted-foreground px-4">
              {paymentMethod === "bank_transfer" ? (
                <>
                  Your booking has been created and is pending payment confirmation. 
                  Please complete the bank transfer using the details provided. 
                  We will confirm your booking once payment is received.
                  <br /><br />
                  Confirmation sent to <strong>{formData.email}</strong>.
                </>
              ) : (
                <>
                  Thank you for choosing Voyager Hub. We have sent a confirmation email to <strong>{formData.email}</strong>.
                </>
              )}
            </p>
            <Button onClick={reset} className="mt-4 bg-secondary hover:bg-secondary/90 text-white">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}