import { pool } from "./db";
import { RowDataPacket } from "mysql2/promise";
import { generateSlug } from "../shared/utils";

export interface IStorage {
  getTrips(): Promise<any[]>;
  getTripById(id: string): Promise<any | null>;
  getTripBySlug(slug: string): Promise<any | null>;
  createTrip(trip: any): Promise<any>;
  updateTrip(id: string, trip: any): Promise<any | null>;
  deleteTrip(id: string): Promise<boolean>;

  getHotels(): Promise<any[]>;
  getHotelById(id: string): Promise<any | null>;
  getHotelBySlug(slug: string): Promise<any | null>;
  createHotel(hotel: any): Promise<any>;
  updateHotel(id: string, hotel: any): Promise<any | null>;
  deleteHotel(id: string): Promise<boolean>;

  getRoomTypes(hotelId: string): Promise<any[]>;
  createRoomType(roomType: any): Promise<any>;
  updateRoomType(id: string, roomType: any): Promise<any | null>;
  deleteRoomType(id: string): Promise<boolean>;

  getCars(): Promise<any[]>;
  getCarById(id: string): Promise<any | null>;
  getCarBySlug(slug: string): Promise<any | null>;
  createCar(car: any): Promise<any>;
  updateCar(id: string, car: any): Promise<any | null>;
  deleteCar(id: string): Promise<boolean>;

  getLastMinuteOffers(): Promise<any[]>;
  getLastMinuteOfferById(id: string): Promise<any | null>;
  getLastMinuteOfferBySlug(slug: string): Promise<any | null>;
  createLastMinuteOffer(offer: any): Promise<any>;
  updateLastMinuteOffer(id: string, offer: any): Promise<any | null>;
  deleteLastMinuteOffer(id: string): Promise<boolean>;
  createOffer(offer: any): Promise<any>;
  updateOffer(id: string, offer: any): Promise<any | null>;
  deleteOffer(id: string): Promise<boolean>;

  getBookings(): Promise<any[]>;
  getBookingById(id: string): Promise<any | null>;
  createBooking(booking: any): Promise<any>;
  updateBooking(id: string, booking: any): Promise<any | null>;
  updatePaymentStatus(id: string, paymentStatus: string): Promise<any | null>;
  deleteBooking(id: string): Promise<boolean>;

  getReviews(): Promise<any[]>;
  getReviewsByItem(itemId: string, itemType: string): Promise<any[]>;
  getApprovedReviewsByItem(itemId: string, itemType: string): Promise<any[]>;
  getReviewById(id: string): Promise<any | null>;
  createReview(review: any): Promise<any>;
  updateReview(id: string, review: any): Promise<any | null>;
  updateReviewStatus(id: string, status: string): Promise<any | null>;
  deleteReview(id: string): Promise<boolean>;

  getTickets(): Promise<any[]>;
  getTicketsByUser(userEmail: string): Promise<any[]>;
  getTicketById(id: string): Promise<any | null>;
  createTicket(ticket: any): Promise<any>;
  updateTicketStatus(id: string, status: string): Promise<any | null>;
  addTicketReply(ticketId: string, reply: any): Promise<any>;
  deleteTicket(id: string): Promise<boolean>;

  getPaymentSettings(): Promise<any | null>;
  getPaymentSettingByProvider(provider: string): Promise<any | null>;
  updatePaymentSettings(provider: string, settings: any): Promise<any>;

