-- ALTER TABLE for bookings to enforce booking_date correctly
ALTER TABLE bookings
MODIFY COLUMN booking_date DATETIME NOT NULL;
