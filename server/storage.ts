import { db } from "./db";
import { randomUUID } from "crypto";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  users, 
  trips, 
  hotels, 
  roomTypes,
  cars, 
  lastMinuteOffers, 
  bookings, 
  reviews, 
  supportTickets,
  ticketReplies,
  paymentSettings,
  subscribers,
  emailTemplates,
  emailSettings
} from "@shared/schema";

export interface User {
  id: string;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

export interface Trip {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  duration: string;
  category: string;
  features: string[];
}

export interface RoomType {
  id: string;
  name: string;
  price: string;
  description: string;
  facilities: string[];
}

export interface Hotel {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  amenities: string[];
  alwaysAvailable: boolean;
  isActive: boolean;
  availableFrom?: string;
  availableTo?: string;
  roomTypes?: RoomType[];
}

export interface Car {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  rating: number;
  specs: string;
  features: string[];
}

export interface LastMinuteOffer {
  id: string;
  title: string;
  location: string;
  image: string;
  price: string;
  originalPrice: string;
  rating: number;
  endsIn: string;
  discount: string;
}

export interface Booking {
  id: string;
  customer: string;
  item: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  amount: string;
}

export interface Review {
  id: string;
  itemId: string;
  itemType: 'trip' | 'hotel' | 'car' | 'offer';
  itemTitle: string;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface TicketReply {
  id: string;
  sender: 'user' | 'support';
  message: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Closed';
  date: string;
  priority: 'Low' | 'Medium' | 'High';
  userEmail: string;
  replies: TicketReply[];
}

export interface PaymentSettings {
  id: string;
  provider: string;
  enabled: boolean;
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
  additionalConfig?: Record<string, any>;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailSettings {
  id: string;
  enabled: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTrips(): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | undefined>;
  createTrip(trip: Omit<Trip, 'id'>): Promise<Trip>;
  updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;
  
  getHotels(): Promise<Hotel[]>;
  getHotelById(id: string): Promise<Hotel | undefined>;
  createHotel(hotel: Omit<Hotel, 'id'>): Promise<Hotel>;
  updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel | undefined>;
  deleteHotel(id: string): Promise<boolean>;
  
  getCars(): Promise<Car[]>;
  getCarById(id: string): Promise<Car | undefined>;
  createCar(car: Omit<Car, 'id'>): Promise<Car>;
  updateCar(id: string, car: Partial<Car>): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
  
  getLastMinuteOffers(): Promise<LastMinuteOffer[]>;
  createOffer(offer: Omit<LastMinuteOffer, 'id'>): Promise<LastMinuteOffer>;
  updateOffer(id: string, offer: Partial<LastMinuteOffer>): Promise<LastMinuteOffer | undefined>;
  deleteOffer(id: string): Promise<boolean>;
  
  getBookings(): Promise<Booking[]>;
  createBooking(booking: Omit<Booking, 'id'>): Promise<Booking>;
  updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
  
  getReviews(): Promise<Review[]>;
  getReviewsByItem(itemId: string, itemType: string): Promise<Review[]>;
  getApprovedReviewsByItem(itemId: string, itemType: string): Promise<Review[]>;
  createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
  updateReview(id: string, review: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | undefined>;
  updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  
  getTickets(): Promise<SupportTicket[]>;
  getTicketsByUser(userEmail: string): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket | undefined>;
  createTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'replies' | 'status'>): Promise<SupportTicket>;
  updateTicketStatus(id: string, status: 'Open' | 'In Progress' | 'Closed'): Promise<SupportTicket | undefined>;
  addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'date'>): Promise<TicketReply>;
  deleteTicket(id: string): Promise<boolean>;
  
  getPaymentSettings(): Promise<PaymentSettings[]>;
  getPaymentSettingByProvider(provider: string): Promise<PaymentSettings | undefined>;
  updatePaymentSettings(provider: string, settings: Partial<PaymentSettings>): Promise<PaymentSettings | undefined>;
  
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getSubscriberById(id: string): Promise<Subscriber | undefined>;
  createSubscriber(email: string, name?: string): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<boolean>;
  unsubscribeSubscriber(email: string): Promise<boolean>;
  
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;
  
