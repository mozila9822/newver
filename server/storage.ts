import { pool } from "./db";
import { RowDataPacket } from "mysql2/promise";

export interface IStorage {
  getTrips(): Promise<any[]>;
  getTripById(id: string): Promise<any | null>;
  createTrip(trip: any): Promise<any>;
  updateTrip(id: string, trip: any): Promise<any | null>;
  deleteTrip(id: string): Promise<boolean>;

  getHotels(): Promise<any[]>;
  getHotelById(id: string): Promise<any | null>;
  createHotel(hotel: any): Promise<any>;
  updateHotel(id: string, hotel: any): Promise<any | null>;
  deleteHotel(id: string): Promise<boolean>;

  getRoomTypes(hotelId: string): Promise<any[]>;
  createRoomType(roomType: any): Promise<any>;
  updateRoomType(id: string, roomType: any): Promise<any | null>;
  deleteRoomType(id: string): Promise<boolean>;

  getCars(): Promise<any[]>;
  getCarById(id: string): Promise<any | null>;
  createCar(car: any): Promise<any>;
  updateCar(id: string, car: any): Promise<any | null>;
  deleteCar(id: string): Promise<boolean>;

  getLastMinuteOffers(): Promise<any[]>;
  getLastMinuteOfferById(id: string): Promise<any | null>;
  createLastMinuteOffer(offer: any): Promise<any>;
  updateLastMinuteOffer(id: string, offer: any): Promise<any | null>;
  deleteLastMinuteOffer(id: string): Promise<boolean>;

  getBookings(): Promise<any[]>;
  getBookingById(id: string): Promise<any | null>;
  createBooking(booking: any): Promise<any>;
  updateBooking(id: string, booking: any): Promise<any | null>;
  deleteBooking(id: string): Promise<boolean>;

  getReviews(): Promise<any[]>;
  getReviewsByItem(itemId: string, itemType: string): Promise<any[]>;
  getReviewById(id: string): Promise<any | null>;
  createReview(review: any): Promise<any>;
  updateReview(id: string, review: any): Promise<any | null>;
  deleteReview(id: string): Promise<boolean>;

  getSupportTickets(): Promise<any[]>;
  getSupportTicketById(id: string): Promise<any | null>;
  createSupportTicket(ticket: any): Promise<any>;
  updateSupportTicket(id: string, ticket: any): Promise<any | null>;
  deleteSupportTicket(id: string): Promise<boolean>;

  getTicketReplies(ticketId: string): Promise<any[]>;
  createTicketReply(reply: any): Promise<any>;

  getPaymentSettings(): Promise<any | null>;
  updatePaymentSettings(settings: any): Promise<any>;

  getSubscribers(): Promise<any[]>;
  createSubscriber(email: string): Promise<any>;
  deleteSubscriber(id: string): Promise<boolean>;

  getEmailTemplates(): Promise<any[]>;
  getEmailTemplateById(id: string): Promise<any | null>;
  createEmailTemplate(template: any): Promise<any>;
  updateEmailTemplate(id: string, template: any): Promise<any | null>;
  deleteEmailTemplate(id: string): Promise<boolean>;

  getEmailSettings(): Promise<any | null>;
  updateEmailSettings(settings: any): Promise<any>;

  getUserByUsername(username: string): Promise<any | null>;
  createUser(user: any): Promise<any>;
}

