import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "mysql-200-131.mysql.prositehosting.net",
  database: "ocidb_01Raay53dC",
  user: "voyageruser12",
  password: "19982206m.M",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL connection error:", error);
    throw error;
  }
}

export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user'
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT,
        price VARCHAR(50),
        rating VARCHAR(10),
        duration VARCHAR(50),
        category VARCHAR(100),
        features JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT,
        price VARCHAR(50),
        rating VARCHAR(10),
        amenities JSON,
        always_available BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        available_from VARCHAR(50),
        available_to VARCHAR(50),
        stars INT DEFAULT 5,
        sort_order INT DEFAULT 0
      )
    `);

    // Add stars and sort_order columns if they don't exist
    try {
      await connection.query(`ALTER TABLE hotels ADD COLUMN stars INT DEFAULT 5`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE hotels ADD COLUMN sort_order INT DEFAULT 0`);
    } catch (e) {}

    await connection.query(`
      CREATE TABLE IF NOT EXISTS room_types (
        id VARCHAR(36) PRIMARY KEY,
        hotel_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(50),
        description TEXT,
        facilities JSON,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT,
        price VARCHAR(50),
        rating VARCHAR(10),
        specs VARCHAR(255),
        features JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS last_minute_offers (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT,
        price VARCHAR(50),
        original_price VARCHAR(50),
        rating VARCHAR(10),
        ends_in VARCHAR(50),
        discount VARCHAR(50)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        item VARCHAR(255) NOT NULL,
        date VARCHAR(50),
        status VARCHAR(50),
        amount VARCHAR(50)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        item_id VARCHAR(36) NOT NULL,
        item_type VARCHAR(50) NOT NULL,
        item_title VARCHAR(255),
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        rating INT NOT NULL,
        comment TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(36) PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(50) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id VARCHAR(36) PRIMARY KEY,
        ticket_id VARCHAR(36) NOT NULL,
        sender VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id INT PRIMARY KEY DEFAULT 1,
        stripe_enabled BOOLEAN DEFAULT false,
        paypal_enabled BOOLEAN DEFAULT false,
        bank_transfer_enabled BOOLEAN DEFAULT false,
        stripe_public_key TEXT,
        stripe_secret_key TEXT,
        paypal_client_id TEXT,
        bank_details TEXT
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add name column if it doesn't exist (migration for existing tables)
    try {
      await connection.query("ALTER TABLE subscribers ADD COLUMN name VARCHAR(255)");
    } catch (e) {
      // Column already exists, ignore
    }

    // Add gallery column to trips, hotels, cars, last_minute_offers if it doesn't exist
    try {
      await connection.query("ALTER TABLE trips ADD COLUMN gallery JSON DEFAULT '[]'");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE hotels ADD COLUMN gallery JSON DEFAULT '[]'");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE cars ADD COLUMN gallery JSON DEFAULT '[]'");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE last_minute_offers ADD COLUMN gallery JSON DEFAULT '[]'");
    } catch (e) {
      // Column already exists, ignore
    }

    // Add created_at column to trips, hotels, cars, last_minute_offers if it doesn't exist
    try {
      await connection.query("ALTER TABLE trips ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE hotels ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE cars ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE last_minute_offers ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    } catch (e) {
      // Column already exists, ignore
    }

    // Add missing columns to payment_settings table
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN stripe_enabled BOOLEAN DEFAULT false");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN paypal_enabled BOOLEAN DEFAULT false");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN bank_transfer_enabled BOOLEAN DEFAULT false");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN bank_details TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN stripe_public_key TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN stripe_secret_key TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE payment_settings ADD COLUMN paypal_client_id TEXT");
    } catch (e) {
      // Column already exists, ignore
    }

    // Add meta_description column to trips, hotels, cars, last_minute_offers if it doesn't exist
    try {
      await connection.query("ALTER TABLE trips ADD COLUMN meta_description TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE hotels ADD COLUMN meta_description TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE cars ADD COLUMN meta_description TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query("ALTER TABLE last_minute_offers ADD COLUMN meta_description TEXT");
    } catch (e) {
      // Column already exists, ignore
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id INT PRIMARY KEY DEFAULT 1,
        smtp_host VARCHAR(255),
        smtp_port INT,
        smtp_user VARCHAR(255),
        smtp_password VARCHAR(255),
        from_email VARCHAR(255),
        from_name VARCHAR(255)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY DEFAULT 1,
        site_name VARCHAR(255) DEFAULT 'Voyager Hub',
        logo_url TEXT,
        tagline VARCHAR(500),
        seo_title VARCHAR(255),
        seo_description TEXT,
        seo_keywords TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        contact_address TEXT,
        facebook_url VARCHAR(500),
        instagram_url VARCHAR(500),
        twitter_url VARCHAR(500),
        linkedin_url VARCHAR(500),
        youtube_url VARCHAR(500),
        whatsapp_number VARCHAR(50),
        default_currency VARCHAR(10) DEFAULT 'EUR',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add default_currency column if it doesn't exist
    try {
      await connection.query(`ALTER TABLE site_settings ADD COLUMN default_currency VARCHAR(10) DEFAULT 'EUR'`);
    } catch (e) {}

    console.log("✅ Database tables initialized");
  } finally {
    connection.release();
  }
}