  getEmailSettings(): Promise<EmailSettings | undefined>;
  updateEmailSettings(settings: Partial<Omit<EmailSettings, 'id'>>): Promise<EmailSettings | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db.insert(users).values({ id, ...insertUser }).returning();
    return user;
  }

  async getTrips(): Promise<Trip[]> {
    const result = await db.select().from(trips);
    return result.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      duration: row.duration,
      category: row.category,
      features: row.features as string[]
    }));
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    const result = await db.select().from(trips).where(eq(trips.id, id));
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      duration: row.duration,
      category: row.category,
      features: row.features as string[]
    };
  }

  async createTrip(trip: Omit<Trip, 'id'>): Promise<Trip> {
    const id = `t${Date.now()}`;
    await db.insert(trips).values({
      id,
      title: trip.title,
      location: trip.location,
      image: trip.image,
      price: trip.price,
      rating: trip.rating.toString(),
      duration: trip.duration,
      category: trip.category,
      features: trip.features
    });
    return { id, ...trip };
  }

  async updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined> {
    const existing = await this.getTripById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...trip };
    await db.update(trips)
      .set({
        title: updated.title,
        location: updated.location,
        image: updated.image,
        price: updated.price,
        rating: updated.rating.toString(),
        duration: updated.duration,
        category: updated.category,
        features: updated.features
      })
      .where(eq(trips.id, id));
    return updated;
  }

  async deleteTrip(id: string): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getHotels(): Promise<Hotel[]> {
    const result = await db.query.hotels.findMany({
      with: {
        roomTypes: true
      }
    });
    
    return result.map(hotel => ({
      id: hotel.id,
      title: hotel.title,
      location: hotel.location,
      image: hotel.image,
      price: hotel.price,
      rating: parseFloat(hotel.rating),
      amenities: hotel.amenities as string[],
      alwaysAvailable: hotel.alwaysAvailable ?? true,
      isActive: hotel.isActive ?? true,
      availableFrom: hotel.availableFrom || undefined,
      availableTo: hotel.availableTo || undefined,
      roomTypes: hotel.roomTypes.length > 0 ? hotel.roomTypes.map(rt => ({
        id: rt.id,
        name: rt.name,
        price: rt.price,
        description: rt.description || '',
        facilities: rt.facilities as string[]
      })) : undefined
    }));
  }

  async getHotelById(id: string): Promise<Hotel | undefined> {
    const result = await db.query.hotels.findFirst({
      where: eq(hotels.id, id),
      with: {
        roomTypes: true
      }
    });
    
    if (!result) return undefined;
    
    return {
      id: result.id,
      title: result.title,
      location: result.location,
      image: result.image,
      price: result.price,
      rating: parseFloat(result.rating),
      amenities: result.amenities as string[],
      alwaysAvailable: result.alwaysAvailable ?? true,
      isActive: result.isActive ?? true,
      availableFrom: result.availableFrom || undefined,
      availableTo: result.availableTo || undefined,
      roomTypes: result.roomTypes.length > 0 ? result.roomTypes.map(rt => ({
        id: rt.id,
        name: rt.name,
        price: rt.price,
        description: rt.description || '',
        facilities: rt.facilities as string[]
      })) : undefined
    };
  }

  async createHotel(hotel: Omit<Hotel, 'id'>): Promise<Hotel> {
    const id = `h${Date.now()}`;
    await db.insert(hotels).values({
      id,
      title: hotel.title,
      location: hotel.location,
      image: hotel.image,
      price: hotel.price,
      rating: hotel.rating.toString(),
      amenities: hotel.amenities,
      alwaysAvailable: hotel.alwaysAvailable,
      isActive: hotel.isActive,
      availableFrom: hotel.availableFrom || null,
      availableTo: hotel.availableTo || null
    });

    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      for (const room of hotel.roomTypes) {
        const roomId = room.id || `rt${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
        await db.insert(roomTypes).values({
          id: roomId,
          hotelId: id,
          name: room.name,
          price: room.price,
          description: room.description || '',
          facilities: room.facilities
        });
      }
    }

    return { id, ...hotel };
  }

  async updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel | undefined> {
    const existing = await this.getHotelById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...hotel };
    await db.update(hotels)
      .set({
        title: updated.title,
        location: updated.location,
        image: updated.image,
        price: updated.price,
        rating: updated.rating.toString(),
        amenities: updated.amenities,
        alwaysAvailable: updated.alwaysAvailable,
        isActive: updated.isActive,
        availableFrom: updated.availableFrom || null,
        availableTo: updated.availableTo || null
      })
      .where(eq(hotels.id, id));

    if (hotel.roomTypes !== undefined) {
      await db.delete(roomTypes).where(eq(roomTypes.hotelId, id));
      
      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        for (const room of hotel.roomTypes) {
          const roomId = room.id || `rt${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
          await db.insert(roomTypes).values({
            id: roomId,
            hotelId: id,
            name: room.name,
            price: room.price,
            description: room.description || '',
            facilities: room.facilities
          });
        }
      }
    }

    return this.getHotelById(id);
  }

  async deleteHotel(id: string): Promise<boolean> {
    const result = await db.delete(hotels).where(eq(hotels.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getCars(): Promise<Car[]> {
    const result = await db.select().from(cars);
    return result.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      specs: row.specs,
      features: row.features as string[]
    }));
  }

  async getCarById(id: string): Promise<Car | undefined> {
    const result = await db.select().from(cars).where(eq(cars.id, id));
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      specs: row.specs,
      features: row.features as string[]
    };
  }

  async createCar(car: Omit<Car, 'id'>): Promise<Car> {
    const id = `c${Date.now()}`;
    await db.insert(cars).values({
      id,
      title: car.title,
      location: car.location,
      image: car.image,
      price: car.price,
      rating: car.rating.toString(),
      specs: car.specs,
      features: car.features
    });
    return { id, ...car };
  }

  async updateCar(id: string, car: Partial<Car>): Promise<Car | undefined> {
    const existing = await this.getCarById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...car };
    await db.update(cars)
      .set({
        title: updated.title,
        location: updated.location,
        image: updated.image,
        price: updated.price,
        rating: updated.rating.toString(),
        specs: updated.specs,
        features: updated.features
      })
      .where(eq(cars.id, id));
    return updated;
  }

  async deleteCar(id: string): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getLastMinuteOffers(): Promise<LastMinuteOffer[]> {
    const result = await db.select().from(lastMinuteOffers);
    return result.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      originalPrice: row.originalPrice,
      rating: parseFloat(row.rating),
      endsIn: row.endsIn,
      discount: row.discount
    }));
  }

  async createOffer(offer: Omit<LastMinuteOffer, 'id'>): Promise<LastMinuteOffer> {
    const id = `lm${Date.now()}`;
    await db.insert(lastMinuteOffers).values({
      id,
      title: offer.title,
      location: offer.location,
      image: offer.image,
      price: offer.price,
      originalPrice: offer.originalPrice,
      rating: offer.rating.toString(),
      endsIn: offer.endsIn,
      discount: offer.discount
    });
    return { id, ...offer };
  }

  async updateOffer(id: string, offer: Partial<LastMinuteOffer>): Promise<LastMinuteOffer | undefined> {
    const result = await db.select().from(lastMinuteOffers).where(eq(lastMinuteOffers.id, id));
    if (result.length === 0) return undefined;
    
    const existing = result[0];
    const updated = {
      id: existing.id,
      title: offer.title ?? existing.title,
      location: offer.location ?? existing.location,
      image: offer.image ?? existing.image,
      price: offer.price ?? existing.price,
      originalPrice: offer.originalPrice ?? existing.originalPrice,
      rating: offer.rating ?? parseFloat(existing.rating),
      endsIn: offer.endsIn ?? existing.endsIn,
      discount: offer.discount ?? existing.discount
    };

    await db.update(lastMinuteOffers)
      .set({
        title: updated.title,
        location: updated.location,
        image: updated.image,
        price: updated.price,
        originalPrice: updated.originalPrice,
        rating: updated.rating.toString(),
        endsIn: updated.endsIn,
        discount: updated.discount
      })
      .where(eq(lastMinuteOffers.id, id));
    return updated;
  }

  async deleteOffer(id: string): Promise<boolean> {
    const result = await db.delete(lastMinuteOffers).where(eq(lastMinuteOffers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getBookings(): Promise<Booking[]> {
    const result = await db.select().from(bookings);
    return result.map(row => ({
      id: row.id,
      customer: row.customer,
      item: row.item,
      date: row.date,
      status: row.status,
      amount: row.amount
    }));
  }

  async createBooking(booking: Omit<Booking, 'id'> & { payment_intent_id?: string }): Promise<Booking> {
    const id = `BKG-${Date.now()}`;
    await db.insert(bookings).values({
      id,
      customer: booking.customer,
      item: booking.item,
      date: booking.date,
      status: booking.status,
      amount: booking.amount,
      paymentIntentId: booking.payment_intent_id || null
    });
    return { id, customer: booking.customer, item: booking.item, date: booking.date, status: booking.status, amount: booking.amount };
  }

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    if (result.length === 0) return undefined;
    
    const existing = result[0];
    const updated = {
      id: existing.id,
      customer: booking.customer ?? existing.customer,
      item: booking.item ?? existing.item,
      date: booking.date ?? existing.date,
      status: booking.status ?? existing.status,
      amount: booking.amount ?? existing.amount
    };

    await db.update(bookings)
      .set({
        customer: updated.customer,
        item: updated.item,
        date: updated.date,
        status: updated.status,
        amount: updated.amount
      })
      .where(eq(bookings.id, id));
    return updated as Booking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getReviews(): Promise<Review[]> {
    const result = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    return result.map(row => ({
      id: row.id,
      itemId: row.itemId,
      itemType: row.itemType,
      itemTitle: row.itemTitle,
      userName: row.userName,
      userEmail: row.userEmail || undefined,
      rating: row.rating,
      comment: row.comment,
      status: row.status || 'pending',
      createdAt: row.createdAt?.toISOString()
    }));
  }

  async getReviewsByItem(itemId: string, itemType: string): Promise<Review[]> {
    const result = await db.select()
      .from(reviews)
      .where(and(eq(reviews.itemId, itemId), eq(reviews.itemType, itemType as any)))
      .orderBy(desc(reviews.createdAt));
    
    return result.map(row => ({
      id: row.id,
      itemId: row.itemId,
      itemType: row.itemType,
      itemTitle: row.itemTitle,
      userName: row.userName,
      userEmail: row.userEmail || undefined,
      rating: row.rating,
      comment: row.comment,
      status: row.status || 'pending',
      createdAt: row.createdAt?.toISOString()
    }));
  }

  async getApprovedReviewsByItem(itemId: string, itemType: string): Promise<Review[]> {
    const result = await db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.itemId, itemId),
          eq(reviews.itemType, itemType as any),
          eq(reviews.status, 'approved')
        )
      )
      .orderBy(desc(reviews.createdAt));
    
    return result.map(row => ({
      id: row.id,
      itemId: row.itemId,
      itemType: row.itemType,
      itemTitle: row.itemTitle,
      userName: row.userName,
      userEmail: row.userEmail || undefined,
      rating: row.rating,
      comment: row.comment,
      status: row.status || 'pending',
      createdAt: row.createdAt?.toISOString()
    }));
  }

  async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const id = `rev-${Date.now()}`;
    const [created] = await db.insert(reviews)
      .values({
        id,
        itemId: review.itemId,
        itemType: review.itemType as any,
        itemTitle: review.itemTitle,
        userName: review.userName,
        userEmail: review.userEmail || null,
        rating: review.rating,
        comment: review.comment,
        status: review.status as any
      })
      .returning();
    
    return {
      id: created.id,
      itemId: created.itemId,
      itemType: created.itemType,
      itemTitle: created.itemTitle,
      userName: created.userName,
      userEmail: created.userEmail || undefined,
      rating: created.rating,
      comment: created.comment,
      status: created.status || 'pending',
      createdAt: created.createdAt?.toISOString()
    };
  }

  async updateReview(id: string, review: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id));
    if (result.length === 0) return undefined;
    
    const updateData: any = {};
    if (review.rating !== undefined) updateData.rating = review.rating;
    if (review.comment !== undefined) updateData.comment = review.comment;
    if (review.status !== undefined) updateData.status = review.status;
    
    if (Object.keys(updateData).length === 0) {
      const row = result[0];
      return {
        id: row.id,
        itemId: row.itemId,
        itemType: row.itemType,
        itemTitle: row.itemTitle,
        userName: row.userName,
        userEmail: row.userEmail || undefined,
        rating: row.rating,
        comment: row.comment,
        status: row.status || 'pending',
        createdAt: row.createdAt?.toISOString()
      };
    }

    const [updated] = await db.update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();
    
    return {
      id: updated.id,
      itemId: updated.itemId,
      itemType: updated.itemType,
      itemTitle: updated.itemTitle,
      userName: updated.userName,
      userEmail: updated.userEmail || undefined,
      rating: updated.rating,
      comment: updated.comment,
      status: updated.status || 'pending',
      createdAt: updated.createdAt?.toISOString()
    };
  }

  async updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id));
    if (result.length === 0) return undefined;

    const [updated] = await db.update(reviews)
      .set({ status: status as any })
      .where(eq(reviews.id, id))
      .returning();
    
    return {
      id: updated.id,
      itemId: updated.itemId,
      itemType: updated.itemType,
      itemTitle: updated.itemTitle,
      userName: updated.userName,
      userEmail: updated.userEmail || undefined,
      rating: updated.rating,
      comment: updated.comment,
      status: updated.status || 'pending',
      createdAt: updated.createdAt?.toISOString()
    };
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getTickets(): Promise<SupportTicket[]> {
    const result = await db.query.supportTickets.findMany({
      with: {
        replies: true
      },
      orderBy: desc(supportTickets.createdAt)
    });
    
    return result.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status || 'Open',
      date: ticket.createdAt?.toISOString() || new Date().toISOString(),
      priority: ticket.priority || 'Medium',
      userEmail: ticket.userEmail,
      replies: ticket.replies.map(reply => ({
        id: reply.id,
        sender: reply.sender,
        message: reply.message,
        date: reply.createdAt?.toISOString() || new Date().toISOString()
      }))
    }));
  }

  async getTicketsByUser(userEmail: string): Promise<SupportTicket[]> {
    const result = await db.query.supportTickets.findMany({
      where: eq(supportTickets.userEmail, userEmail),
      with: {
        replies: true
      },
      orderBy: desc(supportTickets.createdAt)
    });
    
    return result.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status || 'Open',
      date: ticket.createdAt?.toISOString() || new Date().toISOString(),
      priority: ticket.priority || 'Medium',
      userEmail: ticket.userEmail,
      replies: ticket.replies.map(reply => ({
        id: reply.id,
        sender: reply.sender,
        message: reply.message,
        date: reply.createdAt?.toISOString() || new Date().toISOString()
      }))
    }));
  }

  async getTicketById(id: string): Promise<SupportTicket | undefined> {
    const result = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, id),
      with: {
        replies: true
      }
    });
    
    if (!result) return undefined;
    
    return {
      id: result.id,
      subject: result.subject,
      status: result.status || 'Open',
      date: result.createdAt?.toISOString() || new Date().toISOString(),
      priority: result.priority || 'Medium',
      userEmail: result.userEmail,
      replies: result.replies.map(reply => ({
        id: reply.id,
        sender: reply.sender,
        message: reply.message,
        date: reply.createdAt?.toISOString() || new Date().toISOString()
      }))
    };
  }

  async createTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'replies' | 'status'>): Promise<SupportTicket> {
    const id = randomUUID();
    const [created] = await db.insert(supportTickets)
      .values({
        id,
        subject: ticket.subject,
        userEmail: ticket.userEmail,
        priority: ticket.priority as any,
        status: 'Open'
      })
      .returning();
    
    return {
      id: created.id,
      subject: created.subject,
      status: created.status || 'Open',
      date: created.createdAt?.toISOString() || new Date().toISOString(),
      priority: created.priority || 'Medium',
      userEmail: created.userEmail,
      replies: []
    };
  }

  async updateTicketStatus(id: string, status: 'Open' | 'In Progress' | 'Closed'): Promise<SupportTicket | undefined> {
    const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    if (result.length === 0) return undefined;

    await db.update(supportTickets)
      .set({ status: status as any })
      .where(eq(supportTickets.id, id));
    
    return this.getTicketById(id);
  }

  async addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'date'>): Promise<TicketReply> {
    const id = randomUUID();
    const [created] = await db.insert(ticketReplies)
      .values({
        id,
        ticketId,
        sender: reply.sender as any,
        message: reply.message
      })
      .returning();
    
    return {
      id: created.id,
      sender: created.sender,
      message: created.message,
      date: created.createdAt?.toISOString() || new Date().toISOString()
    };
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPaymentSettings(): Promise<PaymentSettings[]> {
    const result = await db.select().from(paymentSettings);
    return result.map(row => ({
      id: row.id,
      provider: row.provider,
      enabled: row.enabled ?? false,
      secretKey: row.secretKey || '',
      publishableKey: row.publishableKey || '',
      webhookSecret: row.webhookSecret || undefined,
      additionalConfig: (row.additionalConfig as Record<string, any>) || undefined
    }));
  }

  async getPaymentSettingByProvider(provider: string): Promise<PaymentSettings | undefined> {
    const result = await db.select().from(paymentSettings).where(eq(paymentSettings.provider, provider));
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      provider: row.provider,
      enabled: row.enabled ?? false,
      secretKey: row.secretKey || '',
      publishableKey: row.publishableKey || '',
      webhookSecret: row.webhookSecret || undefined,
      additionalConfig: (row.additionalConfig as Record<string, any>) || undefined
    };
  }

  async updatePaymentSettings(provider: string, settings: Partial<PaymentSettings>): Promise<PaymentSettings | undefined> {
    const result = await db.select().from(paymentSettings).where(eq(paymentSettings.provider, provider));
    if (result.length === 0) return undefined;

    const updateData: any = {};
    if (settings.enabled !== undefined) updateData.enabled = settings.enabled;
    if (settings.secretKey !== undefined) updateData.secretKey = settings.secretKey;
    if (settings.publishableKey !== undefined) updateData.publishableKey = settings.publishableKey;
    if (settings.webhookSecret !== undefined) updateData.webhookSecret = settings.webhookSecret;
    if (settings.additionalConfig !== undefined) updateData.additionalConfig = settings.additionalConfig;

    if (Object.keys(updateData).length === 0) {
      return this.getPaymentSettingByProvider(provider);
    }

    await db.update(paymentSettings)
      .set(updateData)
      .where(eq(paymentSettings.provider, provider));

    return this.getPaymentSettingByProvider(provider);
  }

  async getSubscribers(): Promise<Subscriber[]> {
    const result = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt));
    return result.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribedAt?.toISOString() || new Date().toISOString(),
      status: row.status || 'active'
    }));
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const result = await db.select().from(subscribers).where(eq(subscribers.email, email));
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribedAt?.toISOString() || new Date().toISOString(),
      status: row.status || 'active'
    };
  }

  async createSubscriber(email: string, name?: string): Promise<Subscriber> {
    const existing = await this.getSubscriberByEmail(email);
    if (existing) {
      if (existing.status === 'unsubscribed') {
        await db.update(subscribers)
          .set({ status: 'active', name: name || existing.name })
          .where(eq(subscribers.email, email));
        return { ...existing, status: 'active', name: name || existing.name };
      }
      return existing;
    }

    const id = randomUUID();
    await db.insert(subscribers).values({
      id,
      email,
      name: name || null,
      status: 'active'
    });
    
    return {
      id,
      email,
      name: name || undefined,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    const result = await db.delete(subscribers).where(eq(subscribers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async unsubscribeSubscriber(email: string): Promise<boolean> {
    const result = await db.update(subscribers)
      .set({ status: 'unsubscribed' })
      .where(eq(subscribers.email, email));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSubscriberById(id: string): Promise<Subscriber | undefined> {
    const result = await db.select().from(subscribers).where(eq(subscribers.id, id));
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribedAt?.toISOString() || new Date().toISOString(),
      status: row.status || 'active'
    };
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const result = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
    return result.map(row => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      variables: (row.variables as string[]) || [],
      createdAt: row.createdAt?.toISOString() || undefined,
      updatedAt: row.updatedAt?.toISOString() || undefined
    }));
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate | undefined> {
    const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      variables: (row.variables as string[]) || [],
      createdAt: row.createdAt?.toISOString() || undefined,
      updatedAt: row.updatedAt?.toISOString() || undefined
    };
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const id = randomUUID();
    await db.insert(emailTemplates).values({
      id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      variables: template.variables || []
    });
    
    return {
      id,
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateEmailTemplate(id: string, template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmailTemplate | undefined> {
    const existing = await this.getEmailTemplateById(id);
    if (!existing) return undefined;

    const updateData: any = {};
    if (template.name !== undefined) updateData.name = template.name;
    if (template.subject !== undefined) updateData.subject = template.subject;
    if (template.body !== undefined) updateData.body = template.body;
    if (template.variables !== undefined) updateData.variables = template.variables;

    if (Object.keys(updateData).length === 0) return existing;

    await db.update(emailTemplates)
      .set(updateData)
      .where(eq(emailTemplates.id, id));

    return { ...existing, ...template };
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const result = await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getEmailSettings(): Promise<EmailSettings | undefined> {
    const result = await db.select().from(emailSettings).limit(1);
    if (result.length === 0) return undefined;
    const row = result[0];
    return {
      id: row.id,
      enabled: row.enabled ?? false,
      host: row.host || undefined,
      port: row.port || undefined,
      secure: row.secure ?? false,
      username: row.username || undefined,
      password: row.password || undefined,
      fromEmail: row.fromEmail || undefined,
      fromName: row.fromName || undefined
    };
  }

  async updateEmailSettings(settings: Partial<Omit<EmailSettings, 'id'>>): Promise<EmailSettings | undefined> {
    const existing = await this.getEmailSettings();
    if (!existing) {
      const id = randomUUID();
      await db.insert(emailSettings).values({
        id,
        enabled: settings.enabled ?? false,
        host: settings.host || null,
        port: settings.port || null,
        secure: settings.secure ?? false,
        username: settings.username || null,
        password: settings.password || null,
        fromEmail: settings.fromEmail || null,
        fromName: settings.fromName || null
      });
      return this.getEmailSettings();
    }

    const updateData: any = {};
    if (settings.enabled !== undefined) updateData.enabled = settings.enabled;
    if (settings.host !== undefined) updateData.host = settings.host || null;
    if (settings.port !== undefined) updateData.port = settings.port || null;
    if (settings.secure !== undefined) updateData.secure = settings.secure;
    if (settings.username !== undefined) updateData.username = settings.username || null;
    if (settings.password !== undefined) updateData.password = settings.password || null;
    if (settings.fromEmail !== undefined) updateData.fromEmail = settings.fromEmail || null;
    if (settings.fromName !== undefined) updateData.fromName = settings.fromName || null;

    if (Object.keys(updateData).length === 0) return existing;

    await db.update(emailSettings)
      .set(updateData)
      .where(eq(emailSettings.id, existing.id));

    return this.getEmailSettings();
  }
}

export const storage = new DatabaseStorage();
