import { pool } from "./db";
import { randomUUID } from "crypto";
import type { RowDataPacket } from 'mysql2';

// Types
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
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trips
  getTrips(): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | undefined>;
  createTrip(trip: Omit<Trip, 'id'>): Promise<Trip>;
  updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;
  
  // Hotels
  getHotels(): Promise<Hotel[]>;
  getHotelById(id: string): Promise<Hotel | undefined>;
  createHotel(hotel: Omit<Hotel, 'id'>): Promise<Hotel>;
  updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel | undefined>;
  deleteHotel(id: string): Promise<boolean>;
  
  // Cars
  getCars(): Promise<Car[]>;
  getCarById(id: string): Promise<Car | undefined>;
  createCar(car: Omit<Car, 'id'>): Promise<Car>;
  updateCar(id: string, car: Partial<Car>): Promise<Car | undefined>;
  deleteCar(id: string): Promise<boolean>;
  
  // Last Minute Offers
  getLastMinuteOffers(): Promise<LastMinuteOffer[]>;
  createOffer(offer: Omit<LastMinuteOffer, 'id'>): Promise<LastMinuteOffer>;
  updateOffer(id: string, offer: Partial<LastMinuteOffer>): Promise<LastMinuteOffer | undefined>;
  deleteOffer(id: string): Promise<boolean>;
  
  // Bookings
  getBookings(): Promise<Booking[]>;
  createBooking(booking: Omit<Booking, 'id'>): Promise<Booking>;
  updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;
  
  // Reviews
  getReviews(): Promise<Review[]>;
  getReviewsByItem(itemId: string, itemType: string): Promise<Review[]>;
  getApprovedReviewsByItem(itemId: string, itemType: string): Promise<Review[]>;
  createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
  updateReview(id: string, review: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | undefined>;
  updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  
  // Support Tickets
  getTickets(): Promise<SupportTicket[]>;
  getTicketsByUser(userEmail: string): Promise<SupportTicket[]>;
  getTicketById(id: string): Promise<SupportTicket | undefined>;
  createTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'replies' | 'status'>): Promise<SupportTicket>;
  updateTicketStatus(id: string, status: 'Open' | 'In Progress' | 'Closed'): Promise<SupportTicket | undefined>;
  addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'date'>): Promise<TicketReply>;
  deleteTicket(id: string): Promise<boolean>;
  
  // Payment Settings
  getPaymentSettings(): Promise<PaymentSettings[]>;
  getPaymentSettingByProvider(provider: string): Promise<PaymentSettings | undefined>;
  updatePaymentSettings(provider: string, settings: Partial<PaymentSettings>): Promise<PaymentSettings | undefined>;
  
  // Subscribers
  getSubscribers(): Promise<Subscriber[]>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getSubscriberById(id: string): Promise<Subscriber | undefined>;
  createSubscriber(email: string, name?: string): Promise<Subscriber>;
  deleteSubscriber(id: string): Promise<boolean>;
  unsubscribeSubscriber(email: string): Promise<boolean>;
  
  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplateById(id: string): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, template: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<EmailTemplate | undefined>;
  deleteEmailTemplate(id: string): Promise<boolean>;
  
  // Email Settings
  getEmailSettings(): Promise<EmailSettings | undefined>;
  updateEmailSettings(settings: Partial<Omit<EmailSettings, 'id'>>): Promise<EmailSettings | undefined>;
}

