-- SnapServe Database Schema
-- QR Restaurant Ordering Platform

-- Users table for authentication and role management
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants table
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT true
);

-- Tables table for QR code management
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  number VARCHAR(10) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  qr_code VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Categories for menu organization
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Menu items
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255),
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  allergens TEXT[], -- Array of allergen strings
  dietary_info TEXT[], -- Array of dietary information (vegan, gluten-free, etc.)
  preparation_time INTEGER DEFAULT 15, -- in minutes
  sort_order INTEGER DEFAULT 0
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items (line items for each order)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer feedback
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory management
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  item_name VARCHAR(100) NOT NULL,
  current_stock INTEGER NOT NULL,
  minimum_stock INTEGER DEFAULT 10,
  unit VARCHAR(20) DEFAULT 'pieces',
  cost_per_unit DECIMAL(10,2),
  supplier VARCHAR(100),
  last_restocked TIMESTAMP,
  predicted_days_remaining INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_tables_qr_code ON tables(qr_code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_feedback_sentiment ON feedback(sentiment);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX idx_inventory_minimum_stock ON inventory(minimum_stock);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (for development/testing)
INSERT INTO restaurants (name, description, address, phone, email) VALUES
('Bella Vista', 'Authentic Italian cuisine with a modern twist', '123 Main St, Downtown', '555-0123', 'info@bellavista.com');

INSERT INTO categories (restaurant_id, name, description, sort_order) VALUES
(1, 'Appetizers', 'Start your meal with our delicious appetizers', 1),
(1, 'Main Courses', 'Hearty main dishes made with fresh ingredients', 2),
(1, 'Desserts', 'Sweet treats to end your meal', 3),
(1, 'Beverages', 'Refreshing drinks and specialty beverages', 4);

-- Note: This schema is designed for PostgreSQL but can be adapted for other databases
-- The application uses Drizzle ORM which handles database abstraction