-- Alter the bookings table to rename provider_id to practitioner_id if needed
-- Assuming the table already has provider_id from Step 1, changing to practitioner_id to match entity changes requested in Prompt 2.
-- If the table hasn't been created yet, this script ensures it maps properly.

ALTER TABLE bookings
CHANGE COLUMN provider_id practitioner_id BIGINT NOT NULL;

-- Make sure the constraint names don't conflict, modifying mapping if necessary
ALTER TABLE bookings
DROP INDEX idx_provider_id,
ADD INDEX idx_practitioner_id (practitioner_id);

ALTER TABLE therapy_sessions
CHANGE COLUMN provider_id practitioner_id BIGINT NOT NULL;

ALTER TABLE provider_availability
CHANGE COLUMN provider_id practitioner_id BIGINT NOT NULL;
