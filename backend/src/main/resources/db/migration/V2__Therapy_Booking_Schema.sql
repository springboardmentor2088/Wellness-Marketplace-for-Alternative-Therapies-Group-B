CREATE TABLE therapy_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL,
    price DECIMAL(19, 2) NOT NULL,
    provider_id BIGINT NOT NULL,
    specialization VARCHAR(255),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE provider_availability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_availability (provider_id, available_date, start_time, end_time)
);

DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    therapy_session_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (therapy_session_id) REFERENCES therapy_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_booking_date (booking_date),
    INDEX idx_provider_id (provider_id),
    UNIQUE KEY unique_booking (provider_id, booking_date, start_time)
);
