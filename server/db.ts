import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: 'mysql-200-131.mysql.prositehosting.net',
  user: 'voyageruser12',
  password: '19982206m.M',
  database: 'ocidb_01Raay53dC',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trips table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        price VARCHAR(50) NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        features JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create hotels table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        price VARCHAR(50) NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        amenities JSON NOT NULL,
        always_available BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        available_from DATE,
        available_to DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create room_types table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_types (
        id VARCHAR(36) PRIMARY KEY,
        hotel_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(50) NOT NULL,
        description TEXT,
        facilities JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      )
    `);

    // Create cars table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cars (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        price VARCHAR(50) NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        specs VARCHAR(255) NOT NULL,
        features JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create last_minute_offers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS last_minute_offers (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        image TEXT NOT NULL,
        price VARCHAR(50) NOT NULL,
        original_price VARCHAR(50) NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        ends_in VARCHAR(50) NOT NULL,
        discount VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(36) PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        item VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status ENUM('Confirmed', 'Pending', 'Cancelled') NOT NULL,
        amount VARCHAR(50) NOT NULL,
        payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        item_id VARCHAR(36) NOT NULL,
        item_type ENUM('trip', 'hotel', 'car', 'offer') NOT NULL,
        item_title VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255),
        rating INT NOT NULL,
        comment TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create support_tickets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(36) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        status ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ticket_replies table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ticket_replies (
        id VARCHAR(36) PRIMARY KEY,
        ticket_id VARCHAR(36) NOT NULL,
        sender ENUM('user', 'support') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
      )
    `);

    // Create payment_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_settings (
        id VARCHAR(36) PRIMARY KEY,
        provider VARCHAR(50) NOT NULL UNIQUE,
        enabled BOOLEAN DEFAULT FALSE,
        secret_key TEXT,
        publishable_key TEXT,
        webhook_secret TEXT,
        additional_config JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default payment settings if they don't exist
    await connection.execute(`
      INSERT IGNORE INTO payment_settings (id, provider, enabled, secret_key, publishable_key, additional_config)
      VALUES 
        ('stripe-1', 'stripe', FALSE, '', '', NULL),
        ('paypal-1', 'paypal', FALSE, '', '', NULL),
        ('square-1', 'square', FALSE, '', '', NULL),
        ('bank-transfer-1', 'bank_transfer', FALSE, '', '', '{"bankName": "", "accountNumber": "", "routingNumber": "", "swiftCode": "", "accountHolderName": "", "bankAddress": "", "instructions": ""}')
    `);

    // Create subscribers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'unsubscribed') DEFAULT 'active',
        INDEX idx_email (email),
        INDEX idx_status (status)
      )
    `);

    // Create email_templates table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        variables JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default email templates
    await connection.execute(`
      INSERT IGNORE INTO email_templates (id, name, subject, body, variables)
      VALUES 
        ('template-1', 'Welcome Email', 'Welcome to {{companyName}}!', '<h1>Welcome {{name}}!</h1><p>Thank you for subscribing to our newsletter. We are excited to share exclusive travel offers and inspiration with you.</p><p>Best regards,<br>{{companyName}} Team</p>', '["name", "companyName"]'),
        ('template-2', 'Newsletter', '{{subject}}', '<h1>{{title}}</h1><p>{{content}}</p><p>Best regards,<br>{{companyName}} Team</p>', '["subject", "title", "content", "companyName"]'),
        ('template-3', 'Special Offer', 'Exclusive Offer Just for You!', '<h1>Special Offer</h1><p>Hi {{name}},</p><p>We have an exclusive offer just for you: {{offerDetails}}</p><p>Don''t miss out!</p><p>Best regards,<br>{{companyName}} Team</p>', '["name", "offerDetails", "companyName"]')
    `);

    // Create email_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS email_settings (
        id VARCHAR(36) PRIMARY KEY,
        enabled BOOLEAN DEFAULT FALSE,
        host VARCHAR(255),
        port INT,
        secure BOOLEAN DEFAULT FALSE,
        username VARCHAR(255),
        password TEXT,
        from_email VARCHAR(255),
        from_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default email settings if they don't exist
    await connection.execute(`
      INSERT IGNORE INTO email_settings (id, enabled, host, port, secure, username, password, from_email, from_name)
      VALUES 
        ('email-1', FALSE, '', 587, FALSE, '', '', '', '')
    `);

    console.log('✅ Database tables initialized successfully');
  } finally {
    connection.release();
  }
}

