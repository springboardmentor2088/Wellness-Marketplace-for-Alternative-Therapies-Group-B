-- Schema for Wellness Marketplace

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    specialization VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    degree_file VARCHAR(255),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    otp VARCHAR(255),
    otp_expiry TIMESTAMP,
    admin_comment VARCHAR(1000),
    profile_image VARCHAR(255),
    session_fee DECIMAL(19,2) DEFAULT 500.00
);

-- Therapy Sessions
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    duration_minutes INT NOT NULL,
    price DECIMAL(19,2) NOT NULL,
    provider_id BIGINT NOT NULL,
    specialization VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Provider Availability
CREATE TABLE IF NOT EXISTS provider_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_date TIMESTAMP NOT NULL,
    notes VARCHAR(255),
    practitioner_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    refunded BOOLEAN DEFAULT FALSE,
    session_fee DECIMAL(19,2),
    duration INT,
    practitioner_comment VARCHAR(500),
    reminder_scheduled BOOLEAN DEFAULT FALSE,
    reminder_scheduled_at TIMESTAMP,
    provider_message_id VARCHAR(255),
    FOREIGN KEY (practitioner_id) REFERENCES users(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_booking_date ON bookings(booking_date);

-- Session Bookings
CREATE TABLE IF NOT EXISTS session_bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL,
    issue_description VARCHAR(2000),
    status VARCHAR(40) NOT NULL,
    provider_message VARCHAR(2000),
    reminder_sent BOOLEAN DEFAULT FALSE,
    refunded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

CREATE INDEX idx_session_provider ON session_bookings(provider_id);
CREATE INDEX idx_session_client ON session_bookings(client_id);
CREATE INDEX idx_session_date ON session_bookings(session_date);
CREATE INDEX idx_session_status ON session_bookings(status);

-- Products
CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    price DECIMAL(19,2) NOT NULL,
    image_url VARCHAR(255),
    provider_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT,
    total_price DECIMAL(19,2),
    order_date TIMESTAMP,
    delivery_status VARCHAR(255),
    patient_id BIGINT,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    type VARCHAR(40) NOT NULL,
    message VARCHAR(255) NOT NULL,
    related_booking_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE INDEX idx_notification_recipient_read 
ON notifications(recipient_id, is_read);

CREATE INDEX idx_notification_recipient_created 
ON notifications(recipient_id, created_at);