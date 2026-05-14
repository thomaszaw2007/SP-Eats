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
DROP TABLE IF EXISTS "Cart" CASCADE;
DROP TABLE IF EXISTS "History" CASCADE;
DROP TABLE IF EXISTS "Menu" CASCADE;
DROP TABLE IF EXISTS "Stalls" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "FoodCourt" CASCADE;

-- Create tables
CREATE TABLE "User" (
  "user_id" SERIAL NOT NULL, 
  "username" TEXT NOT NULL, 
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "created_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "last_login_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  "wallet" INT DEFAULT 0,
  CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "FoodCourt" (
  "foodcourt_id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  CONSTRAINT "FoodCourt_pkey" PRIMARY KEY ("foodcourt_id")
);

CREATE TABLE "Stalls" (
  "stall_id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "foodcourt_id" INT NOT NULL,
  "halal" BOOLEAN DEFAULT FALSE,
  "vegetarian" BOOLEAN DEFAULT FALSE,
  CONSTRAINT "Stalls_pkey" PRIMARY KEY ("stall_id"),
  CONSTRAINT "Stalls_foodcourt_id_fkey" FOREIGN KEY ("foodcourt_id") REFERENCES "FoodCourt"("foodcourt_id")
);

CREATE TABLE "Menu" (
  "food_id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "variation" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "stall_id" INT NOT NULL,
  "foodcourt_id" INT NOT NULL,
  CONSTRAINT "Menu_pkey" PRIMARY KEY ("food_id"),
  CONSTRAINT "Menu_stall_id_fkey" FOREIGN KEY ("stall_id") REFERENCES "Stalls"("stall_id"),
  CONSTRAINT "Menu_foodcourt_id_fkey" FOREIGN KEY ("foodcourt_id") REFERENCES "FoodCourt"("foodcourt_id")
);

CREATE TABLE "History" (
  "history_id" SERIAL NOT NULL, 
  "user_id" INT NOT NULL,
  "food_id" INT NOT NULL,
  CONSTRAINT "History_pkey" PRIMARY KEY ("history_id"),
  CONSTRAINT "History_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id"),
  CONSTRAINT "History_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "Menu"("food_id")
);

CREATE TABLE "Cart" (
  "cart_id" SERIAL NOT NULL, 
  "user_id" INT NOT NULL,
  "food_id" INT NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("cart_id"),
  CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id"),
  CONSTRAINT "Cart_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "Menu"("food_id")
);

-- Indexes
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
