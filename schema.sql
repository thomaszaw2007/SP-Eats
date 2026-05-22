-- ─────────────────────────────────────────────────────────
--  Database Schema
-- ─────────────────────────────────────────────────────────
--  Single source of truth for the database structure.
--  Update this file whenever you add, remove, or change
--  tables, columns, or indexes.
--
--  Used by: scripts/reset.js
-- ─────────────────────────────────────────────────────────

-- Drop existing tables
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS food_stalls CASCADE;
DROP TABLE IF EXISTS "Something" CASCADE;
DROP TABLE IF EXISTS "Person" CASCADE;

-- ─────────────────────────────────────────────────────────
-- Starter tables
-- ─────────────────────────────────────────────────────────

CREATE TABLE "Something" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Something_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Person" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatar" TEXT,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- ─────────────────────────────────────────────────────────
-- Thomas: Food Stall and Menu Feature
-- Feature: Browse stalls, search food, view menu items
-- ─────────────────────────────────────────────────────────

CREATE TABLE food_stalls (
  stall_id VARCHAR(20) PRIMARY KEY,
  stall_name VARCHAR(100) NOT NULL,
  stall_description TEXT,
  cuisine_type VARCHAR(80) NOT NULL,
  food_court VARCHAR(50) NOT NULL,
  location_detail VARCHAR(100),
  opening_status VARCHAR(20) DEFAULT 'open',
  estimated_wait_time VARCHAR(30),
  rating DECIMAL(2,1) DEFAULT 0.0,
  rating_count INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
  item_id VARCHAR(20) PRIMARY KEY,
  stall_id VARCHAR(20) NOT NULL,
  stall_name VARCHAR(100) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  item_description TEXT,
  price DECIMAL(6,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_halal BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_menu_stall
    FOREIGN KEY (stall_id)
    REFERENCES food_stalls(stall_id)
    ON DELETE CASCADE
);

-- ─────────────────────────────────────────────────────────
-- Sample data for Food Stall and Menu Feature
-- ─────────────────────────────────────────────────────────

INSERT INTO food_stalls (
  stall_id,
  stall_name,
  stall_description,
  cuisine_type,
  food_court,
  location_detail,
  opening_status,
  estimated_wait_time,
  rating,
  rating_count,
  image_url
) VALUES
(
  'stall_001',
  'Subway',
  'Fresh subs, wraps, cookies and drinks made to order.',
  'Western / Sandwiches',
  'Food Court 5',
  'Food Court 5',
  'open',
  '5-8 min',
  4.6,
  238,
  'https://placehold.co/600x400?text=Subway'
),
(
  'stall_002',
  'KFC',
  'Fried chicken, burgers, sides and drinks for quick campus meals.',
  'Fast Food / Chicken',
  'Food Court 5',
  'Food Court 5',
  'open',
  '8-12 min',
  4.5,
  412,
  'https://placehold.co/600x400?text=KFC'
),
(
  'stall_003',
  'McDonalds',
  'Burgers, fries, drinks and desserts for students on the go.',
  'Fast Food / Burgers',
  'T16',
  'T16, Level 1',
  'closed',
  '10-15 min',
  4.7,
  523,
  'https://placehold.co/600x400?text=McDonalds'
);

INSERT INTO menu_items (
  item_id,
  stall_id,
  stall_name,
  item_name,
  item_description,
  price,
  category,
  image_url,
  is_available,
  is_halal,
  is_popular
) VALUES
(
  'item_001',
  'stall_001',
  'Subway',
  'Chicken Teriyaki Sub',
  'Toasted sub with chicken teriyaki, vegetables and sauce.',
  6.50,
  'Sandwich',
  'https://placehold.co/600x400?text=Chicken+Teriyaki+Sub',
  TRUE,
  FALSE,
  TRUE
),
(
  'item_002',
  'stall_001',
  'Subway',
  'Tuna Sub',
  'Classic tuna sub with fresh vegetables and sauce.',
  5.90,
  'Sandwich',
  'https://placehold.co/600x400?text=Tuna+Sub',
  TRUE,
  FALSE,
  FALSE
),
(
  'item_003',
  'stall_001',
  'Subway',
  'Egg Mayo Sub',
  'Creamy egg mayo sub with crisp vegetables.',
  5.50,
  'Sandwich',
  'https://placehold.co/600x400?text=Egg+Mayo+Sub',
  TRUE,
  FALSE,
  FALSE
),
(
  'item_004',
  'stall_001',
  'Subway',
  'Subway Cookie',
  'Soft baked cookie for a quick snack.',
  1.80,
  'Sides',
  'https://placehold.co/600x400?text=Subway+Cookie',
  TRUE,
  FALSE,
  FALSE
),
(
  'item_005',
  'stall_001',
  'Subway',
  'Iced Lemon Tea',
  'Refreshing iced lemon tea.',
  2.20,
  'Drinks',
  'https://placehold.co/600x400?text=Iced+Lemon+Tea',
  TRUE,
  FALSE,
  FALSE
),
(
  'item_006',
  'stall_002',
  'KFC',
  '2 Piece Chicken Meal',
  'Two pieces of fried chicken served with sides.',
  8.90,
  'Chicken',
  'https://placehold.co/600x400?text=2+Piece+Chicken+Meal',
  TRUE,
  TRUE,
  TRUE
),
(
  'item_007',
  'stall_002',
  'KFC',
  'Zinger Burger',
  'Spicy chicken burger with lettuce and sauce.',
  7.50,
  'Burger',
  'https://placehold.co/600x400?text=Zinger+Burger',
  TRUE,
  TRUE,
  TRUE
),
(
  'item_008',
  'stall_002',
  'KFC',
  'Popcorn Chicken',
  'Bite-sized crispy chicken pieces.',
  5.20,
  'Chicken',
  'https://placehold.co/600x400?text=Popcorn+Chicken',
  TRUE,
  TRUE,
  FALSE
),
(
  'item_009',
  'stall_002',
  'KFC',
  'Cheese Fries',
  'Crispy fries topped with cheese sauce.',
  4.50,
  'Sides',
  'https://placehold.co/600x400?text=Cheese+Fries',
  FALSE,
  TRUE,
  FALSE
),
(
  'item_010',
  'stall_002',
  'KFC',
  'Pepsi',
  'Chilled Pepsi drink.',
  2.00,
  'Drinks',
  'https://placehold.co/600x400?text=Pepsi',
  TRUE,
  TRUE,
  FALSE
),
(
  'item_011',
  'stall_003',
  'McDonalds',
  'McChicken',
  'Chicken burger with lettuce and mayo.',
  6.80,
  'Burger',
  'https://placehold.co/600x400?text=McChicken',
  FALSE,
  TRUE,
  TRUE
),
(
  'item_012',
  'stall_003',
  'McDonalds',
  'Filet-O-Fish',
  'Fish burger with cheese and tartar sauce.',
  6.50,
  'Burger',
  'https://placehold.co/600x400?text=Filet-O-Fish',
  FALSE,
  TRUE,
  FALSE
),
(
  'item_013',
  'stall_003',
  'McDonalds',
  'French Fries',
  'Golden crispy fries.',
  3.80,
  'Sides',
  'https://placehold.co/600x400?text=French+Fries',
  FALSE,
  TRUE,
  FALSE
),
(
  'item_014',
  'stall_003',
  'McDonalds',
  'Iced Milo',
  'Cold Milo drink.',
  3.20,
  'Drinks',
  'https://placehold.co/600x400?text=Iced+Milo',
  FALSE,
  TRUE,
  FALSE
),
(
  'item_015',
  'stall_003',
  'McDonalds',
  'Apple Pie',
  'Warm crispy apple pie dessert.',
  2.00,
  'Sides',
  'https://placehold.co/600x400?text=Apple+Pie',
  FALSE,
  TRUE,
  FALSE
);