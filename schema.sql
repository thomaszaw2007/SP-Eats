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