export class MySQLStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    await pool.execute(
      'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
      [id, insertUser.username, insertUser.password]
    );
    return { id, ...insertUser };
  }

  // Trips
  async getTrips(): Promise<Trip[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM trips');
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      duration: row.duration,
      category: row.category,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
    }));
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM trips WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      duration: row.duration,
      category: row.category,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
    };
  }

  async createTrip(trip: Omit<Trip, 'id'>): Promise<Trip> {
    const id = `t${Date.now()}`;
    await pool.execute(
      `INSERT INTO trips (id, title, location, image, price, rating, duration, category, features) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, trip.title, trip.location, trip.image, trip.price, trip.rating, trip.duration, trip.category, JSON.stringify(trip.features)]
    );
    return { id, ...trip };
  }

  async updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined> {
    const existing = await this.getTripById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...trip };
    await pool.execute(
      `UPDATE trips SET title = ?, location = ?, image = ?, price = ?, rating = ?, duration = ?, category = ?, features = ? WHERE id = ?`,
      [updated.title, updated.location, updated.image, updated.price, updated.rating, updated.duration, updated.category, JSON.stringify(updated.features), id]
    );
    return updated;
  }

  async deleteTrip(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM trips WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Hotels
  async getHotels(): Promise<Hotel[]> {
    const [hotelRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM hotels');
    const hotels: Hotel[] = [];
    
    for (const row of hotelRows) {
      const [roomRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM room_types WHERE hotel_id = ?',
        [row.id]
      );
      
      const roomTypes: RoomType[] = roomRows.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        description: r.description,
        facilities: typeof r.facilities === 'string' ? JSON.parse(r.facilities) : r.facilities
      }));
      
      hotels.push({
        id: row.id,
        title: row.title,
        location: row.location,
        image: row.image,
        price: row.price,
        rating: parseFloat(row.rating),
        amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities,
        alwaysAvailable: Boolean(row.always_available),
        isActive: Boolean(row.is_active),
        availableFrom: row.available_from,
        availableTo: row.available_to,
        roomTypes: roomTypes.length > 0 ? roomTypes : undefined
      });
    }
    
    return hotels;
  }

  async getHotelById(id: string): Promise<Hotel | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM hotels WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    const [roomRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM room_types WHERE hotel_id = ?',
      [id]
    );
    
    const roomTypes: RoomType[] = roomRows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      description: r.description,
      facilities: typeof r.facilities === 'string' ? JSON.parse(r.facilities) : r.facilities
    }));
    
    return {
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities,
      alwaysAvailable: Boolean(row.always_available),
      isActive: Boolean(row.is_active),
      availableFrom: row.available_from,
      availableTo: row.available_to,
      roomTypes: roomTypes.length > 0 ? roomTypes : undefined
    };
  }

  async createHotel(hotel: Omit<Hotel, 'id'>): Promise<Hotel> {
    const id = `h${Date.now()}`;
    await pool.execute(
      `INSERT INTO hotels (id, title, location, image, price, rating, amenities, always_available, is_active, available_from, available_to) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, hotel.title, hotel.location, hotel.image, hotel.price, hotel.rating, JSON.stringify(hotel.amenities), hotel.alwaysAvailable, hotel.isActive, hotel.availableFrom || null, hotel.availableTo || null]
    );

    // Insert room types if any
    if (hotel.roomTypes && hotel.roomTypes.length > 0) {
      for (const room of hotel.roomTypes) {
        const roomId = room.id || `rt${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
        await pool.execute(
          `INSERT INTO room_types (id, hotel_id, name, price, description, facilities) VALUES (?, ?, ?, ?, ?, ?)`,
          [roomId, id, room.name, room.price, room.description || '', JSON.stringify(room.facilities)]
        );
      }
    }

    return { id, ...hotel };
  }

  async updateHotel(id: string, hotel: Partial<Hotel>): Promise<Hotel | undefined> {
    const existing = await this.getHotelById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...hotel };
    await pool.execute(
      `UPDATE hotels SET title = ?, location = ?, image = ?, price = ?, rating = ?, amenities = ?, always_available = ?, is_active = ?, available_from = ?, available_to = ? WHERE id = ?`,
      [updated.title, updated.location, updated.image, updated.price, updated.rating, JSON.stringify(updated.amenities), updated.alwaysAvailable, updated.isActive, updated.availableFrom || null, updated.availableTo || null, id]
    );

    // Update room types if provided
    if (hotel.roomTypes !== undefined) {
      // Delete existing room types
      await pool.execute('DELETE FROM room_types WHERE hotel_id = ?', [id]);
      
      // Insert new room types
      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
        for (const room of hotel.roomTypes) {
          const roomId = room.id || `rt${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
          await pool.execute(
            `INSERT INTO room_types (id, hotel_id, name, price, description, facilities) VALUES (?, ?, ?, ?, ?, ?)`,
            [roomId, id, room.name, room.price, room.description || '', JSON.stringify(room.facilities)]
          );
        }
      }
    }

    return this.getHotelById(id);
  }

  async deleteHotel(id: string): Promise<boolean> {
    // Room types will be deleted automatically due to CASCADE
    const [result] = await pool.execute<any>('DELETE FROM hotels WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Cars
  async getCars(): Promise<Car[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM cars');
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      specs: row.specs,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
    }));
  }

  async getCarById(id: string): Promise<Car | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM cars WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      rating: parseFloat(row.rating),
      specs: row.specs,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
    };
  }

  async createCar(car: Omit<Car, 'id'>): Promise<Car> {
    const id = `c${Date.now()}`;
    await pool.execute(
      `INSERT INTO cars (id, title, location, image, price, rating, specs, features) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, car.title, car.location, car.image, car.price, car.rating, car.specs, JSON.stringify(car.features)]
    );
    return { id, ...car };
  }

  async updateCar(id: string, car: Partial<Car>): Promise<Car | undefined> {
    const existing = await this.getCarById(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...car };
    await pool.execute(
      `UPDATE cars SET title = ?, location = ?, image = ?, price = ?, rating = ?, specs = ?, features = ? WHERE id = ?`,
      [updated.title, updated.location, updated.image, updated.price, updated.rating, updated.specs, JSON.stringify(updated.features), id]
    );
    return updated;
  }

  async deleteCar(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM cars WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Last Minute Offers
  async getLastMinuteOffers(): Promise<LastMinuteOffer[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM last_minute_offers');
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      image: row.image,
      price: row.price,
      originalPrice: row.original_price,
      rating: parseFloat(row.rating),
      endsIn: row.ends_in,
      discount: row.discount
    }));
  }

  async createOffer(offer: Omit<LastMinuteOffer, 'id'>): Promise<LastMinuteOffer> {
    const id = `lm${Date.now()}`;
    await pool.execute(
      `INSERT INTO last_minute_offers (id, title, location, image, price, original_price, rating, ends_in, discount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, offer.title, offer.location, offer.image, offer.price, offer.originalPrice, offer.rating, offer.endsIn, offer.discount]
    );
    return { id, ...offer };
  }

  async updateOffer(id: string, offer: Partial<LastMinuteOffer>): Promise<LastMinuteOffer | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM last_minute_offers WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    
    const existing = rows[0];
    const updated = {
      id: existing.id,
      title: offer.title ?? existing.title,
      location: offer.location ?? existing.location,
      image: offer.image ?? existing.image,
      price: offer.price ?? existing.price,
      originalPrice: offer.originalPrice ?? existing.original_price,
      rating: offer.rating ?? parseFloat(existing.rating),
      endsIn: offer.endsIn ?? existing.ends_in,
      discount: offer.discount ?? existing.discount
    };

    await pool.execute(
      `UPDATE last_minute_offers SET title = ?, location = ?, image = ?, price = ?, original_price = ?, rating = ?, ends_in = ?, discount = ? WHERE id = ?`,
      [updated.title, updated.location, updated.image, updated.price, updated.originalPrice, updated.rating, updated.endsIn, updated.discount, id]
    );
    return updated;
  }

  async deleteOffer(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM last_minute_offers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM bookings');
    return rows.map(row => ({
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
    await pool.execute(
      'INSERT INTO bookings (id, customer, item, date, status, amount, payment_intent_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, booking.customer, booking.item, booking.date, booking.status, booking.amount, booking.payment_intent_id || null]
    );
    return { id, ...booking };
  }

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM bookings WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    
    const existing = rows[0];
    const updated = {
      id: existing.id,
      customer: booking.customer ?? existing.customer,
      item: booking.item ?? existing.item,
      date: booking.date ?? existing.date,
      status: booking.status ?? existing.status,
      amount: booking.amount ?? existing.amount
    };

    await pool.execute(
      `UPDATE bookings SET customer = ?, item = ?, date = ?, status = ?, amount = ? WHERE id = ?`,
      [updated.customer, updated.item, updated.date, updated.status, updated.amount, id]
    );
    return updated as Booking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM bookings WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM reviews ORDER BY created_at DESC');
    return rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      comment: row.comment,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  async getReviewsByItem(itemId: string, itemType: string): Promise<Review[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE item_id = ? AND item_type = ? ORDER BY created_at DESC',
      [itemId, itemType]
    );
    return rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      comment: row.comment,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  async getApprovedReviewsByItem(itemId: string, itemType: string): Promise<Review[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM reviews WHERE item_id = ? AND item_type = ? AND status = "approved" ORDER BY created_at DESC',
      [itemId, itemType]
    );
    return rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      comment: row.comment,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const id = `rev-${Date.now()}`;
    await pool.execute(
      `INSERT INTO reviews (id, item_id, item_type, item_title, user_name, user_email, rating, comment, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, review.itemId, review.itemType, review.itemTitle, review.userName, review.userEmail || null, review.rating, review.comment, review.status]
    );
    return { id, ...review };
  }

  async updateReview(id: string, review: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (review.rating !== undefined) {
      updates.push('rating = ?');
      values.push(review.rating);
    }
    if (review.comment !== undefined) {
      updates.push('comment = ?');
      values.push(review.comment);
    }
    if (review.status !== undefined) {
      updates.push('status = ?');
      values.push(review.status);
    }
    
    if (updates.length === 0) return undefined;
    
    values.push(id);
    await pool.execute(`UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`, values);
    
    const [updatedRows] = await pool.execute<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [id]);
    const row = updatedRows[0];
    return {
      id: row.id,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      comment: row.comment,
      status: row.status,
      createdAt: row.created_at
    };
  }

  async updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<Review | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    
    await pool.execute('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    
    const row = rows[0];
    return {
      id: row.id,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      rating: row.rating,
      comment: row.comment,
      status: status,
      createdAt: row.created_at
    };
  }

  async deleteReview(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM reviews WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Support Tickets
  async getTickets(): Promise<SupportTicket[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM support_tickets ORDER BY created_at DESC');
    const tickets: SupportTicket[] = [];
    
    for (const row of rows) {
      const [replies] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at DESC',
        [row.id]
      );
      
      tickets.push({
        id: row.id,
        subject: row.subject,
        status: row.status,
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
        priority: row.priority,
        userEmail: row.user_email,
        replies: replies.map(reply => ({
          id: reply.id,
          sender: reply.sender,
          message: reply.message,
          date: reply.created_at ? new Date(reply.created_at).toLocaleString() : ''
        }))
      });
    }
    
    return tickets;
  }

  async getTicketsByUser(userEmail: string): Promise<SupportTicket[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM support_tickets WHERE user_email = ? ORDER BY created_at DESC',
      [userEmail]
    );
    const tickets: SupportTicket[] = [];
    
    for (const row of rows) {
      const [replies] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at DESC',
        [row.id]
      );
      
      tickets.push({
        id: row.id,
        subject: row.subject,
        status: row.status,
        date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
        priority: row.priority,
        userEmail: row.user_email,
        replies: replies.map(reply => ({
          id: reply.id,
          sender: reply.sender,
          message: reply.message,
          date: reply.created_at ? new Date(reply.created_at).toLocaleString() : ''
        }))
      });
    }
    
    return tickets;
  }

  async getTicketById(id: string): Promise<SupportTicket | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM support_tickets WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    const [replies] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC',
      [id]
    );
    
    return {
      id: row.id,
      subject: row.subject,
      status: row.status,
      date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
      priority: row.priority,
      userEmail: row.user_email,
      replies: replies.map(reply => ({
        id: reply.id,
        sender: reply.sender,
        message: reply.message,
        date: reply.created_at ? new Date(reply.created_at).toLocaleString() : ''
      }))
    };
  }

  async createTicket(ticket: Omit<SupportTicket, 'id' | 'date' | 'replies' | 'status'>): Promise<SupportTicket> {
    const id = `TK-${Date.now()}`;
    await pool.execute(
      'INSERT INTO support_tickets (id, user_email, subject, priority, status) VALUES (?, ?, ?, ?, ?)',
      [id, ticket.userEmail, ticket.subject, ticket.priority, 'Open']
    );
    
    // If there's an initial message, add it as the first reply
    return {
      id,
      subject: ticket.subject,
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      priority: ticket.priority,
      userEmail: ticket.userEmail,
      replies: []
    };
  }

  async updateTicketStatus(id: string, status: 'Open' | 'In Progress' | 'Closed'): Promise<SupportTicket | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM support_tickets WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    
    await pool.execute('UPDATE support_tickets SET status = ? WHERE id = ?', [status, id]);
    
    const row = rows[0];
    const [replies] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC',
      [id]
    );
    
    return {
      id: row.id,
      subject: row.subject,
      status: status,
      date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
      priority: row.priority,
      userEmail: row.user_email,
      replies: replies.map(reply => ({
        id: reply.id,
        sender: reply.sender,
        message: reply.message,
        date: reply.created_at ? new Date(reply.created_at).toLocaleString() : ''
      }))
    };
  }

  async addTicketReply(ticketId: string, reply: Omit<TicketReply, 'id' | 'date'>): Promise<TicketReply> {
    const id = `r-${Date.now()}`;
    await pool.execute(
      'INSERT INTO ticket_replies (id, ticket_id, sender, message) VALUES (?, ?, ?, ?)',
      [id, ticketId, reply.sender, reply.message]
    );
    
    return {
      id,
      sender: reply.sender,
      message: reply.message,
      date: new Date().toLocaleString()
    };
  }

  async deleteTicket(id: string): Promise<boolean> {
    // Replies will be deleted automatically due to CASCADE
    const [result] = await pool.execute<any>('DELETE FROM support_tickets WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // ============== PAYMENT SETTINGS ==============
  async getPaymentSettings(): Promise<PaymentSettings[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM payment_settings ORDER BY provider');
    return rows.map(row => ({
      id: row.id,
      provider: row.provider,
      enabled: Boolean(row.enabled),
      secretKey: row.secret_key || '',
      publishableKey: row.publishable_key || '',
      webhookSecret: row.webhook_secret || undefined,
      additionalConfig: row.additional_config && row.additional_config !== 'null' ? (typeof row.additional_config === 'string' ? JSON.parse(row.additional_config) : row.additional_config) : undefined
    }));
  }

  async getPaymentSettingByProvider(provider: string): Promise<PaymentSettings | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM payment_settings WHERE provider = ?',
      [provider]
    );
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      provider: row.provider,
      enabled: Boolean(row.enabled),
      secretKey: row.secret_key || '',
      publishableKey: row.publishable_key || '',
      webhookSecret: row.webhook_secret || undefined,
      additionalConfig: row.additional_config && row.additional_config !== 'null' ? (typeof row.additional_config === 'string' ? JSON.parse(row.additional_config) : row.additional_config) : undefined
    };
  }

  async updatePaymentSettings(provider: string, settings: Partial<PaymentSettings>): Promise<PaymentSettings | undefined> {
    const updates: string[] = [];
    const values: any[] = [];

    if (settings.enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(settings.enabled);
    }
    if (settings.secretKey !== undefined) {
      updates.push('secret_key = ?');
      values.push(settings.secretKey);
    }
    if (settings.publishableKey !== undefined) {
      updates.push('publishable_key = ?');
      values.push(settings.publishableKey);
    }
    if (settings.webhookSecret !== undefined) {
      updates.push('webhook_secret = ?');
      values.push(settings.webhookSecret);
    }
    if (settings.additionalConfig !== undefined) {
      updates.push('additional_config = ?');
      values.push(JSON.stringify(settings.additionalConfig));
    }

    if (updates.length === 0) {
      return this.getPaymentSettingByProvider(provider);
    }

    values.push(provider);
    await pool.execute(
      `UPDATE payment_settings SET ${updates.join(', ')} WHERE provider = ?`,
      values
    );

    return this.getPaymentSettingByProvider(provider);
  }

  // ============== SUBSCRIBERS ==============
  async getSubscribers(): Promise<Subscriber[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
    return rows.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribed_at ? new Date(row.subscribed_at).toISOString() : new Date().toISOString(),
      status: row.status || 'active'
    }));
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM subscribers WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribed_at ? new Date(row.subscribed_at).toISOString() : new Date().toISOString(),
      status: row.status || 'active'
    };
  }

  async createSubscriber(email: string, name?: string): Promise<Subscriber> {
    const existing = await this.getSubscriberByEmail(email);
    if (existing) {
      // If exists but unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        await pool.execute(
          'UPDATE subscribers SET status = ?, name = ? WHERE email = ?',
          ['active', name || existing.name, email]
        );
        return { ...existing, status: 'active', name: name || existing.name };
      }
      return existing; // Already subscribed
    }

    const id = randomUUID();
    await pool.execute(
      'INSERT INTO subscribers (id, email, name, status) VALUES (?, ?, ?, ?)',
      [id, email, name || null, 'active']
    );
    return {
      id,
      email,
      name: name || undefined,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM subscribers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async unsubscribeSubscriber(email: string): Promise<boolean> {
    const [result] = await pool.execute<any>(
      'UPDATE subscribers SET status = ? WHERE email = ?',
      ['unsubscribed', email]
    );
    return result.affectedRows > 0;
  }

  async getSubscriberById(id: string): Promise<Subscriber | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM subscribers WHERE id = ?', [id]);
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name || undefined,
      subscribedAt: row.subscribed_at ? new Date(row.subscribed_at).toISOString() : new Date().toISOString(),
      status: row.status || 'active'
    };
  }

  // ============== EMAIL TEMPLATES ==============
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM email_templates ORDER BY created_at DESC');
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      variables: row.variables ? (typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables) : [],
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined
    }));
  }

  async getEmailTemplateById(id: string): Promise<EmailTemplate | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM email_templates WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      variables: row.variables ? (typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables) : [],
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined
    };
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const id = randomUUID();
    await pool.execute(
      'INSERT INTO email_templates (id, name, subject, body, variables) VALUES (?, ?, ?, ?, ?)',
      [id, template.name, template.subject, template.body, JSON.stringify(template.variables || [])]
    );
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

    const updates: string[] = [];
    const values: any[] = [];

    if (template.name !== undefined) {
      updates.push('name = ?');
      values.push(template.name);
    }
    if (template.subject !== undefined) {
      updates.push('subject = ?');
      values.push(template.subject);
    }
    if (template.body !== undefined) {
      updates.push('body = ?');
      values.push(template.body);
    }
    if (template.variables !== undefined) {
      updates.push('variables = ?');
      values.push(JSON.stringify(template.variables));
    }

    if (updates.length === 0) return existing;

    await pool.execute(
      `UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );

    return { ...existing, ...template };
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const [result] = await pool.execute<any>('DELETE FROM email_templates WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // ============== EMAIL SETTINGS ==============
  async getEmailSettings(): Promise<EmailSettings | undefined> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM email_settings LIMIT 1');
    if (rows.length === 0) return undefined;
    const row = rows[0];
    return {
      id: row.id,
      enabled: Boolean(row.enabled),
      host: row.host || undefined,
      port: row.port || undefined,
      secure: Boolean(row.secure),
      username: row.username || undefined,
      password: row.password || undefined,
      fromEmail: row.from_email || undefined,
      fromName: row.from_name || undefined
    };
  }

  async updateEmailSettings(settings: Partial<Omit<EmailSettings, 'id'>>): Promise<EmailSettings | undefined> {
    const existing = await this.getEmailSettings();
    if (!existing) {
      // Create if doesn't exist
      const id = randomUUID();
      await pool.execute(
        'INSERT INTO email_settings (id, enabled, host, port, secure, username, password, from_email, from_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          settings.enabled ?? false,
          settings.host || null,
          settings.port || null,
          settings.secure ?? false,
          settings.username || null,
          settings.password || null,
          settings.fromEmail || null,
          settings.fromName || null
        ]
      );
      return this.getEmailSettings();
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (settings.enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(settings.enabled);
    }
    if (settings.host !== undefined) {
      updates.push('host = ?');
      values.push(settings.host || null);
    }
    if (settings.port !== undefined) {
      updates.push('port = ?');
      values.push(settings.port || null);
    }
    if (settings.secure !== undefined) {
      updates.push('secure = ?');
      values.push(settings.secure);
    }
    if (settings.username !== undefined) {
      updates.push('username = ?');
      values.push(settings.username || null);
    }
    if (settings.password !== undefined) {
      updates.push('password = ?');
      values.push(settings.password || null);
    }
    if (settings.fromEmail !== undefined) {
      updates.push('from_email = ?');
      values.push(settings.fromEmail || null);
    }
    if (settings.fromName !== undefined) {
      updates.push('from_name = ?');
      values.push(settings.fromName || null);
    }

    if (updates.length === 0) return existing;

    await pool.execute(
      `UPDATE email_settings SET ${updates.join(', ')} WHERE id = ?`,
      [...values, existing.id]
    );

    return this.getEmailSettings();
  }
}

export const storage = new MySQLStorage();