class MySQLStorage implements IStorage {
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async getTrips(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM trips");
    return rows.map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
    }));
  }

  async getTripById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM trips WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
    };
  }

  async createTrip(trip: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO trips (id, title, location, image, price, rating, duration, category, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, trip.title, trip.location, trip.image, trip.price, trip.rating, trip.duration, trip.category, JSON.stringify(trip.features || [])]
    );
    return { id, ...trip };
  }

  async updateTrip(id: string, trip: any): Promise<any | null> {
    const existing = await this.getTripById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE trips SET title = ?, location = ?, image = ?, price = ?, rating = ?, duration = ?, category = ?, features = ? WHERE id = ?",
      [trip.title, trip.location, trip.image, trip.price, trip.rating, trip.duration, trip.category, JSON.stringify(trip.features || []), id]
    );
    return { id, ...trip };
  }

  async deleteTrip(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM trips WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getHotels(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM hotels");
    const hotels = rows.map((row) => ({
      ...row,
      amenities: typeof row.amenities === "string" ? JSON.parse(row.amenities) : row.amenities,
      alwaysAvailable: row.always_available,
      isActive: row.is_active,
      availableFrom: row.available_from,
      availableTo: row.available_to,
    }));

    for (const hotel of hotels) {
      hotel.roomTypes = await this.getRoomTypes(hotel.id);
    }

    return hotels;
  }

  async getHotelById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM hotels WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    const hotel = {
      ...row,
      amenities: typeof row.amenities === "string" ? JSON.parse(row.amenities) : row.amenities,
      alwaysAvailable: row.always_available,
      isActive: row.is_active,
      availableFrom: row.available_from,
      availableTo: row.available_to,
    };
    hotel.roomTypes = await this.getRoomTypes(id);
    return hotel;
  }

  async createHotel(hotel: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO hotels (id, title, location, image, price, rating, amenities, always_available, is_active, available_from, available_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, hotel.title, hotel.location, hotel.image, hotel.price, hotel.rating, JSON.stringify(hotel.amenities || []), hotel.alwaysAvailable ?? true, hotel.isActive ?? true, hotel.availableFrom, hotel.availableTo]
    );
    return { id, ...hotel, roomTypes: [] };
  }

  async updateHotel(id: string, hotel: any): Promise<any | null> {
    const existing = await this.getHotelById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE hotels SET title = ?, location = ?, image = ?, price = ?, rating = ?, amenities = ?, always_available = ?, is_active = ?, available_from = ?, available_to = ? WHERE id = ?",
      [hotel.title, hotel.location, hotel.image, hotel.price, hotel.rating, JSON.stringify(hotel.amenities || []), hotel.alwaysAvailable ?? true, hotel.isActive ?? true, hotel.availableFrom, hotel.availableTo, id]
    );
    return { id, ...hotel };
  }

  async deleteHotel(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM hotels WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getRoomTypes(hotelId: string): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM room_types WHERE hotel_id = ?", [hotelId]);
    return rows.map((row) => ({
      ...row,
      hotelId: row.hotel_id,
      facilities: typeof row.facilities === "string" ? JSON.parse(row.facilities) : row.facilities,
    }));
  }

  async createRoomType(roomType: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO room_types (id, hotel_id, name, price, description, facilities) VALUES (?, ?, ?, ?, ?, ?)",
      [id, roomType.hotelId, roomType.name, roomType.price, roomType.description, JSON.stringify(roomType.facilities || [])]
    );
    return { id, ...roomType };
  }

  async updateRoomType(id: string, roomType: any): Promise<any | null> {
    await pool.query(
      "UPDATE room_types SET name = ?, price = ?, description = ?, facilities = ? WHERE id = ?",
      [roomType.name, roomType.price, roomType.description, JSON.stringify(roomType.facilities || []), id]
    );
    return { id, ...roomType };
  }

  async deleteRoomType(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM room_types WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getCars(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cars");
    return rows.map((row) => ({
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
    }));
  }

  async getCarById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cars WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
    };
  }

  async createCar(car: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO cars (id, title, location, image, price, rating, specs, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, car.title, car.location, car.image, car.price, car.rating, car.specs, JSON.stringify(car.features || [])]
    );
    return { id, ...car };
  }

  async updateCar(id: string, car: any): Promise<any | null> {
    const existing = await this.getCarById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE cars SET title = ?, location = ?, image = ?, price = ?, rating = ?, specs = ?, features = ? WHERE id = ?",
      [car.title, car.location, car.image, car.price, car.rating, car.specs, JSON.stringify(car.features || []), id]
    );
    return { id, ...car };
  }

  async deleteCar(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM cars WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getLastMinuteOffers(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM last_minute_offers");
    return rows.map((row) => ({
      ...row,
      originalPrice: row.original_price,
      endsIn: row.ends_in,
    }));
  }

  async getLastMinuteOfferById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM last_minute_offers WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      originalPrice: row.original_price,
      endsIn: row.ends_in,
    };
  }

  async createLastMinuteOffer(offer: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO last_minute_offers (id, title, location, image, price, original_price, rating, ends_in, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, offer.title, offer.location, offer.image, offer.price, offer.originalPrice, offer.rating, offer.endsIn, offer.discount]
    );
    return { id, ...offer };
  }

  async updateLastMinuteOffer(id: string, offer: any): Promise<any | null> {
    const existing = await this.getLastMinuteOfferById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE last_minute_offers SET title = ?, location = ?, image = ?, price = ?, original_price = ?, rating = ?, ends_in = ?, discount = ? WHERE id = ?",
      [offer.title, offer.location, offer.image, offer.price, offer.originalPrice, offer.rating, offer.endsIn, offer.discount, id]
    );
    return { id, ...offer };
  }

  async deleteLastMinuteOffer(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM last_minute_offers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getBookings(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM bookings");
    return rows as any[];
  }

  async getBookingById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM bookings WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async createBooking(booking: any): Promise<any> {
    const id = booking.id || `BKG-${this.generateId().toUpperCase().substring(0, 6)}`;
    await pool.query(
      "INSERT INTO bookings (id, customer, item, date, status, amount) VALUES (?, ?, ?, ?, ?, ?)",
      [id, booking.customer, booking.item, booking.date, booking.status || "Pending", booking.amount]
    );
    return { id, ...booking };
  }

  async updateBooking(id: string, booking: any): Promise<any | null> {
    const existing = await this.getBookingById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE bookings SET customer = ?, item = ?, date = ?, status = ?, amount = ? WHERE id = ?",
      [booking.customer, booking.item, booking.date, booking.status, booking.amount, id]
    );
    return { id, ...booking };
  }

  async deleteBooking(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM bookings WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getReviews(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM reviews ORDER BY created_at DESC");
    return rows.map((row) => ({
      ...row,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      createdAt: row.created_at,
    }));
  }

  async getReviewsByItem(itemId: string, itemType: string): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM reviews WHERE item_id = ? AND item_type = ? AND status = 'approved' ORDER BY created_at DESC",
      [itemId, itemType]
    );
    return rows.map((row) => ({
      ...row,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      createdAt: row.created_at,
    }));
  }

  async getReviewById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM reviews WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      userName: row.user_name,
      userEmail: row.user_email,
      createdAt: row.created_at,
    };
  }

  async createReview(review: any): Promise<any> {
    const id = `rev-${this.generateId()}`;
    await pool.query(
      "INSERT INTO reviews (id, item_id, item_type, item_title, user_name, user_email, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, review.itemId, review.itemType, review.itemTitle, review.userName, review.userEmail, review.rating, review.comment, review.status || "pending"]
    );
    return { id, ...review };
  }

  async updateReview(id: string, review: any): Promise<any | null> {
    const existing = await this.getReviewById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE reviews SET status = ?, rating = ?, comment = ? WHERE id = ?",
      [review.status, review.rating, review.comment, id]
    );
    return { id, ...existing, ...review };
  }

  async deleteReview(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getSupportTickets(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM support_tickets ORDER BY created_at DESC");
    return rows.map((row) => ({
      ...row,
      userName: row.user_name,
      userEmail: row.user_email,
      createdAt: row.created_at,
    }));
  }

  async getSupportTicketById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM support_tickets WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    const ticket = {
      ...row,
      userName: row.user_name,
      userEmail: row.user_email,
      createdAt: row.created_at,
    };
    ticket.replies = await this.getTicketReplies(id);
    return ticket;
  }

  async createSupportTicket(ticket: any): Promise<any> {
    const id = `TKT-${this.generateId().toUpperCase().substring(0, 6)}`;
    await pool.query(
      "INSERT INTO support_tickets (id, user_name, user_email, subject, message, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, ticket.userName, ticket.userEmail, ticket.subject, ticket.message, ticket.status || "open", ticket.priority || "normal"]
    );
    return { id, ...ticket, replies: [] };
  }

  async updateSupportTicket(id: string, ticket: any): Promise<any | null> {
    const existing = await this.getSupportTicketById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE support_tickets SET status = ?, priority = ? WHERE id = ?",
      [ticket.status, ticket.priority, id]
    );
    return { ...existing, ...ticket };
  }

  async deleteSupportTicket(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM support_tickets WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getTicketReplies(ticketId: string): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC",
      [ticketId]
    );
    return rows.map((row) => ({
      ...row,
      ticketId: row.ticket_id,
      createdAt: row.created_at,
    }));
  }

  async createTicketReply(reply: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO ticket_replies (id, ticket_id, sender, message) VALUES (?, ?, ?, ?)",
      [id, reply.ticketId, reply.sender, reply.message]
    );
    return { id, ...reply };
  }

  async getPaymentSettings(): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM payment_settings WHERE id = 1");
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      stripeEnabled: row.stripe_enabled,
      paypalEnabled: row.paypal_enabled,
      bankTransferEnabled: row.bank_transfer_enabled,
      stripePublicKey: row.stripe_public_key,
      stripeSecretKey: row.stripe_secret_key,
      paypalClientId: row.paypal_client_id,
      bankDetails: row.bank_details,
    };
  }

  async updatePaymentSettings(settings: any): Promise<any> {
    await pool.query(
      `INSERT INTO payment_settings (id, stripe_enabled, paypal_enabled, bank_transfer_enabled, stripe_public_key, stripe_secret_key, paypal_client_id, bank_details)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE stripe_enabled = ?, paypal_enabled = ?, bank_transfer_enabled = ?, stripe_public_key = ?, stripe_secret_key = ?, paypal_client_id = ?, bank_details = ?`,
      [
        settings.stripeEnabled, settings.paypalEnabled, settings.bankTransferEnabled, settings.stripePublicKey, settings.stripeSecretKey, settings.paypalClientId, settings.bankDetails,
        settings.stripeEnabled, settings.paypalEnabled, settings.bankTransferEnabled, settings.stripePublicKey, settings.stripeSecretKey, settings.paypalClientId, settings.bankDetails,
      ]
    );
    return settings;
  }

  async getSubscribers(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM subscribers ORDER BY subscribed_at DESC");
    return rows.map((row) => ({
      ...row,
      subscribedAt: row.subscribed_at,
    }));
  }

  async createSubscriber(email: string): Promise<any> {
    const id = this.generateId();
    await pool.query("INSERT INTO subscribers (id, email) VALUES (?, ?)", [id, email]);
    return { id, email };
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM subscribers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getEmailTemplates(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM email_templates");
    return rows as any[];
  }

  async getEmailTemplateById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM email_templates WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async createEmailTemplate(template: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO email_templates (id, name, subject, body) VALUES (?, ?, ?, ?)",
      [id, template.name, template.subject, template.body]
    );
    return { id, ...template };
  }

  async updateEmailTemplate(id: string, template: any): Promise<any | null> {
    const existing = await this.getEmailTemplateById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE email_templates SET name = ?, subject = ?, body = ? WHERE id = ?",
      [template.name, template.subject, template.body, id]
    );
    return { id, ...template };
  }

  async deleteEmailTemplate(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM email_templates WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getEmailSettings(): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM email_settings WHERE id = 1");
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      smtpHost: row.smtp_host,
      smtpPort: row.smtp_port,
      smtpUser: row.smtp_user,
      smtpPassword: row.smtp_password,
      fromEmail: row.from_email,
      fromName: row.from_name,
    };
  }

  async updateEmailSettings(settings: any): Promise<any> {
    await pool.query(
      `INSERT INTO email_settings (id, smtp_host, smtp_port, smtp_user, smtp_password, from_email, from_name)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_password = ?, from_email = ?, from_name = ?`,
      [
        settings.smtpHost, settings.smtpPort, settings.smtpUser, settings.smtpPassword, settings.fromEmail, settings.fromName,
        settings.smtpHost, settings.smtpPort, settings.smtpUser, settings.smtpPassword, settings.fromEmail, settings.fromName,
      ]
    );
    return settings;
  }

  async getUserByUsername(username: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE username = ?", [username]);
    return rows.length > 0 ? rows[0] : null;
  }

  async createUser(user: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
      [id, user.username, user.password, user.role || "user"]
    );
    return { id, ...user };
  }
}

export const storage = new MySQLStorage();