  getSubscribers(): Promise<any[]>;
  createSubscriber(email: string, name?: string): Promise<any>;
  deleteSubscriber(id: string): Promise<boolean>;
  unsubscribeSubscriber(email: string): Promise<boolean>;

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
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      metaDescription: row.meta_description || "",
    }));
  }

  async getTripById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM trips WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      metaDescription: row.meta_description || "",
    };
  }

  async getTripBySlug(slug: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM trips", []);
    for (const row of rows) {
      if (generateSlug(row.title) === slug) {
        return {
          ...row,
          features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
          gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
          metaDescription: row.meta_description || "",
        };
      }
    }
    return null;
  }

  async createTrip(trip: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO trips (id, title, location, image, price, rating, duration, category, features, gallery, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, trip.title, trip.location, trip.image, trip.price, trip.rating, trip.duration, trip.category, JSON.stringify(trip.features || []), JSON.stringify(trip.gallery || []), trip.metaDescription || ""]
    );
    return { id, ...trip };
  }

  async updateTrip(id: string, trip: any): Promise<any | null> {
    const existing = await this.getTripById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE trips SET title = ?, location = ?, image = ?, price = ?, rating = ?, duration = ?, category = ?, features = ?, gallery = ?, meta_description = ? WHERE id = ?",
      [trip.title, trip.location, trip.image, trip.price, trip.rating, trip.duration, trip.category, JSON.stringify(trip.features || []), JSON.stringify(trip.gallery || []), trip.metaDescription || "", id]
    );
    return { id, ...trip };
  }

  async deleteTrip(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM trips WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getHotels(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM hotels ORDER BY sort_order ASC, id ASC");
    const hotels: any[] = rows.map((row) => ({
      ...row,
      amenities: typeof row.amenities === "string" ? JSON.parse(row.amenities) : row.amenities,
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      alwaysAvailable: row.always_available,
      isActive: row.is_active,
      availableFrom: row.available_from,
      availableTo: row.available_to,
      stars: row.stars || 5,
      sortOrder: row.sort_order || 0,
      metaDescription: row.meta_description || "",
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
    const hotel: any = {
      ...row,
      amenities: typeof row.amenities === "string" ? JSON.parse(row.amenities) : row.amenities,
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      alwaysAvailable: row.always_available,
      isActive: row.is_active,
      availableFrom: row.available_from,
      availableTo: row.available_to,
      stars: row.stars || 5,
      sortOrder: row.sort_order || 0,
      metaDescription: row.meta_description || "",
    };
    hotel.roomTypes = await this.getRoomTypes(id);
    return hotel;
  }

  async getHotelBySlug(slug: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM hotels", []);
    for (const row of rows) {
      if (generateSlug(row.title) === slug) {
        const hotel: any = {
          ...row,
          amenities: typeof row.amenities === "string" ? JSON.parse(row.amenities) : row.amenities,
          gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
          alwaysAvailable: row.always_available,
          isActive: row.is_active,
          availableFrom: row.available_from,
          availableTo: row.available_to,
          stars: row.stars || 5,
          sortOrder: row.sort_order || 0,
          metaDescription: row.meta_description || "",
        };
        hotel.roomTypes = await this.getRoomTypes(row.id);
        return hotel;
      }
    }
    return null;
  }

  async createHotel(hotel: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO hotels (id, title, location, image, price, rating, amenities, always_available, is_active, available_from, available_to, gallery, meta_description, stars, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, hotel.title, hotel.location, hotel.image, hotel.price, hotel.rating, JSON.stringify(hotel.amenities || []), hotel.alwaysAvailable ?? true, hotel.isActive ?? true, hotel.availableFrom, hotel.availableTo, JSON.stringify(hotel.gallery || []), hotel.metaDescription || "", hotel.stars || 5, hotel.sortOrder || 0]
    );
    return { id, ...hotel, roomTypes: [] };
  }

  async updateHotel(id: string, hotel: any): Promise<any | null> {
    const existing = await this.getHotelById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE hotels SET title = ?, location = ?, image = ?, price = ?, rating = ?, amenities = ?, always_available = ?, is_active = ?, available_from = ?, available_to = ?, gallery = ?, meta_description = ?, stars = ?, sort_order = ? WHERE id = ?",
      [hotel.title, hotel.location, hotel.image, hotel.price, hotel.rating, JSON.stringify(hotel.amenities || []), hotel.alwaysAvailable ?? true, hotel.isActive ?? true, hotel.availableFrom, hotel.availableTo, JSON.stringify(hotel.gallery || []), hotel.metaDescription || "", hotel.stars || 5, hotel.sortOrder || 0, id]
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
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      metaDescription: row.meta_description || "",
    }));
  }

  async getCarById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cars WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      metaDescription: row.meta_description || "",
    };
  }

  async getCarBySlug(slug: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cars", []);
    for (const row of rows) {
      if (generateSlug(row.title) === slug) {
        return {
          ...row,
          features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
          gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
          metaDescription: row.meta_description || "",
        };
      }
    }
    return null;
  }

  async createCar(car: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO cars (id, title, location, image, price, rating, specs, features, gallery, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, car.title, car.location, car.image, car.price, car.rating, car.specs, JSON.stringify(car.features || []), JSON.stringify(car.gallery || []), car.metaDescription || ""]
    );
    return { id, ...car };
  }

  async updateCar(id: string, car: any): Promise<any | null> {
    const existing = await this.getCarById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE cars SET title = ?, location = ?, image = ?, price = ?, rating = ?, specs = ?, features = ?, gallery = ?, meta_description = ? WHERE id = ?",
      [car.title, car.location, car.image, car.price, car.rating, car.specs, JSON.stringify(car.features || []), JSON.stringify(car.gallery || []), car.metaDescription || "", id]
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
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      metaDescription: row.meta_description || "",
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
      gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
      metaDescription: row.meta_description || "",
    };
  }

  async getLastMinuteOfferBySlug(slug: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM last_minute_offers", []);
    for (const row of rows) {
      if (generateSlug(row.title) === slug) {
        return {
          ...row,
          originalPrice: row.original_price,
          endsIn: row.ends_in,
          gallery: typeof row.gallery === "string" ? JSON.parse(row.gallery) : row.gallery || [],
          metaDescription: row.meta_description || "",
        };
      }
    }
    return null;
  }

  async createLastMinuteOffer(offer: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO last_minute_offers (id, title, location, image, price, original_price, rating, ends_in, discount, gallery, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, offer.title, offer.location, offer.image, offer.price, offer.originalPrice, offer.rating, offer.endsIn, offer.discount, JSON.stringify(offer.gallery || []), offer.metaDescription || ""]
    );
    return { id, ...offer };
  }

  async updateLastMinuteOffer(id: string, offer: any): Promise<any | null> {
    const existing = await this.getLastMinuteOfferById(id);
    if (!existing) return null;
    await pool.query(
      "UPDATE last_minute_offers SET title = ?, location = ?, image = ?, price = ?, original_price = ?, rating = ?, ends_in = ?, discount = ?, gallery = ?, meta_description = ? WHERE id = ?",
      [offer.title, offer.location, offer.image, offer.price, offer.originalPrice, offer.rating, offer.endsIn, offer.discount, JSON.stringify(offer.gallery || []), offer.metaDescription || "", id]
    );
    return { id, ...offer };
  }

  async deleteLastMinuteOffer(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM last_minute_offers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async createOffer(offer: any): Promise<any> {
    return this.createLastMinuteOffer(offer);
  }

  async updateOffer(id: string, offer: any): Promise<any | null> {
    return this.updateLastMinuteOffer(id, offer);
  }

  async deleteOffer(id: string): Promise<boolean> {
    return this.deleteLastMinuteOffer(id);
  }

  async getBookings(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM bookings ORDER BY created_at DESC");
    return rows.map((row) => ({
      ...row,
      paymentStatus: row.payment_status || "Pending",
    }));
  }

  async getBookingById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      ...row,
      paymentStatus: row.payment_status || "Pending",
    };
  }

  async createBooking(booking: any): Promise<any> {
    const id = booking.id || `BKG-${this.generateId().toUpperCase().substring(0, 6)}`;
    const paymentStatus = booking.paymentStatus || "Pending";
    await pool.query(
      "INSERT INTO bookings (id, customer, item, date, status, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, booking.customer, booking.item, booking.date, booking.status || "Pending", booking.amount, paymentStatus]
    );
    return { id, ...booking, paymentStatus };
  }

  async updateBooking(id: string, booking: any): Promise<any | null> {
    const existing = await this.getBookingById(id);
    if (!existing) return null;
    const paymentStatus = booking.paymentStatus || existing.paymentStatus || "Pending";
    await pool.query(
      "UPDATE bookings SET customer = ?, item = ?, date = ?, status = ?, amount = ?, payment_status = ? WHERE id = ?",
      [booking.customer || existing.customer, booking.item || existing.item, booking.date || existing.date, booking.status || existing.status, booking.amount || existing.amount, paymentStatus, id]
    );
    return { ...existing, ...booking, paymentStatus };
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<any | null> {
    const existing = await this.getBookingById(id);
    if (!existing) return null;
    await pool.query("UPDATE bookings SET payment_status = ? WHERE id = ?", [paymentStatus, id]);
    return { ...existing, paymentStatus };
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
      "SELECT * FROM reviews WHERE item_id = ? AND item_type = ? ORDER BY created_at DESC",
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

  async getApprovedReviewsByItem(itemId: string, itemType: string): Promise<any[]> {
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

  async updateReviewStatus(id: string, status: string): Promise<any | null> {
    const existing = await this.getReviewById(id);
    if (!existing) return null;
    await pool.query("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
    return { ...existing, status };
  }

  async deleteReview(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM reviews WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getTickets(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM support_tickets ORDER BY created_at DESC");
    const tickets = [];
    for (const row of rows) {
      const [replies] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC",
        [row.id]
      );
      tickets.push({
        ...row,
        userName: row.user_name,
        userEmail: row.user_email,
        createdAt: row.created_at,
        replies: replies.map((r) => ({
          ...r,
          ticketId: r.ticket_id,
          createdAt: r.created_at,
        })),
      });
    }
    return tickets;
  }

  async getTicketsByUser(userEmail: string): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM support_tickets WHERE user_email = ? ORDER BY created_at DESC",
      [userEmail]
    );
    const tickets = [];
    for (const row of rows) {
      const [replies] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC",
        [row.id]
      );
      tickets.push({
        ...row,
        userName: row.user_name,
        userEmail: row.user_email,
        createdAt: row.created_at,
        replies: replies.map((r) => ({
          ...r,
          ticketId: r.ticket_id,
          createdAt: r.created_at,
        })),
      });
    }
    return tickets;
  }

  async getTicketById(id: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM support_tickets WHERE id = ?", [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    const ticket: any = {
      ...row,
      userName: row.user_name,
      userEmail: row.user_email,
      createdAt: row.created_at,
    };
    const [replies] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC",
      [id]
    );
    ticket.replies = replies.map((r) => ({
      ...r,
      ticketId: r.ticket_id,
      createdAt: r.created_at,
    }));
    return ticket;
  }

  async createTicket(ticket: any): Promise<any> {
    const id = `TKT-${this.generateId().toUpperCase().substring(0, 6)}`;
    const statusMap: Record<string, string> = { open: "Open", "in progress": "In Progress", closed: "Closed" };
    const priorityMap: Record<string, string> = { low: "Low", normal: "Medium", medium: "Medium", high: "High" };
    const status = statusMap[(ticket.status || "open").toLowerCase()] || "Open";
    const priority = priorityMap[(ticket.priority || "medium").toLowerCase()] || "Medium";
    await pool.query(
      "INSERT INTO support_tickets (id, user_name, user_email, subject, message, status, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, ticket.userName, ticket.userEmail, ticket.subject, ticket.message, status, priority]
    );
    return { id, ...ticket, status, priority, replies: [] };
  }

  async updateTicketStatus(id: string, status: string): Promise<any | null> {
    const existing = await this.getTicketById(id);
    if (!existing) return null;
    const statusMap: Record<string, string> = { open: "Open", "in progress": "In Progress", closed: "Closed" };
    const mappedStatus = statusMap[status.toLowerCase()] || status;
    await pool.query("UPDATE support_tickets SET status = ? WHERE id = ?", [mappedStatus, id]);
    return { ...existing, status: mappedStatus };
  }

  async addTicketReply(ticketId: string, reply: any): Promise<any> {
    const id = this.generateId();
    await pool.query(
      "INSERT INTO ticket_replies (id, ticket_id, sender, message) VALUES (?, ?, ?, ?)",
      [id, ticketId, reply.sender, reply.message]
    );
    return { id, ticketId, ...reply };
  }

  async deleteTicket(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM support_tickets WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getPaymentSettings(): Promise<any[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM payment_settings WHERE id = 1");
      const row = rows.length > 0 ? rows[0] : null;
      
      let bankDetails = {};
      if (row?.bank_details) {
        try {
          bankDetails = JSON.parse(row.bank_details);
        } catch (e) {
          bankDetails = {};
        }
      }
      
      return [
        {
          id: 1,
          provider: 'stripe',
          enabled: row ? !!row.stripe_enabled : false,
          publishableKey: row?.stripe_public_key || "",
          secretKey: row?.stripe_secret_key || "",
        },
        {
          id: 2,
          provider: 'paypal',
          enabled: row ? !!row.paypal_enabled : false,
          publishableKey: row?.paypal_client_id || "",
          secretKey: "",
        },
        {
          id: 3,
          provider: 'bank_transfer',
          enabled: row ? !!row.bank_transfer_enabled : false,
          additionalConfig: bankDetails,
        },
      ];
    } catch (error) {
      console.error("Error getting payment settings:", error);
      return [
        { id: 1, provider: 'stripe', enabled: false, publishableKey: "", secretKey: "" },
        { id: 2, provider: 'paypal', enabled: false, publishableKey: "", secretKey: "" },
        { id: 3, provider: 'bank_transfer', enabled: false, additionalConfig: {} },
      ];
    }
  }

  async getPaymentSettingByProvider(provider: string): Promise<any | null> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM payment_settings WHERE id = 1");
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    if (provider === "stripe") {
      return {
        enabled: !!row.stripe_enabled,
        publicKey: row.stripe_public_key || "",
        secretKey: row.stripe_secret_key || "",
      };
    } else if (provider === "paypal") {
      return {
        enabled: !!row.paypal_enabled,
        clientId: row.paypal_client_id || "",
      };
    } else if (provider === "bankTransfer") {
      return {
        enabled: !!row.bank_transfer_enabled,
        details: row.bank_details || "",
      };
    }
    return null;
  }

  async updatePaymentSettings(provider: string, settings: any): Promise<any> {
    const [existing] = await pool.query<RowDataPacket[]>("SELECT * FROM payment_settings WHERE id = 1");
    
    if (existing.length === 0) {
      await pool.query("INSERT INTO payment_settings (id) VALUES (1)");
    }
    
    const updates: string[] = [];
    const values: any[] = [];
    
    if (provider === "stripe") {
      if (settings.enabled !== undefined) {
        updates.push("stripe_enabled = ?");
        values.push(settings.enabled);
      }
      if (settings.publishableKey !== undefined) {
        updates.push("stripe_public_key = ?");
        values.push(settings.publishableKey);
      }
      if (settings.secretKey !== undefined) {
        updates.push("stripe_secret_key = ?");
        values.push(settings.secretKey);
      }
    } else if (provider === "paypal") {
      if (settings.enabled !== undefined) {
        updates.push("paypal_enabled = ?");
        values.push(settings.enabled);
      }
      if (settings.publishableKey !== undefined) {
        updates.push("paypal_client_id = ?");
        values.push(settings.publishableKey);
      }
    } else if (provider === "bank_transfer" || provider === "bankTransfer") {
      if (settings.enabled !== undefined) {
        updates.push("bank_transfer_enabled = ?");
        values.push(settings.enabled);
      }
      if (settings.additionalConfig !== undefined) {
        updates.push("bank_details = ?");
        values.push(JSON.stringify(settings.additionalConfig));
      }
    }
    
    if (updates.length > 0) {
      await pool.query(
        `UPDATE payment_settings SET ${updates.join(", ")} WHERE id = 1`,
        values
      );
    }
    
    return settings;
  }

  async getSubscribers(): Promise<any[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM subscribers ORDER BY subscribed_at DESC");
    return rows.map((row) => ({
      ...row,
      subscribedAt: row.subscribed_at,
    }));
  }

  async createSubscriber(email: string, name?: string): Promise<any> {
    const id = this.generateId();
    await pool.query("INSERT INTO subscribers (id, email, name) VALUES (?, ?, ?)", [id, email, name || null]);
    return { id, email, name };
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM subscribers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async unsubscribeSubscriber(email: string): Promise<boolean> {
    const [result] = await pool.query<any>("DELETE FROM subscribers WHERE email = ?", [email]);
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

  async getSiteSettings(): Promise<any> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM site_settings WHERE id = 1");
      if (rows.length === 0) {
        return {
          siteName: "Voyager Hub",
          logoUrl: "",
          tagline: "Luxury Travel Experiences",
          seoTitle: "Voyager Hub | Luxury Travel Experiences",
          seoDescription: "Curating exceptional journeys for the discerning traveler.",
          seoKeywords: "luxury travel, exclusive trips, 5-star hotels",
          contactEmail: "",
          contactPhone: "",
          contactAddress: "",
          facebookUrl: "",
          instagramUrl: "",
          twitterUrl: "",
          linkedinUrl: "",
          youtubeUrl: "",
          whatsappNumber: "",
          defaultCurrency: "EUR",
        };
      }
      const row = rows[0];
      return {
        siteName: row.site_name || "Voyager Hub",
        logoUrl: row.logo_url || "",
        tagline: row.tagline || "",
        seoTitle: row.seo_title || "",
        seoDescription: row.seo_description || "",
        seoKeywords: row.seo_keywords || "",
        contactEmail: row.contact_email || "",
        contactPhone: row.contact_phone || "",
        contactAddress: row.contact_address || "",
        facebookUrl: row.facebook_url || "",
        instagramUrl: row.instagram_url || "",
        twitterUrl: row.twitter_url || "",
        linkedinUrl: row.linkedin_url || "",
        youtubeUrl: row.youtube_url || "",
        whatsappNumber: row.whatsapp_number || "",
        defaultCurrency: row.default_currency || "EUR",
      };
    } catch (error) {
      console.error("Error getting site settings:", error);
      return {
        siteName: "Voyager Hub",
        logoUrl: "",
        tagline: "Luxury Travel Experiences",
        seoTitle: "Voyager Hub | Luxury Travel Experiences",
        seoDescription: "Curating exceptional journeys for the discerning traveler.",
        seoKeywords: "luxury travel, exclusive trips, 5-star hotels",
        contactEmail: "",
        contactPhone: "",
        contactAddress: "",
        facebookUrl: "",
        instagramUrl: "",
        twitterUrl: "",
        linkedinUrl: "",
        youtubeUrl: "",
        whatsappNumber: "",
        defaultCurrency: "EUR",
      };
    }
  }

  async updateSiteSettings(settings: any): Promise<any> {
    await pool.query(
      `INSERT INTO site_settings (id, site_name, logo_url, tagline, seo_title, seo_description, seo_keywords, 
        contact_email, contact_phone, contact_address, facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url, whatsapp_number, default_currency)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), logo_url = VALUES(logo_url), tagline = VALUES(tagline),
        seo_title = VALUES(seo_title), seo_description = VALUES(seo_description), seo_keywords = VALUES(seo_keywords),
        contact_email = VALUES(contact_email), contact_phone = VALUES(contact_phone), contact_address = VALUES(contact_address),
        facebook_url = VALUES(facebook_url), instagram_url = VALUES(instagram_url), twitter_url = VALUES(twitter_url),
        linkedin_url = VALUES(linkedin_url), youtube_url = VALUES(youtube_url), whatsapp_number = VALUES(whatsapp_number),
        default_currency = VALUES(default_currency)`,
      [
        settings.siteName || "Voyager Hub",
        settings.logoUrl || "",
        settings.tagline || "",
        settings.seoTitle || "",
        settings.seoDescription || "",
        settings.seoKeywords || "",
        settings.contactEmail || "",
        settings.contactPhone || "",
        settings.contactAddress || "",
        settings.facebookUrl || "",
        settings.instagramUrl || "",
        settings.twitterUrl || "",
        settings.linkedinUrl || "",
        settings.youtubeUrl || "",
        settings.whatsappNumber || "",
        settings.defaultCurrency || "EUR",
      ]
    );
    return settings;
  }
}

export const storage = new MySQLStorage();
