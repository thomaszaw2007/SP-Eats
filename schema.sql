-- ─────────────────────────────────────────────────────────
--  Database Schema
-- ─────────────────────────────────────────────────────────


DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name = 'menu_items'
    ) THEN
        DROP VIEW "menu_items" CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'menu_items'
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE "menu_items" CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name = 'food_stalls'
    ) THEN
        DROP VIEW "food_stalls" CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'food_stalls'
        AND table_type = 'BASE TABLE'
    ) THEN
        DROP TABLE "food_stalls" CASCADE;
    END IF;
END $$;


-- ─────────────────────────────────────────────────────────
-- Drop existing tables
-- ─────────────────────────────────────────────────────────

DROP TABLE IF EXISTS "HistoryItems" CASCADE;

DROP TABLE IF EXISTS "CartItems" CASCADE;

DROP TABLE IF EXISTS "Cart" CASCADE;

DROP TABLE IF EXISTS "History" CASCADE;

DROP TABLE IF EXISTS "Menu" CASCADE;

DROP TABLE IF EXISTS "Stalls" CASCADE;

DROP TABLE IF EXISTS "User" CASCADE;

DROP TABLE IF EXISTS "FoodCourt" CASCADE;

DROP TABLE IF EXISTS "Person" CASCADE;

DROP TABLE IF EXISTS "Something" CASCADE;


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


-- ─────────────────────────────────────────────────────────
-- Team tables
-- ─────────────────────────────────────────────────────────

CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "last_login_on" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "balance" INT DEFAULT 0,
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

    "description" TEXT DEFAULT 'Campus food stall serving student-friendly meals.',
    "cuisine_type" TEXT DEFAULT 'General',
    "location_detail" TEXT,
    "opening_status" TEXT DEFAULT 'open',
    "opening_time" TEXT DEFAULT '09:00 AM',
    "closing_time" TEXT DEFAULT '06:00 PM',
    "estimated_wait_time" TEXT DEFAULT '5-10 min',
    "rating" DECIMAL(2,1) DEFAULT 4.0,
    "rating_count" INT DEFAULT 0,
    "image_url" TEXT DEFAULT '/images/default-food.jpg',
    "vegan" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stalls_pkey" PRIMARY KEY ("stall_id"),
    CONSTRAINT "Stalls_foodcourt_id_fkey"
        FOREIGN KEY ("foodcourt_id")
        REFERENCES "FoodCourt" ("foodcourt_id")
);

CREATE TABLE "Menu" (
    "food_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "variation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "stall_id" INT NOT NULL,
    "foodcourt_id" INT NOT NULL,

    "category" TEXT DEFAULT 'General',
    "image_url" TEXT DEFAULT '/images/default-food.jpg',
    "is_available" BOOLEAN DEFAULT TRUE,
    "is_popular" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("food_id"),
    CONSTRAINT "Menu_stall_id_fkey"
        FOREIGN KEY ("stall_id")
        REFERENCES "Stalls" ("stall_id"),
    CONSTRAINT "Menu_foodcourt_id_fkey"
        FOREIGN KEY ("foodcourt_id")
        REFERENCES "FoodCourt" ("foodcourt_id")
);

CREATE TABLE "Cart" (
    "cart_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "status" INT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT "Cart_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "User" ("user_id")
);

CREATE TABLE "CartItems" (
    "cart_item_id" SERIAL PRIMARY KEY,
    "cart_id" INT NOT NULL,
    "food_id" INT NOT NULL,
    "quantity" INT NOT NULL,
    "note" TEXT,
    CONSTRAINT "CartItems_cart_id_fkey"
        FOREIGN KEY ("cart_id")
        REFERENCES "Cart" ("cart_id"),
    CONSTRAINT "CartItems_food_id_fkey"
        FOREIGN KEY ("food_id")
        REFERENCES "Menu" ("food_id"),
    UNIQUE ("cart_id", "food_id")
);

CREATE TABLE "History" (
    "history_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL,
    "order_number" VARCHAR(30) UNIQUE NOT NULL,
    "subtotal" DECIMAL(10, 2) NOT NULL,
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "History_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "User" ("user_id")
        ON DELETE CASCADE
);

CREATE TABLE "HistoryItems" (
    "history_item_id" SERIAL PRIMARY KEY,
    "history_id" INT NOT NULL,
    "food_id" INT NOT NULL,
    "food_name" TEXT NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "quantity" INT NOT NULL DEFAULT 1,
    "note" TEXT,
    CONSTRAINT "HistoryItems_history_id_fkey"
        FOREIGN KEY ("history_id")
        REFERENCES "History" ("history_id")
        ON DELETE CASCADE,
    CONSTRAINT "HistoryItems_food_id_fkey"
        FOREIGN KEY ("food_id")
        REFERENCES "Menu" ("food_id")
);


-- ─────────────────────────────────────────────────────────
-- Compatibility views
-- These let older stall/menu feature code still read:
-- food_stalls and menu_items
-- ─────────────────────────────────────────────────────────

CREATE VIEW "food_stalls" AS
SELECT
    'stall_' || LPAD(S."stall_id"::TEXT, 3, '0') AS "stall_id",
    S."name" AS "stall_name",
    S."description" AS "stall_description",
    S."cuisine_type" AS "cuisine_type",
    FC."name" AS "food_court",
    COALESCE(S."location_detail", FC."location") AS "location_detail",
    S."opening_status" AS "opening_status",
    S."opening_time" AS "opening_time",
    S."closing_time" AS "closing_time",
    S."estimated_wait_time" AS "estimated_wait_time",
    S."rating" AS "rating",
    S."rating_count" AS "rating_count",
    S."image_url" AS "image_url",
    S."halal" AS "is_halal",
    S."vegetarian" AS "is_vegetarian",
    S."vegan" AS "is_vegan",
    S."created_at" AS "created_at"
FROM "Stalls" S
JOIN "FoodCourt" FC
    ON S."foodcourt_id" = FC."foodcourt_id";

CREATE VIEW "menu_items" AS
SELECT
    'item_' || LPAD(M."food_id"::TEXT, 3, '0') AS "item_id",
    'stall_' || LPAD(M."stall_id"::TEXT, 3, '0') AS "stall_id",
    S."name" AS "stall_name",
    M."name" AS "item_name",
    M."variation" AS "variation",
    M."description" AS "item_description",
    M."price" AS "price",
    M."category" AS "category",
    M."image_url" AS "image_url",
    M."is_available" AS "is_available",
    M."is_popular" AS "is_popular",
    M."created_at" AS "created_at"
FROM "Menu" M
JOIN "Stalls" S
    ON M."stall_id" = S."stall_id";


-- ─────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "Person_email_key" ON "Person" ("email");

CREATE UNIQUE INDEX "User_username_key" ON "User" ("username");

CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");

CREATE INDEX "Stalls_foodcourt_id_idx" ON "Stalls" ("foodcourt_id");

CREATE INDEX "Stalls_halal_idx" ON "Stalls" ("halal");

CREATE INDEX "Stalls_vegetarian_idx" ON "Stalls" ("vegetarian");

CREATE INDEX "Stalls_opening_status_idx" ON "Stalls" ("opening_status");

CREATE INDEX "Menu_stall_id_idx" ON "Menu" ("stall_id");

CREATE INDEX "Menu_foodcourt_id_idx" ON "Menu" ("foodcourt_id");

CREATE INDEX "Menu_category_idx" ON "Menu" ("category");

CREATE INDEX "Menu_is_popular_idx" ON "Menu" ("is_popular");
