const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || process.env.PGHOST,
  port: process.env.DB_PORT || process.env.POSTGRES_PORT || process.env.PGPORT,
  database:
    process.env.DB_NAME ||
    process.env.DB_DATABASE ||
    process.env.POSTGRES_DB ||
    process.env.PGDATABASE,
  user: process.env.DB_USER || process.env.POSTGRES_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
});

const seedSql = `
-- ─────────────────────────────────────────────────────────
-- Seed Data
-- Uses team tables only:
-- "Something", "Person", "User", "FoodCourt", "Stalls", "Menu"
-- Do not insert into food_stalls or menu_items because those are views.
-- ─────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────
-- Review Hub Table
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Reviews" (
  "review_id" SERIAL PRIMARY KEY,
  "food_id" INT NOT NULL REFERENCES "Menu"("food_id") ON DELETE CASCADE,
  "reviewer_name" TEXT NOT NULL,
  "rating" DECIMAL(2, 1) NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "review_text" TEXT NOT NULL,
  "review_tag" TEXT DEFAULT 'General',
  "best_time_to_buy" TEXT DEFAULT 'Anytime',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

TRUNCATE TABLE
    "Reviews",
    "HistoryItems",
    "CartItems",
    "Cart",
    "History",
    "Menu",
    "Stalls",
    "FoodCourt",
    "User",
    "Person",
    "Something"
RESTART IDENTITY CASCADE;

-- ─────────────────────────────────────────────────────────
-- Starter Data
-- ─────────────────────────────────────────────────────────

INSERT INTO "Something" ("name") VALUES
('Seed 1'),
('Seed 2');

INSERT INTO "Person" ("email", "name") VALUES
('alice@example.com', 'Alice'),
('bob@example.com', 'Bob');


-- ─────────────────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────────────────

INSERT INTO "User" ("username", "email", "password", "balance") VALUES
('Admin', 'admin@gmail.com', 'admin', 0);


-- ─────────────────────────────────────────────────────────
-- Food Courts
-- ─────────────────────────────────────────────────────────

INSERT INTO "FoodCourt" ("name", "location", "description") VALUES
('Food Court 1', 'Level 2, T3B', 'Busy campus food court with Korean, Japanese, and chicken rice options.'),
('Food Court 2', 'Level 1, T1A', 'Student-friendly food court with noodles, vegetarian meals, and quick Japanese dishes.'),
('Food Court 3', 'Poly Centre', 'Central food court with rice bowls, curry rice, and chicken rice stalls.'),
('Food Court 4', 'Level 1, T18A', 'Convenient food court for quick chicken rice, noodles, and Korean chicken meals.'),
('Food Court 5', 'Level 2, T3B', 'Larger food court with fast food, sandwiches, cafe meals, and western options.'),
('Food Court 6', 'Beside Swimming Pool. Near W14', 'Food court near the sports area with noodles, soups, Japanese meals, and chicken rice.');


-- ─────────────────────────────────────────────────────────
-- Stalls
-- ─────────────────────────────────────────────────────────

INSERT INTO "Stalls" (
    "name",
    "foodcourt_id",
    "halal",
    "vegetarian",
    "description",
    "cuisine_type",
    "location_detail",
    "opening_status",
    "opening_time",
    "closing_time",
    "estimated_wait_time",
    "rating",
    "rating_count",
    "image_url",
    "vegan"
) VALUES
('Korean Kitchen', 1, FALSE, FALSE, 'Korean rice bowls, soups, and comfort meals served hot for students.', 'Korean', 'Food Court 1, Level 2', 'open', '09:00 AM', '06:00 PM', '6-10 min', 4.5, 128, '/images/stalls/Korean_Kitchen_logo.avif', FALSE),
('Japanese Bento', 1, FALSE, FALSE, 'Japanese curry rice, don bowls, and tamago dishes for quick campus meals.', 'Japanese', 'Food Court 1, Level 2', 'open', '09:00 AM', '06:00 PM', '7-12 min', 4.4, 116, '/images/stalls/Japanese_Bento_logo.png', FALSE),
('Chicken Rice Corner', 1, TRUE, FALSE, 'Classic steamed and roasted chicken rice with soup and chilli.', 'Chicken Rice', 'Food Court 1, Level 2', 'open', '08:30 AM', '05:30 PM', '5-8 min', 4.6, 214, '/images/stalls/Chicken_rice_Corner.png', FALSE),
('Noodle House', 2, FALSE, FALSE, 'Warm noodle bowls, dumpling noodles, and soup dishes.', 'Noodles', 'Food Court 2, Level 1', 'open', '09:00 AM', '06:00 PM', '6-9 min', 4.3, 98, '/images/stalls/Noodle_House_logo.jfif', FALSE),
('Japanese Express', 2, FALSE, FALSE, 'Simple Japanese rice dishes and student-friendly set meals.', 'Japanese', 'Food Court 2, Level 1', 'closed', '10:00 AM', '05:00 PM', '8-12 min', 4.2, 76, '/images/stalls/Japanese_Express_logo.avif', FALSE),
('Green Plate', 2, FALSE, TRUE, 'Vegetarian and vegan-friendly meals with rice, vegetables, and light bites.', 'Vegetarian', 'Food Court 2, Level 1', 'open', '09:30 AM', '05:30 PM', '5-8 min', 4.5, 143, '/images/stalls/Green_Plate_logo.jfif', TRUE),
('Japanese Curry House', 3, FALSE, TRUE, 'Japanese curry rice with different toppings and mild curry sauce.', 'Japanese Curry', 'Poly Centre', 'open', '09:00 AM', '06:00 PM', '7-11 min', 4.4, 156, '/images/stalls/Japanese_Curry_House_logo.png', FALSE),
('Korean Bowl', 3, FALSE, FALSE, 'Korean bibimbap, fried rice, and spicy chicken rice bowls.', 'Korean', 'Poly Centre', 'open', '09:00 AM', '06:00 PM', '8-12 min', 4.6, 189, '/images/stalls/Korean_Bowl_logo.avif', FALSE),
('Hainanese Chicken Rice', 3, TRUE, FALSE, 'Tender chicken rice meals with fragrant rice and soup.', 'Chicken Rice', 'Poly Centre', 'open', '08:30 AM', '05:30 PM', '5-8 min', 4.7, 231, '/images/stalls/Hainanese_Chicken_Rice_Stall_logo.jpg', FALSE),
('Express Chicken Rice', 4, TRUE, FALSE, 'Affordable chicken rice sets for students on the go.', 'Chicken Rice', 'Food Court 4, Level 1', 'open', '08:30 AM', '05:30 PM', '5-8 min', 4.4, 167, '/images/stalls/Express_Chicken_Rice_logo.jfif', FALSE),
('Ban Mian House', 4, FALSE, FALSE, 'Ban mian, dumpling noodles, and seafood noodle bowls.', 'Noodles', 'Food Court 4, Level 1', 'open', '09:00 AM', '06:00 PM', '6-10 min', 4.3, 132, '/images/stalls/Ban_Mian_logo.jfif', FALSE),
('Korean Fried Chicken', 4, FALSE, FALSE, 'Crispy Korean chicken bowls with sweet, spicy, and savoury sauces.', 'Korean / Chicken', 'Food Court 4, Level 1', 'closed', '10:00 AM', '06:00 PM', '8-12 min', 4.5, 148, 'https://placehold.co/600x400?text=Korean+Fried+Chicken', FALSE),
('KFC', 5, TRUE, FALSE, 'Fried chicken, burgers, sides, and drinks for quick campus meals.', 'Fast Food / Chicken', 'Food Court 5, #01-01', 'open', '09:00 AM', '08:00 PM', '8-12 min', 4.5, 412, '/images/stalls/kfc_logo.png', FALSE),
('Subway', 5, TRUE, TRUE, 'Fresh subs, wraps, and salads made to order with your choice of bread and toppings.', 'Western / Sandwiches', 'Food Court 5, #01-03', 'open', '08:30 AM', '07:30 PM', '5-8 min', 4.6, 238, '/images/stalls/Subway.jpg', FALSE),
('Brunch Cafe', 5, FALSE, TRUE, 'Western breakfast plates, sandwiches, pasta, and simple cafe meals.', 'Western / Cafe', 'Food Court 5, #01-05', 'open', '09:00 AM', '06:00 PM', '7-10 min', 4.2, 94, '/images/stalls/Brunch_Cafe_logo.png', FALSE),
('Japanese Food', 6, FALSE, FALSE, 'Japanese noodles, BBQ rice, and simple hot meals near the sports area.', 'Japanese', 'Food Court 6, near Swimming Pool', 'open', '09:00 AM', '06:00 PM', '7-10 min', 4.3, 119, '/images/stalls/Japanese_Food_logo.jpg', FALSE),
('Chicken Rice Station', 6, TRUE, FALSE, 'Halal-friendly chicken rice meals with steamed and roasted options.', 'Chicken Rice', 'Food Court 6, near W14', 'open', '08:30 AM', '05:30 PM', '5-8 min', 4.5, 174, '/images/stalls/Chicken_Rice_Station_Logo.png', FALSE),
('Soup Stall', 6, FALSE, FALSE, 'Comforting noodle soups, fish soup, and warm lunch bowls.', 'Soup / Noodles', 'Food Court 6, near W14', 'closed', '10:00 AM', '05:00 PM', '6-10 min', 4.1, 82, 'https://placehold.co/600x400?text=Soup+Stall', FALSE);


-- ─────────────────────────────────────────────────────────
-- Menu Items
-- 18 stalls × 4 items each = 72 menu items
-- Existing local images are kept.
-- New items without images use NULL.
-- Do not use /images/default-food.jpg.
-- ─────────────────────────────────────────────────────────

INSERT INTO "Menu" (
    "name",
    "variation",
    "description",
    "price",
    "stall_id",
    "foodcourt_id",
    "category",
    "image_url",
    "is_available",
    "is_popular"
) VALUES
-- Stall 1: Korean Kitchen
('Classic Bibimbap Bowl', 'Classic', 'Korean mixed rice bowl with vegetables, egg, sesame oil, and gochujang sauce.', 4.30, 1, 1, 'Rice', '/images/Menu/Korean_Kitchen/Korean_Kitchen-Bibimbap.jpg', TRUE, TRUE),
('Kimchi Tofu Soup', 'None', 'Hot kimchi soup served with tofu, vegetables, and a small portion of rice.', 4.30, 1, 1, 'Soup', '/images/Menu/Korean_Kitchen/Korean_Kitchen-Kimchi_Soup.webp', TRUE, FALSE),
('Chicken Cutlet Omelette Rice', 'Chicken Cutlet', 'Omelette rice served with crispy chicken cutlet and savoury sauce.', 4.50, 1, 1, 'Rice', '/images/Menu/Korean_Kitchen/Korean_Kitchen-Omelette_Rice.jpg', TRUE, FALSE),
('Soy Garlic Chicken Rice', 'Boneless Chicken', 'Soy garlic chicken pieces served with rice and vegetables.', 5.60, 1, 1, 'Chicken', NULL, FALSE, FALSE),

-- Stall 2: Japanese Bento
('Chicken Katsu Curry Bento', 'Chicken Katsu', 'Japanese curry rice topped with crispy chicken katsu.', 4.80, 2, 1, 'Rice', '/images/Menu/Japanese_Bento/Japanese_Bento-ChickenKatsu_CurryRice.jpg', TRUE, TRUE),
('Cheese Omelette Curry Rice', 'Cheese Omelette', 'Japanese curry rice served with a soft cheese omelette.', 3.80, 2, 1, 'Rice', '/images/Menu/Japanese_Bento/Japanese_Bento-CheeseOmelette_CurryRice.jpg', TRUE, FALSE),
('Chicken Katsu Don', 'None', 'Rice bowl topped with chicken katsu and savoury Japanese sauce.', 4.30, 2, 1, 'Rice', '/images/Menu/Japanese_Bento/Japanese_Bento-ChickenKatsu_Don.webp', TRUE, FALSE),
('Ebi Tempura Udon', 'Prawn Tempura', 'Udon noodles served with prawn tempura and warm broth.', 5.40, 2, 1, 'Noodles', NULL, TRUE, FALSE),

-- Stall 3: Chicken Rice Corner
('Steamed Chicken Rice', 'None', 'Steamed chicken with fragrant rice, soup, cucumber, and chilli.', 3.30, 3, 1, 'Chicken', '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice', 'None', 'Roasted chicken served with fragrant rice, soup, and dark sauce.', 3.30, 3, 1, 'Chicken', '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Roasted_ChickenRice.jpg', TRUE, FALSE),
('Chicken Rice Set', 'None', 'Chicken rice set with extra vegetables and soup.', 4.20, 3, 1, 'Chicken', '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Chicken_RiceSet.png', TRUE, FALSE),
('Chicken Porridge', 'Warm Bowl', 'Soft rice porridge served with shredded chicken and spring onions.', 3.20, 3, 1, 'Chicken', NULL, TRUE, FALSE),

-- Stall 4: Noodle House
('Dry Dumpling Noodles', 'Dry', 'Dry noodles served with dumplings and savoury sauce.', 3.50, 4, 2, 'Noodles', '/images/Menu/Noodle_House/Noodle_House-Dumpling_Noodles.jpg', TRUE, FALSE),
('Ban Mian Soup', 'Soup', 'Handmade noodles served in warm soup with vegetables and egg.', 3.50, 4, 2, 'Noodles', '/images/Menu/Noodle_House/Noodle_House-Ban_Mian.jfif', TRUE, TRUE),
('Fish Soup with Rice', 'Rice', 'Light fish soup served with rice and vegetables.', 4.50, 4, 2, 'Soup', '/images/Menu/Noodle_House/Noodle_House-Fish_Soup.jpg', TRUE, FALSE),
('Spicy Laksa Noodles', 'Coconut Broth', 'Noodles served in spicy coconut laksa broth.', 4.80, 4, 2, 'Noodles', NULL, TRUE, TRUE),

-- Stall 5: Japanese Express
('Teriyaki Chicken Rice', 'None', 'Chicken teriyaki served with rice and vegetables.', 4.30, 5, 2, 'Rice', '/images/Menu/Japanese_Express/Japanese_Express-Teriyaki_ChickenRice.jpg', FALSE, TRUE),
('Salmon Don', 'None', 'Japanese salmon rice bowl served with sauce and vegetables.', 5.20, 5, 2, 'Rice', '/images/Menu/Japanese_Express/Japanese_Express-Salmon_Don.png', FALSE, FALSE),
('Miso Soup', 'None', 'Simple warm miso soup with tofu and seaweed.', 2.20, 5, 2, 'Soup', '/images/Menu/Japanese_Express/Japanese_Express-Miso_Soup.jpg', FALSE, FALSE),
('Beef Gyudon Bowl', 'Sliced Beef', 'Japanese beef rice bowl with onions and sweet savoury sauce.', 5.50, 5, 2, 'Rice', NULL, FALSE, TRUE),

-- Stall 6: Green Plate
('Vegetarian Rice Set', 'Daily Vegetables', 'Vegetarian rice set with tofu, vegetables, and light sauce.', 4.30, 6, 2, 'Vegetarian', '/images/Menu/Green_Plate/Green_Plate-Vegetarian_RiceSet.webp', TRUE, TRUE),
('Tofu Noodle Bowl', 'Vegan', 'Noodle bowl with tofu, greens, and light sauce.', 4.50, 6, 2, 'Vegan', '/images/Menu/Green_Plate/Green_Plate-Tofu_NoodleBowl.jpg', TRUE, FALSE),
('Vegetable Soup', 'Vegan', 'Warm vegetable soup with tofu and greens.', 3.80, 6, 2, 'Vegan', '/images/Menu/Green_Plate/Green_Plate-Vegetable_Soup.png', TRUE, FALSE),
('Buddha Bowl', 'Vegan Bowl', 'Vegan bowl with rice, tofu, vegetables, and dressing.', 5.20, 6, 2, 'Vegan', NULL, TRUE, TRUE),

-- Stall 7: Japanese Curry House
('Chicken Katsu Curry Bowl', 'Chicken Katsu', 'Japanese curry rice with crispy chicken katsu.', 4.30, 7, 3, 'Rice', '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-ChickenKatsu_CurryRice.webp', TRUE, TRUE),
('Vegetable Croquette Curry', 'Vegetable Croquette', 'Japanese curry rice with a crispy vegetable croquette.', 4.10, 7, 3, 'Vegetarian', '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-Vegetable Croquette.webp', TRUE, FALSE),
('Chicken Nuggets Curry Rice', 'Chicken Nuggets', 'Japanese curry rice with chicken nuggets.', 4.30, 7, 3, 'Rice', '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-ChickenNuggets_CurryRice.webp', TRUE, FALSE),
('Curry Udon', 'Mild Curry Broth', 'Udon noodles served in mild Japanese curry broth.', 4.80, 7, 3, 'Noodles', NULL, TRUE, FALSE),

-- Stall 8: Korean Bowl
('Spicy Chicken Bibimbap', 'Spicy Chicken', 'Bibimbap topped with spicy chicken, vegetables, and egg.', 4.80, 8, 3, 'Rice', '/images/Menu/Korean_Bowl/Korean_Bowl-SpicyChicken_Bibimbap.jpg', TRUE, TRUE),
('Chicken Cutlet Rice', 'None', 'Chicken cutlet served with rice and Korean-style sauce.', 5.00, 8, 3, 'Chicken', '/images/Menu/Korean_Bowl/Korean_Bowl-Chicken_CutletRice.jpg', TRUE, FALSE),
('Kimchi Fried Rice', 'None', 'Fried rice cooked with kimchi, egg, and Korean seasoning.', 4.50, 8, 3, 'Rice', '/images/Menu/Korean_Bowl/Korean_Bowl-Kimchi_FriedRice.jpg', TRUE, FALSE),
('Japchae Glass Noodles', 'Stir Fried', 'Korean glass noodles stir-fried with vegetables.', 4.70, 8, 3, 'Noodles', NULL, TRUE, FALSE),

-- Stall 9: Hainanese Chicken Rice
('Steamed Chicken Rice', 'None', 'Tender steamed chicken rice with soup.', 3.30, 9, 3, 'Chicken', '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice', 'None', 'Roasted chicken rice with chilli and soup.', 3.30, 9, 3, 'Chicken', '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-Roasted_ChickenRice.jpg', TRUE, FALSE),
('Char Siew Chicken Rice', 'None', 'Chicken rice served with char siew style sauce.', 4.30, 9, 3, 'Chicken', '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-CharSiew_ChickenRice.avif', TRUE, FALSE),
('Roasted Drumstick Rice', 'Drumstick', 'Roasted chicken drumstick served with fragrant rice.', 4.80, 9, 3, 'Chicken', NULL, TRUE, TRUE),

-- Stall 10: Express Chicken Rice
('Steamed Chicken Rice Bowl', 'None', 'Simple steamed chicken rice meal with soup and chilli.', 3.30, 10, 4, 'Chicken', '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice Bowl', 'None', 'Roasted chicken rice served with soup and chilli.', 3.30, 10, 4, 'Chicken', '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Roasted_ChickenRice.jpg', TRUE, FALSE),
('Chicken Cutlet Noodles', 'None', 'Noodles served with crispy chicken cutlet.', 4.50, 10, 4, 'Noodles', '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Chicken_Cutlet_Noodles.webp', TRUE, FALSE),
('Lemon Chicken Rice', 'Crispy Chicken', 'Crispy lemon chicken served with rice.', 4.40, 10, 4, 'Chicken', NULL, TRUE, TRUE),

-- Stall 11: Ban Mian House
('Dumpling Noodles Soup', 'Soup', 'Soup noodles served with dumplings.', 4.00, 11, 4, 'Noodles', '/images/Menu/Ban_Mian_House/Ban_Mian-Dumpling_Noodles.jpg', TRUE, FALSE),
('Dry Ban Mian', 'Dry', 'Dry ban mian served with minced meat and sauce.', 4.00, 11, 4, 'Noodles', '/images/Menu/Ban_Mian_House/Ban_Mian_House-Ban_Mian.jfif', TRUE, TRUE),
('Seafood Noodle Soup', 'Soup', 'Noodles served with seafood and soup.', 4.50, 11, 4, 'Noodles', '/images/Menu/Ban_Mian_House/Ban_Mian_House-Seafood_Noodle.avif', TRUE, FALSE),
('Tom Yum Ban Mian', 'Spicy Soup', 'Ban mian noodles served in spicy tom yum soup.', 4.80, 11, 4, 'Noodles', NULL, TRUE, TRUE),

-- Stall 12: Korean Fried Chicken
('Sweet Spicy Chicken Bowl', 'Sweet & Spicy', 'Korean chicken bowl with sweet and spicy sauce.', 4.50, 12, 4, 'Chicken', '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken-SweetSpicy_ChickenBowl.jpg', FALSE, TRUE),
('Mala Chicken Bowl', 'Mala', 'Korean chicken bowl with mala sauce.', 4.50, 12, 4, 'Chicken', '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken_Mala_ChickenBowl.jpg', FALSE, FALSE),
('Honey Mustard Chicken Bowl', 'Honey Mustard', 'Korean chicken bowl with honey mustard sauce.', 4.50, 12, 4, 'Chicken', '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken-HoneyMustard_ChickenBowl.jpg', FALSE, FALSE),
('Yangnyeom Chicken Bites', 'Spicy Sauce', 'Korean chicken bites coated with spicy yangnyeom sauce.', 5.80, 12, 4, 'Chicken', NULL, FALSE, TRUE),

-- Stall 13: KFC
('Two Piece Fried Chicken Meal', '2 Piece Meal', 'Two pieces of fried chicken served with a side.', 5.50, 13, 5, 'Chicken', '/images/Menu/KFC/KFC-2P_FriendChicken.png', TRUE, TRUE),
('Mac N Cheese', 'Regular', 'Creamy mac and cheese side dish.', 5.50, 13, 5, 'Sides', '/images/Menu/KFC/KFC-MacNCheese.webp', TRUE, FALSE),
('Chicken Wrap', 'Original', 'Chicken wrap with vegetables and sauce.', 6.00, 13, 5, 'Chicken', '/images/Menu/KFC/KFC-Chicken_Wrap.png', TRUE, FALSE),
('Zinger Burger', 'Spicy Chicken', 'Spicy chicken burger with lettuce and sauce.', 6.40, 13, 5, 'Burger', NULL, TRUE, TRUE),

-- Stall 14: Subway
('Chicken Delight Sub', '6-inch', 'Fresh sub with chicken, vegetables, and sauce.', 6.80, 14, 5, 'Sandwich', '/images/Menu/Subway/Subway-Chicken_Delight_Sub.jpg', TRUE, TRUE),
('Spicy Beef Taco Sub', '6-inch', 'Subway-style sandwich with spicy beef filling.', 6.80, 14, 5, 'Sandwich', '/images/Menu/Subway/Subway-Spicy_BeefTaco.jpg', TRUE, FALSE),
('Veggie Delight Sub', '6-inch', 'Vegetarian sub with fresh vegetables and sauce.', 6.80, 14, 5, 'Vegetarian', '/images/Menu/Subway/Subway-Veggie_Delight.jpg', TRUE, TRUE),
('Tuna Mayo Sub', '6-inch', 'Sub sandwich with tuna mayo and vegetables.', 6.20, 14, 5, 'Sandwich', NULL, TRUE, FALSE),

-- Stall 15: Brunch Cafe
('Chicken Mayo Sandwich', 'Toast', 'Toasted sandwich with chicken mayo filling.', 4.80, 15, 5, 'Sandwich', '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Chicken_Mayo_Sandwich.jpg', TRUE, FALSE),
('Mushroom Cream Pasta', 'Cream Sauce', 'Pasta with mushrooms and cream sauce.', 5.20, 15, 5, 'Western', '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Mushroom_Pasta.webp', TRUE, TRUE),
('Iced Latte', 'Regular', 'Chilled latte for a quick cafe drink.', 3.80, 15, 5, 'Drinks', '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Iced_Latte.jpg', TRUE, FALSE),
('Scrambled Egg Toast', 'Breakfast', 'Toast served with scrambled egg.', 4.20, 15, 5, 'Western', NULL, TRUE, TRUE),

-- Stall 16: Japanese Food
('Chicken Udon Soup', 'None', 'Udon soup served with chicken slices.', 4.50, 16, 6, 'Noodles', '/images/Menu/Japanese_Food/Japanese_Food-Chicken_Udon_Soup.jpg', TRUE, TRUE),
('Fried Black Pepper Udon', 'None', 'Fried udon with black pepper sauce.', 4.50, 16, 6, 'Noodles', '/images/Menu/Japanese_Food/Japanese_Food-Fried_BlackPepper_Udon.JPG', TRUE, FALSE),
('Chicken BBQ Rice', 'None', 'Japanese BBQ chicken served with rice.', 4.50, 16, 6, 'Rice', '/images/Menu/Japanese_Food/Japanese_Food-Chicken_BBQRice.webp', TRUE, FALSE),
('Beef Yakiniku Rice', 'Grilled Beef', 'Japanese grilled beef served with rice.', 5.60, 16, 6, 'Rice', NULL, TRUE, TRUE),

-- Stall 17: Chicken Rice Station
('Halal Steamed Chicken Rice', 'None', 'Halal-friendly steamed chicken rice with soup.', 3.30, 17, 6, 'Chicken', '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Steamed_ChickenRice.png', TRUE, TRUE),
('Halal Roasted Chicken Rice', 'None', 'Halal-friendly roasted chicken rice with chilli.', 3.30, 17, 6, 'Chicken', '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Roasted_Chicken_Rice.jpg', TRUE, FALSE),
('Chicken Rice Set', 'None', 'Chicken rice set with vegetables and soup.', 4.20, 17, 6, 'Chicken', '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Chicken_Rice_Set.png', TRUE, FALSE),
('Roasted Drumstick Rice', 'Halal Drumstick', 'Halal-friendly roasted drumstick rice.', 4.80, 17, 6, 'Chicken', NULL, TRUE, TRUE),

-- Stall 18: Soup Stall
('Ban Mian Soup', 'Soup', 'Warm ban mian soup with vegetables.', 3.50, 18, 6, 'Noodles', '/images/Menu/Soup%20Stall/Soup_Stall-Ban_Mian.jfif', FALSE, FALSE),
('Beef Noodle Soup', 'Soup', 'Beef noodles in warm broth.', 4.50, 18, 6, 'Noodles', '/images/Menu/Soup%20Stall/Soup_Stall-Beef_Noodles.avif', FALSE, TRUE),
('Fish Soup with Rice', 'Rice', 'Light fish soup served with rice.', 4.50, 18, 6, 'Soup', '/images/Menu/Soup%20Stall/Soup_Stall-Fish_Soup.png', FALSE, FALSE),
('Herbal Chicken Soup', 'Warm Bowl', 'Herbal chicken soup served hot.', 5.20, 18, 6, 'Soup', NULL, FALSE, TRUE);

-- ─────────────────────────────────────────────────────────
-- Review Hub Seed Reviews
-- These are realistic student reviews for the Review Hub page.
-- ─────────────────────────────────────────────────────────

INSERT INTO "Reviews"
  ("food_id", "reviewer_name", "rating", "review_text", "review_tag", "best_time_to_buy")
VALUES
  (1, 'Alicia', 4.8, 'The bibimbap is filling and flavourful. Good choice when I want a proper meal before a long class.', 'Filling', 'Lunch'),
  (1, 'Marcus', 4.5, 'The vegetables and sauce mix well together. Portion is good for the price.', 'Value for money', 'Before 12pm'),
  (2, 'Jia Min', 4.3, 'The kimchi tofu soup is warm and comforting, especially when the classroom is cold.', 'Comfort food', 'Rainy day'),
  (5, 'Daniel', 4.7, 'Chicken katsu curry is crispy and satisfying. The curry is not too spicy, so it is easy to eat.', 'Popular pick', 'Lunch'),
  (5, 'Siti', 4.6, 'Good portion and worth the price. Queue can be a bit long during peak lunch.', 'Filling', 'Before 12pm'),
  (9, 'Ryan', 4.8, 'Steamed chicken rice is simple but always reliable. The queue moves fast too.', 'Quick bite', 'Lunch'),
  (9, 'Nora', 4.6, 'Affordable and tasty. I usually get this when I cannot decide what to eat.', 'Budget', 'Anytime'),
  (10, 'Ethan', 4.4, 'Roasted chicken rice has good flavour and the chilli makes it better.', 'Local favourite', 'Lunch'),
  (14, 'Chloe', 4.5, 'Ban mian soup is warm and filling. Good when I want something simple after class.', 'Comfort food', 'Afternoon'),
  (16, 'Wei Lun', 4.4, 'Spicy laksa noodles are tasty and the soup has a nice kick.', 'Spicy', 'Lunch'),
  (21, 'Priya', 4.7, 'Vegetarian rice set is balanced and does not feel too heavy. Good healthier option.', 'Healthy', 'Lunch'),
  (22, 'Hafiz', 4.2, 'Tofu noodle bowl is light but still enough for a quick meal.', 'Light meal', 'Afternoon'),
  (24, 'Sarah', 4.7, 'Buddha bowl is fresh and colourful. I like it when I want something cleaner.', 'Healthy', 'After gym'),
  (25, 'Brandon', 4.7, 'Chicken katsu curry bowl is one of the safest choices. Crispy chicken and curry match well.', 'Popular pick', 'Lunch'),
  (29, 'Shermaine', 4.8, 'Spicy chicken bibimbap is really good if you like stronger flavour.', 'Spicy', 'Lunch'),
  (29, 'Joel', 4.6, 'The portion is filling and the spicy chicken makes it more satisfying.', 'Filling', 'Lunch'),
  (33, 'Farah', 4.8, 'Hainanese steamed chicken rice is affordable, tasty, and fast to get.', 'Budget', 'Before peak hour'),
  (34, 'Kenneth', 4.5, 'Roasted chicken rice tastes good and the rice is fragrant.', 'Local favourite', 'Lunch'),
  (36, 'Mei Qi', 4.6, 'Roasted drumstick rice is more filling than the normal chicken rice. Worth it when hungry.', 'Filling', 'Lunch'),
  (40, 'Arun', 4.5, 'Lemon chicken rice is crispy and refreshing. Good if you want chicken but not chicken rice.', 'Crispy', 'Lunch'),
  (42, 'Vanessa', 4.5, 'Dry ban mian is tasty and the sauce is not too salty.', 'Comfort food', 'Afternoon'),
  (44, 'Jun Hao', 4.6, 'Tom yum ban mian is spicy and shiok. Good for people who like stronger soup.', 'Spicy', 'Lunch'),
  (45, 'Isabelle', 4.6, 'Sweet spicy chicken bowl has nice sauce and decent portion.', 'Spicy', 'Lunch'),
  (49, 'Darren', 4.5, 'KFC two piece meal is filling and convenient when I want something fast.', 'Filling', 'Lunch'),
  (52, 'Natasha', 4.6, 'Zinger burger is tasty and good when I want a quick fast food meal.', 'Quick bite', 'Break time'),
  (53, 'Rae', 4.6, 'Chicken Delight Sub is fresh and easy to eat between classes.', 'Quick bite', 'Lunch'),
  (55, 'Irfan', 4.7, 'Veggie Delight Sub is a good lighter option and still feels fresh.', 'Healthy', 'Afternoon'),
  (58, 'Grace', 4.4, 'Mushroom cream pasta is creamy and feels like cafe food.', 'Comfort food', 'Lunch'),
  (65, 'Lucas', 4.6, 'Chicken udon soup is warm and good after sports.', 'Comfort food', 'After CCA'),
  (68, 'Tanya', 4.7, 'Beef yakiniku rice is flavourful and filling. One of the better options at FC6.', 'Filling', 'Lunch')
ON CONFLICT DO NOTHING;


-- ─────────────────────────────────────────────────────────
-- Add review/stat columns for Review Hub
-- Safe even if schema.sql already has these columns.
-- ─────────────────────────────────────────────────────────

ALTER TABLE "Menu"
ADD COLUMN IF NOT EXISTS "item_rating" DECIMAL(2,1) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS "item_review_count" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "taste_rating" DECIMAL(2,1) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS "value_rating" DECIMAL(2,1) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS "portion_rating" DECIMAL(2,1) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS "order_count" INT DEFAULT 0;


-- ─────────────────────────────────────────────────────────
-- Seed review stats for menu items
-- These are starting values for Review Hub.
-- Real review calculation will be added later.
-- ─────────────────────────────────────────────────────────

UPDATE "Menu"
SET
  "item_rating" = CASE "food_id"
    WHEN 1 THEN 4.6
    WHEN 2 THEN 4.3
    WHEN 3 THEN 4.1
    WHEN 4 THEN 3.9
    WHEN 5 THEN 4.7
    WHEN 6 THEN 4.2
    WHEN 7 THEN 4.4
    WHEN 8 THEN 4.1
    WHEN 9 THEN 4.7
    WHEN 10 THEN 4.4
    WHEN 11 THEN 4.5
    WHEN 12 THEN 4.0
    WHEN 13 THEN 4.2
    WHEN 14 THEN 4.5
    WHEN 15 THEN 4.1
    WHEN 16 THEN 4.4
    WHEN 17 THEN 4.3
    WHEN 18 THEN 4.1
    WHEN 19 THEN 3.9
    WHEN 20 THEN 4.4
    WHEN 21 THEN 4.6
    WHEN 22 THEN 4.2
    WHEN 23 THEN 4.0
    WHEN 24 THEN 4.7
    WHEN 25 THEN 4.7
    WHEN 26 THEN 4.2
    WHEN 27 THEN 4.1
    WHEN 28 THEN 4.3
    WHEN 29 THEN 4.8
    WHEN 30 THEN 4.3
    WHEN 31 THEN 4.2
    WHEN 32 THEN 4.0
    WHEN 33 THEN 4.8
    WHEN 34 THEN 4.5
    WHEN 35 THEN 4.3
    WHEN 36 THEN 4.6
    WHEN 37 THEN 4.4
    WHEN 38 THEN 4.2
    WHEN 39 THEN 4.1
    WHEN 40 THEN 4.5
    WHEN 41 THEN 4.1
    WHEN 42 THEN 4.5
    WHEN 43 THEN 4.2
    WHEN 44 THEN 4.6
    WHEN 45 THEN 4.6
    WHEN 46 THEN 4.1
    WHEN 47 THEN 4.3
    WHEN 48 THEN 4.7
    WHEN 49 THEN 4.5
    WHEN 50 THEN 4.0
    WHEN 51 THEN 4.2
    WHEN 52 THEN 4.6
    WHEN 53 THEN 4.6
    WHEN 54 THEN 4.2
    WHEN 55 THEN 4.7
    WHEN 56 THEN 4.1
    WHEN 57 THEN 4.1
    WHEN 58 THEN 4.4
    WHEN 59 THEN 4.0
    WHEN 60 THEN 4.5
    WHEN 61 THEN 4.4
    WHEN 62 THEN 4.2
    WHEN 63 THEN 4.3
    WHEN 64 THEN 4.6
    WHEN 65 THEN 4.6
    WHEN 66 THEN 4.3
    WHEN 67 THEN 4.2
    WHEN 68 THEN 4.7
    WHEN 69 THEN 4.1
    WHEN 70 THEN 4.5
    WHEN 71 THEN 4.0
    WHEN 72 THEN 4.3
    ELSE 4.0
  END,

  "item_review_count" = CASE "food_id"
    WHEN 1 THEN 94
    WHEN 2 THEN 47
    WHEN 3 THEN 38
    WHEN 4 THEN 19
    WHEN 5 THEN 106
    WHEN 6 THEN 41
    WHEN 7 THEN 62
    WHEN 8 THEN 27
    WHEN 9 THEN 168
    WHEN 10 THEN 124
    WHEN 11 THEN 89
    WHEN 12 THEN 36
    WHEN 13 THEN 44
    WHEN 14 THEN 77
    WHEN 15 THEN 58
    WHEN 16 THEN 63
    WHEN 17 THEN 39
    WHEN 18 THEN 28
    WHEN 19 THEN 15
    WHEN 20 THEN 31
    WHEN 21 THEN 91
    WHEN 22 THEN 52
    WHEN 23 THEN 36
    WHEN 24 THEN 73
    WHEN 25 THEN 132
    WHEN 26 THEN 48
    WHEN 27 THEN 35
    WHEN 28 THEN 42
    WHEN 29 THEN 144
    WHEN 30 THEN 68
    WHEN 31 THEN 57
    WHEN 32 THEN 26
    WHEN 33 THEN 186
    WHEN 34 THEN 142
    WHEN 35 THEN 64
    WHEN 36 THEN 97
    WHEN 37 THEN 111
    WHEN 38 THEN 83
    WHEN 39 THEN 46
    WHEN 40 THEN 71
    WHEN 41 THEN 35
    WHEN 42 THEN 88
    WHEN 43 THEN 54
    WHEN 44 THEN 69
    WHEN 45 THEN 102
    WHEN 46 THEN 41
    WHEN 47 THEN 58
    WHEN 48 THEN 76
    WHEN 49 THEN 208
    WHEN 50 THEN 87
    WHEN 51 THEN 96
    WHEN 52 THEN 176
    WHEN 53 THEN 129
    WHEN 54 THEN 74
    WHEN 55 THEN 118
    WHEN 56 THEN 51
    WHEN 57 THEN 42
    WHEN 58 THEN 66
    WHEN 59 THEN 31
    WHEN 60 THEN 58
    WHEN 61 THEN 73
    WHEN 62 THEN 49
    WHEN 63 THEN 53
    WHEN 64 THEN 81
    WHEN 65 THEN 121
    WHEN 66 THEN 86
    WHEN 67 THEN 59
    WHEN 68 THEN 93
    WHEN 69 THEN 28
    WHEN 70 THEN 54
    WHEN 71 THEN 22
    WHEN 72 THEN 39
    ELSE 0
  END,

  "taste_rating" = CASE "food_id"
    WHEN 1 THEN 4.7
    WHEN 2 THEN 4.4
    WHEN 3 THEN 4.2
    WHEN 4 THEN 4.0
    WHEN 5 THEN 4.8
    WHEN 6 THEN 4.3
    WHEN 7 THEN 4.5
    WHEN 8 THEN 4.2
    WHEN 9 THEN 4.7
    WHEN 10 THEN 4.5
    WHEN 11 THEN 4.4
    WHEN 12 THEN 4.0
    WHEN 13 THEN 4.2
    WHEN 14 THEN 4.6
    WHEN 15 THEN 4.1
    WHEN 16 THEN 4.6
    WHEN 17 THEN 4.4
    WHEN 18 THEN 4.2
    WHEN 19 THEN 3.9
    WHEN 20 THEN 4.5
    WHEN 21 THEN 4.5
    WHEN 22 THEN 4.1
    WHEN 23 THEN 4.0
    WHEN 24 THEN 4.6
    WHEN 25 THEN 4.8
    WHEN 26 THEN 4.2
    WHEN 27 THEN 4.1
    WHEN 28 THEN 4.4
    WHEN 29 THEN 4.9
    WHEN 30 THEN 4.4
    WHEN 31 THEN 4.3
    WHEN 32 THEN 4.0
    WHEN 33 THEN 4.8
    WHEN 34 THEN 4.6
    WHEN 35 THEN 4.3
    WHEN 36 THEN 4.7
    WHEN 37 THEN 4.5
    WHEN 38 THEN 4.2
    WHEN 39 THEN 4.1
    WHEN 40 THEN 4.6
    WHEN 41 THEN 4.2
    WHEN 42 THEN 4.6
    WHEN 43 THEN 4.3
    WHEN 44 THEN 4.7
    WHEN 45 THEN 4.7
    WHEN 46 THEN 4.2
    WHEN 47 THEN 4.4
    WHEN 48 THEN 4.8
    WHEN 49 THEN 4.6
    WHEN 50 THEN 4.0
    WHEN 51 THEN 4.2
    WHEN 52 THEN 4.7
    WHEN 53 THEN 4.6
    WHEN 54 THEN 4.2
    WHEN 55 THEN 4.7
    WHEN 56 THEN 4.1
    WHEN 57 THEN 4.1
    WHEN 58 THEN 4.5
    WHEN 59 THEN 4.0
    WHEN 60 THEN 4.6
    WHEN 61 THEN 4.4
    WHEN 62 THEN 4.2
    WHEN 63 THEN 4.3
    WHEN 64 THEN 4.7
    WHEN 65 THEN 4.6
    WHEN 66 THEN 4.3
    WHEN 67 THEN 4.2
    WHEN 68 THEN 4.7
    WHEN 69 THEN 4.1
    WHEN 70 THEN 4.6
    WHEN 71 THEN 4.0
    WHEN 72 THEN 4.4
    ELSE 4.2
  END,

  "value_rating" = CASE "food_id"
    WHEN 1 THEN 4.4
    WHEN 2 THEN 4.2
    WHEN 3 THEN 4.1
    WHEN 4 THEN 3.8
    WHEN 5 THEN 4.3
    WHEN 6 THEN 4.0
    WHEN 7 THEN 4.2
    WHEN 8 THEN 4.1
    WHEN 9 THEN 4.8
    WHEN 10 THEN 4.6
    WHEN 11 THEN 4.4
    WHEN 12 THEN 4.3
    WHEN 13 THEN 4.3
    WHEN 14 THEN 4.6
    WHEN 15 THEN 4.0
    WHEN 16 THEN 4.2
    WHEN 17 THEN 4.1
    WHEN 18 THEN 3.9
    WHEN 19 THEN 4.2
    WHEN 20 THEN 4.0
    WHEN 21 THEN 4.5
    WHEN 22 THEN 4.2
    WHEN 23 THEN 4.1
    WHEN 24 THEN 4.3
    WHEN 25 THEN 4.5
    WHEN 26 THEN 4.4
    WHEN 27 THEN 4.1
    WHEN 28 THEN 4.0
    WHEN 29 THEN 4.4
    WHEN 30 THEN 4.1
    WHEN 31 THEN 4.3
    WHEN 32 THEN 4.0
    WHEN 33 THEN 4.8
    WHEN 34 THEN 4.6
    WHEN 35 THEN 4.2
    WHEN 36 THEN 4.4
    WHEN 37 THEN 4.6
    WHEN 38 THEN 4.3
    WHEN 39 THEN 4.1
    WHEN 40 THEN 4.4
    WHEN 41 THEN 4.2
    WHEN 42 THEN 4.5
    WHEN 43 THEN 4.1
    WHEN 44 THEN 4.3
    WHEN 45 THEN 4.4
    WHEN 46 THEN 4.0
    WHEN 47 THEN 4.2
    WHEN 48 THEN 4.3
    WHEN 49 THEN 4.2
    WHEN 50 THEN 3.9
    WHEN 51 THEN 4.0
    WHEN 52 THEN 4.1
    WHEN 53 THEN 4.1
    WHEN 54 THEN 4.0
    WHEN 55 THEN 4.2
    WHEN 56 THEN 4.0
    WHEN 57 THEN 4.0
    WHEN 58 THEN 4.1
    WHEN 59 THEN 3.8
    WHEN 60 THEN 4.2
    WHEN 61 THEN 4.2
    WHEN 62 THEN 4.0
    WHEN 63 THEN 4.1
    WHEN 64 THEN 4.3
    WHEN 65 THEN 4.7
    WHEN 66 THEN 4.5
    WHEN 67 THEN 4.3
    WHEN 68 THEN 4.5
    WHEN 69 THEN 4.0
    WHEN 70 THEN 4.2
    WHEN 71 THEN 3.9
    WHEN 72 THEN 4.1
    ELSE 4.1
  END,

  "portion_rating" = CASE "food_id"
    WHEN 1 THEN 4.5
    WHEN 2 THEN 4.0
    WHEN 3 THEN 4.2
    WHEN 4 THEN 4.1
    WHEN 5 THEN 4.6
    WHEN 6 THEN 4.3
    WHEN 7 THEN 4.4
    WHEN 8 THEN 4.0
    WHEN 9 THEN 4.5
    WHEN 10 THEN 4.4
    WHEN 11 THEN 4.6
    WHEN 12 THEN 3.8
    WHEN 13 THEN 4.0
    WHEN 14 THEN 4.4
    WHEN 15 THEN 4.1
    WHEN 16 THEN 4.3
    WHEN 17 THEN 4.2
    WHEN 18 THEN 4.0
    WHEN 19 THEN 3.7
    WHEN 20 THEN 4.3
    WHEN 21 THEN 4.3
    WHEN 22 THEN 4.1
    WHEN 23 THEN 3.9
    WHEN 24 THEN 4.5
    WHEN 25 THEN 4.6
    WHEN 26 THEN 4.2
    WHEN 27 THEN 4.0
    WHEN 28 THEN 4.3
    WHEN 29 THEN 4.7
    WHEN 30 THEN 4.4
    WHEN 31 THEN 4.1
    WHEN 32 THEN 4.0
    WHEN 33 THEN 4.6
    WHEN 34 THEN 4.5
    WHEN 35 THEN 4.3
    WHEN 36 THEN 4.7
    WHEN 37 THEN 4.4
    WHEN 38 THEN 4.2
    WHEN 39 THEN 4.0
    WHEN 40 THEN 4.5
    WHEN 41 THEN 4.0
    WHEN 42 THEN 4.5
    WHEN 43 THEN 4.2
    WHEN 44 THEN 4.6
    WHEN 45 THEN 4.5
    WHEN 46 THEN 4.0
    WHEN 47 THEN 4.2
    WHEN 48 THEN 4.6
    WHEN 49 THEN 4.3
    WHEN 50 THEN 3.9
    WHEN 51 THEN 4.0
    WHEN 52 THEN 4.4
    WHEN 53 THEN 4.1
    WHEN 54 THEN 4.0
    WHEN 55 THEN 4.2
    WHEN 56 THEN 4.0
    WHEN 57 THEN 4.0
    WHEN 58 THEN 4.2
    WHEN 59 THEN 3.7
    WHEN 60 THEN 4.3
    WHEN 61 THEN 4.2
    WHEN 62 THEN 4.0
    WHEN 63 THEN 4.1
    WHEN 64 THEN 4.4
    WHEN 65 THEN 4.5
    WHEN 66 THEN 4.4
    WHEN 67 THEN 4.2
    WHEN 68 THEN 4.6
    WHEN 69 THEN 4.0
    WHEN 70 THEN 4.3
    WHEN 71 THEN 3.8
    WHEN 72 THEN 4.2
    ELSE 4.1
  END,

  "order_count" = CASE "food_id"
    WHEN 1 THEN 156
    WHEN 2 THEN 82
    WHEN 3 THEN 61
    WHEN 4 THEN 33
    WHEN 5 THEN 171
    WHEN 6 THEN 67
    WHEN 7 THEN 101
    WHEN 8 THEN 44
    WHEN 9 THEN 244
    WHEN 10 THEN 198
    WHEN 11 THEN 137
    WHEN 12 THEN 52
    WHEN 13 THEN 73
    WHEN 14 THEN 121
    WHEN 15 THEN 90
    WHEN 16 THEN 98
    WHEN 17 THEN 63
    WHEN 18 THEN 42
    WHEN 19 THEN 23
    WHEN 20 THEN 46
    WHEN 21 THEN 132
    WHEN 22 THEN 78
    WHEN 23 THEN 49
    WHEN 24 THEN 104
    WHEN 25 THEN 211
    WHEN 26 THEN 76
    WHEN 27 THEN 59
    WHEN 28 THEN 68
    WHEN 29 THEN 228
    WHEN 30 THEN 105
    WHEN 31 THEN 87
    WHEN 32 THEN 43
    WHEN 33 THEN 286
    WHEN 34 THEN 224
    WHEN 35 THEN 92
    WHEN 36 THEN 156
    WHEN 37 THEN 171
    WHEN 38 THEN 132
    WHEN 39 THEN 69
    WHEN 40 THEN 108
    WHEN 41 THEN 54
    WHEN 42 THEN 138
    WHEN 43 THEN 81
    WHEN 44 THEN 103
    WHEN 45 THEN 168
    WHEN 46 THEN 63
    WHEN 47 THEN 91
    WHEN 48 THEN 122
    WHEN 49 THEN 322
    WHEN 50 THEN 124
    WHEN 51 THEN 143
    WHEN 52 THEN 264
    WHEN 53 THEN 183
    WHEN 54 THEN 105
    WHEN 55 THEN 171
    WHEN 56 THEN 77
    WHEN 57 THEN 62
    WHEN 58 THEN 94
    WHEN 59 THEN 48
    WHEN 60 THEN 79
    WHEN 61 THEN 103
    WHEN 62 THEN 76
    WHEN 63 THEN 88
    WHEN 64 THEN 119
    WHEN 65 THEN 189
    WHEN 66 THEN 132
    WHEN 67 THEN 86
    WHEN 68 THEN 145
    WHEN 69 THEN 39
    WHEN 70 THEN 83
    WHEN 71 THEN 31
    WHEN 72 THEN 58
    ELSE 0
  END;


-- ─────────────────────────────────────────────────────────
-- Estimated dish metadata
-- ─────────────────────────────────────────────────────────

UPDATE "Menu"
SET
  "description" = CASE
    WHEN LOWER("name") LIKE '%bibimbap%' THEN
      'A Korean rice bowl served with mixed vegetables, egg, gochujang sauce, sesame oil, and seasoned toppings.'

    WHEN LOWER("name") LIKE '%kimchi%' AND LOWER("name") LIKE '%soup%' THEN
      'A hot Korean soup made with kimchi, tofu, vegetables, and a savoury broth.'

    WHEN LOWER("name") LIKE '%kimchi%' AND LOWER("name") LIKE '%fried rice%' THEN
      'Fried rice cooked with kimchi, egg, vegetables, and Korean seasoning.'

    WHEN LOWER("name") LIKE '%korean chicken%' OR LOWER("name") LIKE '%fried chicken%' THEN
      'Crispy chicken pieces coated with savoury Korean-style seasoning or sauce.'

    WHEN LOWER("name") LIKE '%katsu%' AND LOWER("name") LIKE '%curry%' THEN
      'Crispy chicken cutlet served with Japanese curry sauce and rice.'

    WHEN LOWER("name") LIKE '%teriyaki%' THEN
      'Grilled chicken or meat served with sweet savoury teriyaki sauce and rice.'

    WHEN LOWER("name") LIKE '%bento%' THEN
      'A Japanese meal box served with rice, main dish, and side items.'

    WHEN LOWER("name") LIKE '%sushi%' THEN
      'Japanese rice rolls prepared with fillings and seaweed.'

    WHEN LOWER("name") LIKE '%ramen%' THEN
      'Japanese noodles served in broth with toppings.'

    WHEN LOWER("name") LIKE '%udon%' THEN
      'Thick Japanese wheat noodles served with broth or sauce.'

    WHEN LOWER("name") LIKE '%chicken rice%' THEN
      'Steamed or roasted chicken served with fragrant rice, cucumber, chilli sauce, and light soy sauce.'

    WHEN LOWER("name") LIKE '%ban mian%' THEN
      'Handmade noodles served with egg, vegetables, minced meat, and soup.'

    WHEN LOWER("name") LIKE '%fish soup%' THEN
      'Light soup served with sliced fish, vegetables, and noodles or rice.'

    WHEN LOWER("name") LIKE '%subway%' OR LOWER("name") LIKE '%sandwich%' THEN
      'A sandwich served with fillings, vegetables, sauce, and bread.'

    WHEN LOWER("name") LIKE '%burger%' THEN
      'A burger served with patty, bun, sauce, and toppings.'

    WHEN LOWER("name") LIKE '%wrap%' THEN
      'A soft wrap filled with meat or vegetables and sauce.'

    WHEN LOWER("name") LIKE '%salad%' THEN
      'A salad made with vegetables, toppings, and dressing.'

    WHEN LOWER("name") LIKE '%latte%' THEN
      'Cold espresso mixed with milk and ice.'

    WHEN LOWER("name") LIKE '%tea%' THEN
      'A tea-based drink served hot or cold.'

    WHEN LOWER("name") LIKE '%coffee%' THEN
      'A coffee drink prepared with brewed coffee or espresso.'

    WHEN LOWER("category") LIKE '%drink%' THEN
      'A refreshing drink served with ice or chilled ingredients.'

    ELSE
      "description"
  END,

  "calories" = CASE
    WHEN LOWER("category") LIKE '%drink%' THEN 160
    WHEN LOWER("category") LIKE '%dessert%' THEN 320
    WHEN LOWER("category") LIKE '%snack%' THEN 380
    WHEN LOWER("category") LIKE '%rice%' THEN 580
    WHEN LOWER("category") LIKE '%noodle%' THEN 540
    WHEN LOWER("name") LIKE '%fried%' THEN 680
    WHEN LOWER("name") LIKE '%burger%' THEN 650
    WHEN LOWER("name") LIKE '%set%' THEN 700
    ELSE 500
  END,

  "nutrition_level" = CASE
    WHEN LOWER("name") LIKE '%salad%' OR LOWER("name") LIKE '%fish soup%' THEN 'Light'
    WHEN LOWER("name") LIKE '%fried%' OR LOWER("name") LIKE '%burger%' OR LOWER("name") LIKE '%kfc%' THEN 'Indulgent'
    WHEN LOWER("category") LIKE '%drink%' THEN 'Light'
    WHEN LOWER("category") LIKE '%rice%' OR LOWER("category") LIKE '%noodle%' THEN 'Filling'
    ELSE 'Moderate'
  END,

  "carb_level" = CASE
    WHEN LOWER("category") LIKE '%rice%' OR LOWER("category") LIKE '%noodle%' THEN 'High carb'
    WHEN LOWER("name") LIKE '%burger%' OR LOWER("name") LIKE '%sandwich%' OR LOWER("name") LIKE '%wrap%' THEN 'Medium carb'
    WHEN LOWER("category") LIKE '%drink%' THEN 'Low carb'
    WHEN LOWER("name") LIKE '%salad%' OR LOWER("name") LIKE '%fish soup%' THEN 'Low carb'
    ELSE 'Medium carb'
  END,

  "protein_level" = CASE
    WHEN LOWER("name") LIKE '%chicken%' OR LOWER("name") LIKE '%fish%' OR LOWER("name") LIKE '%egg%' THEN 'High protein'
    WHEN LOWER("name") LIKE '%beef%' OR LOWER("name") LIKE '%katsu%' OR LOWER("name") LIKE '%bento%' THEN 'High protein'
    WHEN LOWER("category") LIKE '%drink%' THEN 'Low protein'
    ELSE 'Medium protein'
  END,

  "fat_level" = CASE
    WHEN LOWER("name") LIKE '%fried%' OR LOWER("name") LIKE '%kfc%' OR LOWER("name") LIKE '%burger%' THEN 'High fat'
    WHEN LOWER("name") LIKE '%curry%' OR LOWER("name") LIKE '%katsu%' THEN 'Medium fat'
    WHEN LOWER("name") LIKE '%salad%' OR LOWER("name") LIKE '%fish soup%' THEN 'Low fat'
    WHEN LOWER("category") LIKE '%drink%' THEN 'Low fat'
    ELSE 'Medium fat'
  END,

  "sugar_level" = CASE
    WHEN LOWER("category") LIKE '%drink%' THEN 'Medium'
    WHEN LOWER("name") LIKE '%latte%' OR LOWER("name") LIKE '%tea%' OR LOWER("name") LIKE '%coffee%' THEN 'Medium'
    WHEN LOWER("name") LIKE '%cake%' OR LOWER("category") LIKE '%dessert%' THEN 'High'
    ELSE 'Low'
  END,

  "spice_level" = CASE
    WHEN LOWER("name") LIKE '%kimchi%' THEN 'Medium spicy'
    WHEN LOWER("name") LIKE '%curry%' THEN 'Mild spicy'
    WHEN LOWER("name") LIKE '%spicy%' THEN 'Spicy'
    WHEN LOWER("name") LIKE '%bibimbap%' THEN 'Mild spicy'
    ELSE 'Not spicy'
  END,

  "allergen_info" = CASE
    WHEN LOWER("name") LIKE '%egg%' OR LOWER("name") LIKE '%bibimbap%' THEN 'Contains egg. May contain soy or sesame.'
    WHEN LOWER("name") LIKE '%noodle%' OR LOWER("name") LIKE '%ramen%' OR LOWER("name") LIKE '%udon%' OR LOWER("name") LIKE '%ban mian%' THEN 'May contain gluten, egg, or soy.'
    WHEN LOWER("name") LIKE '%latte%' OR LOWER("category") LIKE '%drink%' THEN 'May contain dairy.'
    WHEN LOWER("name") LIKE '%curry%' THEN 'May contain dairy, gluten, or soy.'
    WHEN LOWER("name") LIKE '%chicken%' THEN 'May contain soy, gluten, or sesame.'
    ELSE 'Check with stall before ordering.'
  END,

  "portion_size" = CASE
    WHEN LOWER("category") LIKE '%drink%' THEN 'Regular cup'
    WHEN LOWER("category") LIKE '%snack%' THEN 'Small'
    WHEN LOWER("category") LIKE '%rice%' OR LOWER("category") LIKE '%noodle%' THEN 'Regular bowl'
    WHEN LOWER("name") LIKE '%set%' OR LOWER("name") LIKE '%bento%' THEN 'Large'
    ELSE 'Regular'
  END;
`;

async function seed() {
  console.log('Running seed...');

  try {
    await pool.query(seedSql);
    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();