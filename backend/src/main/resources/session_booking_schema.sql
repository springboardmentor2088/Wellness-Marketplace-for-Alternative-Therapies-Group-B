-- Session booking schema for wellness marketplace

CREATE TABLE IF NOT EXISTS session_bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT NOT NULL,
    provider_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL,
    issue_description TEXT NOT NULL,
    status VARCHAR(40) NOT NULL,
    provider_message TEXT NULL,
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_client FOREIGN KEY (client_id) REFERENCES users(id),
    CONSTRAINT fk_session_provider FOREIGN KEY (provider_id) REFERENCES users(id)
);

CREATE INDEX idx_session_provider ON session_bookings(provider_id);
CREATE INDEX idx_session_client ON session_bookings(client_id);
CREATE INDEX idx_session_date ON session_bookings(session_date);
CREATE INDEX idx_session_status ON session_bookings(status);

