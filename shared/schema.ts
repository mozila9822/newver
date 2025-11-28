import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean, date, integer, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Trips table
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  image: text("image").notNull(),
  gallery: json("gallery").$type<string[]>().default([]),
  price: varchar("price", { length: 50 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  features: json("features").$type<string[]>().notNull(),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTripSchema = createInsertSchema(trips).omit({ id: true, createdAt: true });
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;

// Hotels table
export const hotels = pgTable("hotels", {
  id: varchar("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  image: text("image").notNull(),
  gallery: json("gallery").$type<string[]>().default([]),
  price: varchar("price", { length: 50 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  amenities: json("amenities").$type<string[]>().notNull(),
  alwaysAvailable: boolean("always_available").default(true),
  isActive: boolean("is_active").default(true),
  availableFrom: date("available_from"),
  availableTo: date("available_to"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHotelSchema = createInsertSchema(hotels).omit({ id: true, createdAt: true });
export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

// Room types table
export const roomTypes = pgTable("room_types", {
  id: varchar("id").primaryKey(),
  hotelId: varchar("hotel_id").notNull().references(() => hotels.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  description: text("description"),
  facilities: json("facilities").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hotelsRelations = relations(hotels, ({ many }) => ({
  roomTypes: many(roomTypes),
}));

export const roomTypesRelations = relations(roomTypes, ({ one }) => ({
  hotel: one(hotels, {
    fields: [roomTypes.hotelId],
    references: [hotels.id],
  }),
}));

export const insertRoomTypeSchema = createInsertSchema(roomTypes).omit({ id: true, createdAt: true });
export type RoomType = typeof roomTypes.$inferSelect;
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;

// Cars table
export const cars = pgTable("cars", {
  id: varchar("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  image: text("image").notNull(),
  gallery: json("gallery").$type<string[]>().default([]),
  price: varchar("price", { length: 50 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  specs: varchar("specs", { length: 255 }).notNull(),
  features: json("features").$type<string[]>().notNull(),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars).omit({ id: true, createdAt: true });
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

// Last minute offers table
export const lastMinuteOffers = pgTable("last_minute_offers", {
  id: varchar("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  image: text("image").notNull(),
  gallery: json("gallery").$type<string[]>().default([]),
  price: varchar("price", { length: 50 }).notNull(),
  originalPrice: varchar("original_price", { length: 50 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  endsIn: varchar("ends_in", { length: 50 }).notNull(),
  discount: varchar("discount", { length: 50 }).notNull(),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLastMinuteOfferSchema = createInsertSchema(lastMinuteOffers).omit({ id: true, createdAt: true });
export type LastMinuteOffer = typeof lastMinuteOffers.$inferSelect;
export type InsertLastMinuteOffer = z.infer<typeof insertLastMinuteOfferSchema>;

// Bookings enums and table
export const bookingStatusEnum = pgEnum('booking_status', ['Confirmed', 'Pending', 'Cancelled']);

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey(),
  customer: varchar("customer", { length: 255 }).notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  date: date("date").notNull(),
  status: bookingStatusEnum("status").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Reviews enums and table
export const reviewItemTypeEnum = pgEnum('review_item_type', ['trip', 'hotel', 'car', 'offer']);
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  itemId: varchar("item_id", { length: 255 }).notNull(),
  itemType: reviewItemTypeEnum("item_type").notNull(),
  itemTitle: varchar("item_title", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  status: reviewStatusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Support tickets enums and table
export const ticketStatusEnum = pgEnum('ticket_status', ['Open', 'In Progress', 'Closed']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['Low', 'Medium', 'High']);
export const ticketReplySenderEnum = pgEnum('ticket_reply_sender', ['user', 'support']);

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  status: ticketStatusEnum("status").default('Open'),
  priority: ticketPriorityEnum("priority").default('Medium'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ticketReplies = pgTable("ticket_replies", {
  id: varchar("id").primaryKey(),
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  sender: ticketReplySenderEnum("sender").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTicketsRelations = relations(supportTickets, ({ many }) => ({
  replies: many(ticketReplies),
}));

export const ticketRepliesRelations = relations(ticketReplies, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketReplies.ticketId],
    references: [supportTickets.id],
  }),
}));

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true });
export const insertTicketReplySchema = createInsertSchema(ticketReplies).omit({ id: true, createdAt: true });
export type SupportTicket = typeof supportTickets.$inferSelect;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;

// Payment settings table
export const paymentSettings = pgTable("payment_settings", {
  id: varchar("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull().unique(),
  enabled: boolean("enabled").default(false),
  secretKey: text("secret_key"),
  publishableKey: text("publishable_key"),
  webhookSecret: text("webhook_secret"),
  additionalConfig: json("additional_config"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PaymentSettings = typeof paymentSettings.$inferSelect;

// Subscribers table
export const subscriberStatusEnum = pgEnum('subscriber_status', ['active', 'unsubscribed']);

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  status: subscriberStatusEnum("status").default('active'),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({ id: true, subscribedAt: true });
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;

// Email templates table
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  variables: json("variables").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Email settings table
export const emailSettings = pgTable("email_settings", {
  id: varchar("id").primaryKey(),
  enabled: boolean("enabled").default(false),
  host: varchar("host", { length: 255 }),
  port: integer("port"),
  secure: boolean("secure").default(false),
  username: varchar("username", { length: 255 }),
  password: text("password"),
  fromEmail: varchar("from_email", { length: 255 }),
  fromName: varchar("from_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmailSettings = typeof emailSettings.$inferSelect;
