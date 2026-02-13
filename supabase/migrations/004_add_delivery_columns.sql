-- Add detailed delivery columns to orders table

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT,
ADD COLUMN IF NOT EXISTS delivery_province TEXT,

ADD COLUMN IF NOT EXISTS delivery_contact_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS delivery_contact_email TEXT,

ADD COLUMN IF NOT EXISTS delivery_time_slot TEXT CHECK (delivery_time_slot IN ('morning', 'afternoon', 'all_day', 'custom')),
ADD COLUMN IF NOT EXISTS delivery_type TEXT CHECK (delivery_type IN ('standard', 'pickup', 'urgent')),

ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,

ADD COLUMN IF NOT EXISTS delivery_requires_call_before BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_has_unloading_requirements BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_vehicle_access_notes TEXT;

-- Initial comment to document the change
COMMENT ON COLUMN orders.delivery_time_slot IS 'Preferred delivery time: morning, afternoon, all_day, or custom';
COMMENT ON COLUMN orders.delivery_type IS 'Logistics type: standard, pickup, or urgent';
