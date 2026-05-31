const { Pool } = require("pg");

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
  password:
    process.env.DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.PGPASSWORD,
});

const seedSql = `
-- ─────────────────────────────────────────────────────────
-- Seed Data
-- Uses team tables only:
-- "Something", "Person", "User", "FoodCourt", "Stalls", "Menu"
-- Do not insert into food_stalls or menu_items because those are views.
-- ─────────────────────────────────────────────────────────

TRUNCATE TABLE
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

INSERT INTO "FoodCourt" ("name", "location") VALUES
('Food Court 1', 'Level 2, T3B'),
('Food Court 2', 'Level 1, T1A'),
('Food Court 3', 'Poly Centre'),
('Food Court 4', 'Level 1, T18A'),
('Food Court 5', 'Level 2, T3B'),
('Food Court 6', 'Beside Swimming Pool. Near W14');


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
('Bibimbap', 'Classic', 'Mixed rice bowl with vegetables, egg, and Korean sauce.', 4.30, 1, 1, 'Rice', '/images/Menu/Korean_Kitchen/Korean_Kitchen-Bibimbap.jpg', TRUE, TRUE),
('Kimchi Soup', 'None', 'Warm kimchi soup served with rice.', 4.30, 1, 1, 'Soup', '/images/Menu/Korean_Kitchen/Korean_Kitchen-Kimchi_Soup.webp', TRUE, FALSE),
('Omelette Rice', 'Chicken Cutlet', 'Omelette rice served with crispy chicken cutlet.', 4.50, 1, 1, 'Rice', '/images/Menu/Korean_Kitchen/Korean_Kitchen-Omelette_Rice.jpg', TRUE, FALSE),

('Curry Rice', 'Chicken Katsu', 'Japanese curry rice topped with chicken katsu.', 4.80, 2, 1, 'Rice', '/images/Menu/Japanese_Bento/Japanese_Bento-ChickenKatsu_CurryRice.jpg', TRUE, TRUE),
('Curry Rice', 'Cheese Omelette', 'Japanese curry rice with soft cheese omelette.', 3.80, 2, 1, 'Rice', '/images/Menu/Japanese_Bento/Japanese_Bento-CheeseOmelette_CurryRice.jpg', TRUE, FALSE),
('Chicken Katsu Don', 'None', 'Rice bowl topped with chicken katsu and sauce.', 4.30, 2, 1, 'Rice', '/images/Menu/Japanese_Bento/Japanese_Bento-ChickenKatsu_Don.webp', TRUE, FALSE),
('Tamago', 'Tori', 'Japanese egg dish served with chicken topping.', 4.80, 2, 1, 'Japanese', '/images/Menu/Japanese_Bento/Japanese_Bento-Tamago_Tori.jpg', TRUE, FALSE),

('Steamed Chicken Rice', 'None', 'Steamed chicken with fragrant rice, soup, and chilli.', 3.30, 3, 1, 'Chicken', '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice', 'None', 'Roasted chicken served with fragrant rice and soup.', 3.30, 3, 1, 'Chicken', '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Roasted_ChickenRice.jpg', TRUE, FALSE),
('Chicken Rice Set', 'None', 'Chicken rice set with extra vegetables and soup.', 4.20, 3, 1, 'Chicken', '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Chicken_RiceSet.png', TRUE, FALSE),

('Dumpling Noodles', 'Dry', 'Noodles served with dumplings and savoury sauce.', 3.50, 4, 2, 'Noodles', '/images/Menu/Noodle_House/Noodle_House-Dumpling_Noodles.jpg', TRUE, FALSE),
('Ban Mian', 'Soup', 'Handmade noodles served in warm soup.', 3.50, 4, 2, 'Noodles', '/images/Menu/Noodle_House/Noodle_House-Ban_Mian.jfif', TRUE, TRUE),
('Fish Soup', 'Rice', 'Light fish soup served with rice.', 4.50, 4, 2, 'Soup', '/images/Menu/Noodle_House/Noodle_House-Fish_Soup.jpg', TRUE, FALSE),

('Teriyaki Chicken Rice', 'None', 'Chicken teriyaki served with rice and vegetables.', 4.30, 5, 2, 'Rice', '/images/Menu/Japanese_Express/Japanese_Express-Teriyaki_ChickenRice.jpg', FALSE, TRUE),
('Salmon Don', 'None', 'Japanese salmon rice bowl with sauce.', 5.20, 5, 2, 'Rice', '/images/Menu/Japanese_Express/Japanese_Express-Salmon_Don.png', FALSE, FALSE),
('Miso Soup', 'None', 'Simple warm miso soup.', 2.20, 5, 2, 'Soup', '/images/Menu/Japanese_Express/Japanese_Express-Miso_Soup.jpg', FALSE, FALSE),

('Vegetarian Rice Set', 'Daily Vegetables', 'Vegetarian rice set with tofu and vegetables.', 4.30, 6, 2, 'Vegetarian', '/images/Menu/Green_Plate/Green_Plate-Vegetarian_RiceSet.webp', TRUE, TRUE),
('Tofu Noodle Bowl', 'Vegan', 'Noodle bowl with tofu, greens, and light sauce.', 4.50, 6, 2, 'Vegan', '/images/Menu/Green_Plate/Green_Plate-Tofu_NoodleBowl.jpg', TRUE, FALSE),
('Vegetable Soup', 'Vegan', 'Warm vegetable soup with tofu and greens.', 3.80, 6, 2, 'Vegan', '/images/Menu/Green_Plate/Green_Plate-Vegetable_Soup.png', TRUE, FALSE),

('Curry Rice', 'Chicken Katsu', 'Japanese curry rice with crispy chicken katsu.', 4.30, 7, 3, 'Rice', '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-ChickenKatsu_CurryRice.webp', TRUE, TRUE),
('Curry Rice', 'Vegetable Croquette', 'Japanese curry rice with vegetable croquette.', 4.10, 7, 3, 'Vegetarian', '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-Vegetable Croquette.webp', TRUE, FALSE),
('Curry Rice', 'Chicken Nuggets', 'Japanese curry rice with chicken nuggets.', 4.30, 7, 3, 'Rice', '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-ChickenNuggets_CurryRice.webp', TRUE, FALSE),

('Bibimbap', 'Spicy Chicken', 'Bibimbap topped with spicy chicken and vegetables.', 4.80, 8, 3, 'Rice', '/images/Menu/Korean_Bowl/Korean_Bowl-SpicyChicken_Bibimbap.jpg', TRUE, TRUE),
('Chicken Cutlet Rice', 'None', 'Chicken cutlet served with rice and sauce.', 5.00, 8, 3, 'Chicken', '/images/Menu/Korean_Bowl/Korean_Bowl-Chicken_CutletRice.jpg', TRUE, FALSE),
('Kimchi Fried Rice', 'None', 'Fried rice with kimchi and egg.', 4.50, 8, 3, 'Rice', '/images/Menu/Korean_Bowl/Korean_Bowl-Kimchi_FriedRice.jpg', TRUE, FALSE),

('Steamed Chicken Rice', 'None', 'Tender steamed chicken rice with soup.', 3.30, 9, 3, 'Chicken', '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice', 'None', 'Roasted chicken rice with chilli and soup.', 3.30, 9, 3, 'Chicken', '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-Roasted_ChickenRice.jpg', TRUE, FALSE),
('Char Siew Chicken Rice', 'None', 'Chicken rice served with char siew style sauce.', 4.30, 9, 3, 'Chicken', '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-CharSiew_ChickenRice.avif', TRUE, FALSE),

('Steamed Chicken Rice', 'None', 'Simple steamed chicken rice meal.', 3.30, 10, 4, 'Chicken', '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice', 'None', 'Roasted chicken rice served with soup.', 3.30, 10, 4, 'Chicken', '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Roasted_ChickenRice.jpg', TRUE, FALSE),
('Chicken Cutlet Noodles', 'None', 'Noodles served with crispy chicken cutlet.', 4.50, 10, 4, 'Noodles', '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Chicken_Cutlet_Noodles.webp', TRUE, FALSE),

('Dumpling Noodles', 'Soup', 'Soup noodles served with dumplings.', 4.00, 11, 4, 'Noodles', '/images/Menu/Ban_Mian_House/Ban_Mian-Dumpling_Noodles.jpg', TRUE, FALSE),
('Ban Mian', 'Dry', 'Dry ban mian served with minced meat and sauce.', 4.00, 11, 4, 'Noodles', '/images/Menu/Ban_Mian_House/Ban_Mian_House-Ban_Mian.jfif', TRUE, TRUE),
('Seafood Noodle', 'Soup', 'Noodles served with seafood and soup.', 4.50, 11, 4, 'Noodles', '/images/Menu/Ban_Mian_House/Ban_Mian_House-Seafood_Noodle.avif', TRUE, FALSE),

('Korean Chicken Bowl', 'Sweet & Spicy', 'Korean chicken bowl with sweet and spicy sauce.', 4.50, 12, 4, 'Chicken', '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken-SweetSpicy_ChickenBowl.jpg', FALSE, TRUE),
('Korean Chicken Bowl', 'Mala', 'Korean chicken bowl with mala sauce.', 4.50, 12, 4, 'Chicken', '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken_Mala_ChickenBowl.jpg', FALSE, FALSE),
('Korean Chicken Bowl', 'Honey Mustard', 'Korean chicken bowl with honey mustard sauce.', 4.50, 12, 4, 'Chicken', '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken-HoneyMustard_ChickenBowl.jpg', FALSE, FALSE),

('Fried Chicken', '2 Piece Meal', 'Two pieces of fried chicken served with a side.', 5.50, 13, 5, 'Chicken', '/images/Menu/KFC/KFC-2P_FriendChicken.png', TRUE, TRUE),
('Mac N Cheese', 'Regular', 'Creamy mac and cheese side dish.', 5.50, 13, 5, 'Sides', '/images/Menu/KFC/KFC-MacNCheese.webp', TRUE, FALSE),
('Chicken Wrap', 'Original', 'Chicken wrap with vegetables and sauce.', 6.00, 13, 5, 'Chicken', '/images/Menu/KFC/KFC-Chicken_Wrap.png', TRUE, FALSE),

('Chicken Delight Sub', '6-inch', 'Fresh sub with chicken, vegetables, and sauce.', 6.80, 14, 5, 'Sandwich', '/images/Menu/Subway/Subway-Chicken_Delight_Sub.jpg', TRUE, TRUE),
('Spicy Beef Taco', '6-inch', 'Subway-style sandwich with spicy beef filling.', 6.80, 14, 5, 'Sandwich', '/images/Menu/Subway/Subway-Spicy_BeefTaco.jpg', TRUE, FALSE),
('Veggie Delight', '6-inch', 'Vegetarian sub with fresh vegetables and sauce.', 6.80, 14, 5, 'Vegetarian', '/images/Menu/Subway/Subway-Veggie_Delight.jpg', TRUE, TRUE),

('Chicken Mayo Sandwich', 'Toast', 'Toasted sandwich with chicken mayo filling.', 4.80, 15, 5, 'Sandwich', '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Chicken_Mayo_Sandwich.jpg', TRUE, FALSE),
('Mushroom Pasta', 'Cream Sauce', 'Pasta with mushrooms and cream sauce.', 5.20, 15, 5, 'Western', '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Mushroom_Pasta.webp', TRUE, TRUE),
('Iced Latte', 'Regular', 'Chilled latte for a quick cafe drink.', 3.80, 15, 5, 'Drinks', '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Iced_Latte.jpg', TRUE, FALSE),

('Chicken Udon Soup', 'None', 'Udon soup served with chicken slices.', 4.50, 16, 6, 'Noodles', '/images/Menu/Japanese_Food/Japanese_Food-Chicken_Udon_Soup.jpg', TRUE, TRUE),
('Fried Black Pepper Udon', 'None', 'Fried udon with black pepper sauce.', 4.50, 16, 6, 'Noodles', '/images/Menu/Japanese_Food/Japanese_Food-Fried_BlackPepper_Udon.JPG', TRUE, FALSE),
('Chicken BBQ Rice', 'None', 'Japanese BBQ chicken served with rice.', 4.50, 16, 6, 'Rice', '/images/Menu/Japanese_Food/Japanese_Food-Chicken_BBQRice.webp', TRUE, FALSE),

('Steamed Chicken Rice', 'None', 'Halal-friendly steamed chicken rice with soup.', 3.30, 17, 6, 'Chicken', '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Steamed_ChickenRice.png', TRUE, TRUE),
('Roasted Chicken Rice', 'None', 'Halal-friendly roasted chicken rice with chilli.', 3.30, 17, 6, 'Chicken', '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Roasted_Chicken_Rice.jpg', TRUE, FALSE),
('Chicken Rice Set', 'None', 'Chicken rice set with vegetables and soup.', 4.20, 17, 6, 'Chicken', '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Chicken_Rice_Set.png', TRUE, FALSE),

('Ban Mian', 'Soup', 'Warm ban mian soup with vegetables.', 3.50, 18, 6, 'Noodles', '/images/Menu/Soup%20Stall/Soup_Stall-Ban_Mian.jfif', FALSE, FALSE),
('Beef Noodles', 'Soup', 'Beef noodles in warm broth.', 4.50, 18, 6, 'Noodles', '/images/Menu/Soup%20Stall/Soup_Stall-Beef_Noodles.avif', FALSE, TRUE),
('Fish Soup', 'Rice', 'Light fish soup served with rice.', 4.50, 18, 6, 'Soup', '/images/Menu/Soup%20Stall/Soup_Stall-Fish_Soup.png', FALSE, FALSE);
`;

async function seed() {
  console.log("Running seed...");

  try {
    await pool.query(seedSql);
    console.log("Seed data inserted successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
