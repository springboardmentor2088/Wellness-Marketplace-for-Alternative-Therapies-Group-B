-- Seed data for Wellness Marketplace

-- Add Default Admin User
-- Password is 'admin123' (BCrypt encoded: $2a$10$Pj9kX0JfP2H4hG5v8yO3kOvL7H5bJgL8W1cQpG6n8fVtR9xH1yI5e)
INSERT INTO users (name, email, password, role, city, country, verified, email_verified) 
SELECT 'Admin User', '***REMOVED***', '$2a$10$Pj9kX0JfP2H4hG5v8yO3kOvL7H5bJgL8W1cQpG6n8fVtR9xH1yI5e', 'ADMIN', 'Bangalore', 'India', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = '***REMOVED***');

-- Add some default Therapy Sessions (optional, for demo)
-- INSERT INTO therapy_sessions (name, description, duration_minutes, price, provider_id, specialization) VALUES ...
