import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { testConnection, initializeDatabase } from "./db";
import { stripe, convertPriceToCents } from "./stripe";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Test database connection on startup
  await testConnection();
  // Initialize database tables (creates tables if they don't exist)
  await initializeDatabase();

  // API Routes - prefix all routes with /api

  // ============== TRIPS ==============
  app.get("/api/trips", async (_req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ message: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTripById(req.params.id);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error fetching trip:", error);
      res.status(500).json({ message: "Failed to fetch trip" });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const trip = await storage.createTrip(req.body);
      res.status(201).json(trip);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(500).json({ message: "Failed to create trip" });
    }
  });

  app.put("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error updating trip:", error);
      res.status(500).json({ message: "Failed to update trip" });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrip(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Trip not found" });
      }
      res.json({ message: "Trip deleted successfully" });
    } catch (error) {
      console.error("Error deleting trip:", error);
      res.status(500).json({ message: "Failed to delete trip" });
    }
  });

  // ============== HOTELS ==============
  app.get("/api/hotels", async (_req, res) => {
    try {
      const hotels = await storage.getHotels();
      res.json(hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get("/api/hotels/:id", async (req, res) => {
    try {
      const hotel = await storage.getHotelById(req.params.id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post("/api/hotels", async (req, res) => {
    try {
      const hotel = await storage.createHotel(req.body);
      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.put("/api/hotels/:id", async (req, res) => {
    try {
      const hotel = await storage.updateHotel(req.params.id, req.body);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });

  app.delete("/api/hotels/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteHotel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json({ message: "Hotel deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res.status(500).json({ message: "Failed to delete hotel" });
    }
  });

  // ============== CARS ==============
  app.get("/api/cars", async (_req, res) => {
    try {
      const cars = await storage.getCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const car = await storage.getCarById(req.params.id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const car = await storage.createCar(req.body);
      res.status(201).json(car);
    } catch (error) {
      console.error("Error creating car:", error);
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  app.put("/api/cars/:id", async (req, res) => {
    try {
      const car = await storage.updateCar(req.params.id, req.body);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ message: "Failed to update car" });
    }
  });

  app.delete("/api/cars/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json({ message: "Car deleted successfully" });
    } catch (error) {
      console.error("Error deleting car:", error);
      res.status(500).json({ message: "Failed to delete car" });
    }
  });

  // ============== LAST MINUTE OFFERS ==============
  app.get("/api/last-minute-offers", async (_req, res) => {
    try {
      const offers = await storage.getLastMinuteOffers();
      res.json(offers);
    } catch (error) {
      console.error("Error fetching last minute offers:", error);
      res.status(500).json({ message: "Failed to fetch last minute offers" });
    }
  });

  app.post("/api/last-minute-offers", async (req, res) => {
    try {
      const offer = await storage.createOffer(req.body);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.put("/api/last-minute-offers/:id", async (req, res) => {
    try {
      const offer = await storage.updateOffer(req.params.id, req.body);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ message: "Failed to update offer" });
    }
  });

  app.delete("/api/last-minute-offers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOffer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json({ message: "Offer deleted successfully" });
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({ message: "Failed to delete offer" });
    }
  });

  // ============== BOOKINGS ==============
  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // ============== STRIPE PAYMENTS ==============
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { getStripeInstance } = await import('./stripe');
      const stripe = await getStripeInstance();
      
      if (!stripe) {
        return res.status(503).json({ 
          message: "Stripe is not configured. Please configure payment settings in admin panel." 
        });
      }

      const { amount, currency = "usd", metadata = {} } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      const amountInCents = typeof amount === 'string' ? convertPriceToCents(amount) : amount;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Failed to create payment intent",
        error: error.message 
      });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { getStripeInstance } = await import('./stripe');
      const stripe = await getStripeInstance();
      
      if (!stripe) {
        return res.status(503).json({ 
          message: "Stripe is not configured. Please configure payment settings in admin panel." 
        });
      }

      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        res.json({ 
          success: true, 
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          }
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: `Payment not completed. Status: ${paymentIntent.status}` 
        });
      }
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ 
        message: "Failed to confirm payment",
        error: error.message 
      });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = await storage.createBooking(req.body);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // ============== REVIEWS ==============
  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/:itemType/:itemId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByItem(req.params.itemId, req.params.itemType);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/:itemType/:itemId/approved", async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviewsByItem(req.params.itemId, req.params.itemType);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching approved reviews:", error);
      res.status(500).json({ message: "Failed to fetch approved reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:id", async (req, res) => {
    try {
      const review = await storage.updateReview(req.params.id, req.body);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.put("/api/reviews/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const review = await storage.updateReviewStatus(req.params.id, status);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ============== SUPPORT TICKETS ==============
  app.get("/api/tickets", async (_req, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/tickets/user/:userEmail", async (req, res) => {
    try {
      const tickets = await storage.getTicketsByUser(req.params.userEmail);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch user tickets" });
    }
  });

  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.put("/api/tickets/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const ticket = await storage.updateTicketStatus(req.params.id, status);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  app.post("/api/tickets/:id/replies", async (req, res) => {
    try {
      const reply = await storage.addTicketReply(req.params.id, req.body);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error adding ticket reply:", error);
      res.status(500).json({ message: "Failed to add ticket reply" });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTicket(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json({ message: "Ticket deleted successfully" });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // ============== PAYMENT SETTINGS ==============
  app.get("/api/payment-settings", async (_req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  });

  app.get("/api/payment-settings/:provider", async (req, res) => {
    try {
      const setting = await storage.getPaymentSettingByProvider(req.params.provider);
      if (!setting) {
        return res.status(404).json({ message: "Payment provider not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching payment setting:", error);
      res.status(500).json({ message: "Failed to fetch payment setting" });
    }
  });

  app.put("/api/payment-settings/:provider", async (req, res) => {
    try {
      const updated = await storage.updatePaymentSettings(req.params.provider, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Payment provider not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ message: "Failed to update payment settings" });
    }
  });

  // ============== SUBSCRIBERS ==============
  app.get("/api/subscribers", async (_req, res) => {
    try {
      const subscribers = await storage.getSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  app.post("/api/subscribers", async (req, res) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const subscriber = await storage.createSubscriber(email, name);
      res.status(201).json(subscriber);
    } catch (error) {
      console.error("Error creating subscriber:", error);
      res.status(500).json({ message: "Failed to create subscriber" });
    }
  });

  app.delete("/api/subscribers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubscriber(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Subscriber not found" });
      }
      res.json({ message: "Subscriber deleted successfully" });
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      res.status(500).json({ message: "Failed to delete subscriber" });
    }
  });

  app.post("/api/subscribers/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const success = await storage.unsubscribeSubscriber(email);
      if (!success) {
        return res.status(404).json({ message: "Subscriber not found" });
      }
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  // ============== EMAIL TEMPLATES ==============
  app.get("/api/email-templates", async (_req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch email templates" });
    }
  });

  app.get("/api/email-templates/:id", async (req, res) => {
    try {
      const template = await storage.getEmailTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Failed to fetch email template" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const template = await storage.createEmailTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  app.put("/api/email-templates/:id", async (req, res) => {
    try {
      const updated = await storage.updateEmailTemplate(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update email template" });
    }
  });

  app.delete("/api/email-templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmailTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Email template not found" });
      }
      res.json({ message: "Email template deleted successfully" });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete email template" });
    }
  });

  // ============== SEND EMAILS ==============
  app.post("/api/send-emails", async (req, res) => {
    try {
      const { subscriberIds, templateId, subject, body, variables } = req.body;
      
      if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
        return res.status(400).json({ message: "Subscriber IDs are required" });
      }

      // Get all subscribers
      const allSubscribers = await storage.getSubscribers();
      const activeSubscribers = allSubscribers.filter(s => s.status === 'active');
      
      // If subscriberIds includes "all", send to all active subscribers
      const targetSubscribers = subscriberIds.includes('all') 
        ? activeSubscribers 
        : activeSubscribers.filter(s => subscriberIds.includes(s.id));

      if (targetSubscribers.length === 0) {
        return res.status(400).json({ message: "No active subscribers found" });
      }

      // Get template if provided
      let emailSubject = subject;
      let emailBody = body;
      if (templateId) {
        const template = await storage.getEmailTemplateById(templateId);
        if (template) {
          emailSubject = template.subject;
          emailBody = template.body;
        }
      }

      // Replace variables in subject and body
      const replaceVariables = (text: string, vars: Record<string, string>) => {
        let result = text;
        Object.keys(vars).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          result = result.replace(regex, vars[key] || '');
        });
        return result;
      };

      // For now, we'll just log the emails (in production, you'd use nodemailer or similar)
      const emailResults = targetSubscribers.map(subscriber => {
        const vars = {
          ...variables,
          name: subscriber.name || subscriber.email.split('@')[0],
          email: subscriber.email,
          companyName: 'Voyager Hub'
        };
        
        const finalSubject = replaceVariables(emailSubject, vars);
        const finalBody = replaceVariables(emailBody, vars);
        
        console.log(`📧 Email to ${subscriber.email}:`);
        console.log(`   Subject: ${finalSubject}`);
        console.log(`   Body: ${finalBody.substring(0, 100)}...`);
        
        return {
          email: subscriber.email,
          status: 'sent',
          subject: finalSubject
        };
      });

      res.json({
        message: `Emails sent to ${emailResults.length} subscribers`,
        results: emailResults
      });
    } catch (error) {
      console.error("Error sending emails:", error);
      res.status(500).json({ message: "Failed to send emails" });
    }
  });

  // ============== EMAIL SETTINGS ==============
  app.get("/api/email-settings", async (_req, res) => {
    try {
      const settings = await storage.getEmailSettings();
      if (!settings) {
        return res.status(404).json({ message: "Email settings not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching email settings:", error);
      res.status(500).json({ message: "Failed to fetch email settings" });
    }
  });

  app.put("/api/email-settings", async (req, res) => {
    try {
      const updated = await storage.updateEmailSettings(req.body);
      if (!updated) {
        return res.status(500).json({ message: "Failed to update email settings" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating email settings:", error);
      res.status(500).json({ message: "Failed to update email settings" });
    }
  });

  return httpServer;
}
