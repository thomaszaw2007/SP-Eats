const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const persons = [
  { email: 'alice@example.com', name: 'Alice' },
  { email: 'bob@example.com', name: 'Bob' },
  { email: 'carol@example.com', name: 'Carol' },
  { email: 'dave@example.com', name: 'Dave' },
  { email: 'eve@example.com', name: 'Eve' },
  { email: 'frank@example.com', name: 'Frank' },
  { email: 'grace@example.com', name: 'Grace' },
  { email: 'heidi@example.com', name: 'Heidi' },
  { email: 'ivan@example.com', name: 'Ivan' },
  { email: 'judy@example.com', name: 'Judy' },
  { email: 'mallory@example.com', name: 'Mallory' },
  { email: 'oscar@example.com', name: 'Oscar' },
  { email: 'peggy@example.com', name: 'Peggy' },
  { email: 'trent@example.com', name: 'Trent' },
  { email: 'victor@example.com', name: 'Victor' },
  { email: 'walter@example.com', name: 'Walter' },
  { email: 'xavier@example.com', name: 'Xavier' },
  { email: 'yvonne@example.com', name: 'Yvonne' },
  { email: 'zara@example.com', name: 'Zara' },
  { email: 'leo@example.com', name: 'Leo' },
];

const somethings = [{ name: 'Seed 1' }, { name: 'Seed 2' }];

const users = [
  { username: 'Admin', email: 'admin@gmail.com', password: 'admin' }
];

const foodcourts = [
  { name: 'Food Court 1', location: 'Level 2, T3B' },
  { name: 'Food Court 2', location: 'Level 1, T1A' },
  { name: 'Food Court 3', location: 'Poly Centre' },
  { name: 'Food Court 4', location: 'Level 1, T18A' },
  { name: 'Food Court 5', location: 'Level 2, T3B' },
  { name: 'Food Court 6', location: 'Beside Swimming Pool. Near W14' }
];

const stalls = [
  { name: 'Korean', foodcourt_id: 1, halal: false, vegetarian: false },
  { name: 'Japanese', foodcourt_id: 1, halal: false, vegetarian: false },
  { name: 'Chicken Rice', foodcourt_id: 1, halal: true, vegetarian: false },
  { name: 'Noodles', foodcourt_id: 2, halal: false, vegetarian: false },
  { name: 'Japanese', foodcourt_id: 2, halal: false, vegetarian: false },
  { name: 'Vegetarian', foodcourt_id: 2, halal: false, vegetarian: true },
  { name: 'Japanese Curry House', foodcourt_id: 3, halal: false, vegetarian: true },
  { name: 'Korean', foodcourt_id: 3, halal: false, vegetarian: false },
  { name: 'Chicken Rice', foodcourt_id: 3, halal: true, vegetarian: false },
  { name: 'Chicken Rice', foodcourt_id: 4, halal: true, vegetarian: false },
  { name: 'Ban Mian', foodcourt_id: 4, halal: false, vegetarian: false },
  { name: 'Korean Fried Chicken', foodcourt_id: 4, halal: false, vegetarian: false },
  { name: 'KFC', foodcourt_id: 5, halal: true, vegetarian: false },
  { name: 'Subway', foodcourt_id: 5, halal: true, vegetarian: true },
  { name: 'Brunch Cafe', foodcourt_id: 5, halal: false, vegetarian: false },
  { name: 'Japanese Food', foodcourt_id: 6, halal: false, vegetarian: false },
  { name: 'Chicken Rice', foodcourt_id: 6, halal: true, vegetarian: false },
  { name: 'Soup Stall', foodcourt_id: 6, halal: false, vegetarian: false }
];

const menu = [
  { name: 'Bibimbap', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 1, foodcourt_id: 1 },
  { name: 'Kimchi Soup', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 1, foodcourt_id: 1 },
  { name: 'Omelette Rice', variation: 'Chicken Cutlet', description: 'Admin food item', price: 4.50, stall_id: 1, foodcourt_id: 1 },
  { name: 'Curry Rice', variation: 'Chicken Katsu', description: 'Admin food item', price: 4.80, stall_id: 2, foodcourt_id: 1 },
  { name: 'Curry Rice', variation: 'Cheese Omelette', description: 'Admin food item', price: 3.00, stall_id: 2, foodcourt_id: 1 },
  { name: 'Don', variation: 'Chicken Katsu', description: 'Admin food item', price: 4.30, stall_id: 2, foodcourt_id: 1 },
  { name: 'Tamago', variation: 'None', description: 'Admin food item', price: 3.50, stall_id: 2, foodcourt_id: 1 },
  { name: 'Tamago', variation: 'Tori', description: 'Admin food item', price: 4.80, stall_id: 2, foodcourt_id: 1 },
  { name: 'Steamed Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 3, foodcourt_id: 1 },
  { name: 'Roasted Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 3, foodcourt_id: 1 },
  { name: 'Chicken Rice Set', variation: 'None', description: 'Admin food item', price: 4.20, stall_id: 3, foodcourt_id: 1 },
  { name: 'Dumpling Noodles', variation: 'None', description: 'Admin food item', price: 3.50, stall_id: 4, foodcourt_id: 2 },
  { name: 'Ban Mian', variation: 'None', description: 'Admin food item', price: 3.50, stall_id: 4, foodcourt_id: 2 },
  { name: 'Fish Soup', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 4, foodcourt_id: 2 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 5, foodcourt_id: 2 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 5, foodcourt_id: 2 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 5, foodcourt_id: 2 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 6, foodcourt_id: 2 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 6, foodcourt_id: 2 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 6, foodcourt_id: 2 },
  { name: 'Curry Rice', variation: 'Chicken Katsu', description: 'Admin food item', price: 4.30, stall_id: 7, foodcourt_id: 3 },
  { name: 'Curry Rice', variation: 'Chicken Nuggets', description: 'Admin food item', price: 4.30, stall_id: 7, foodcourt_id: 3 },
  { name: 'Curry Rice', variation: 'Chicken', description: 'Admin food item', price: 4.30, stall_id: 7, foodcourt_id: 3 },
  { name: 'Bibimbap', variation: 'None', description: 'Admin food item', price: 4.80, stall_id: 8, foodcourt_id: 3 },
  { name: 'Chicken Cutlet Rice', variation: 'None', description: 'Admin food item', price: 5.0, stall_id: 8, foodcourt_id: 3 },
  { name: 'Kimchi Fried Rice', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 8, foodcourt_id: 3 },
  { name: 'Steamed Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 9, foodcourt_id: 3 },
  { name: 'Roasted Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 9, foodcourt_id: 3 },
  { name: 'Char Siew Chicken Rice', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 9, foodcourt_id: 3 },
  { name: 'Steamed Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 10, foodcourt_id: 4 },
  { name: 'Steamed Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 10, foodcourt_id: 4 },
  { name: 'Chicken Cutlet Noodles', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 10, foodcourt_id: 4 },
  { name: 'Dumpling Noodles', variation: 'None', description: 'Admin food item', price: 4.00, stall_id: 11, foodcourt_id: 4 },
  { name: 'Ban Mian', variation: 'None', description: 'Admin food item', price: 4.00, stall_id: 11, foodcourt_id: 4 },
  { name: 'Seafood Noodle', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 11, foodcourt_id: 4 },
  { name: 'Korean Chicken Bowl', variation: 'Sweet & Spicy', description: 'Admin food item', price: 4.50, stall_id: 12, foodcourt_id: 4 },
  { name: 'Korean Chicken Bowl', variation: 'Mala', description: 'Admin food item', price: 4.5, stall_id: 12, foodcourt_id: 4 },
  { name: 'Korean Chicken Bowl', variation: 'Honey Mustard', description: 'Admin food item', price: 4.50, stall_id: 12, foodcourt_id: 4 },
  { name: 'Fried Chicken', variation: 'None', description: 'Admin food item', price: 5.50, stall_id: 13, foodcourt_id: 5 },
  { name: 'Mac N Cheese', variation: 'None', description: 'Admin food item', price: 5.50, stall_id: 13, foodcourt_id: 5 },
  { name: 'Wrap', variation: 'None', description: 'Admin food item', price: 6.00, stall_id: 13, foodcourt_id: 5 },
  { name: 'Chicken Delight', variation: 'None', description: 'Admin food item', price: 6.80, stall_id: 14, foodcourt_id: 5 },
  { name: 'Spicy Beef Taco', variation: 'None', description: 'Admin food item', price: 6.80, stall_id: 14, foodcourt_id: 5 },
  { name: 'Veggie Delight', variation: 'None', description: 'Admin food item', price: 6.80, stall_id: 14, foodcourt_id: 5 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 15, foodcourt_id: 5 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 15, foodcourt_id: 5 },
  { name: 'IDK', variation: 'None', description: 'Admin food item', price: 4.30, stall_id: 15, foodcourt_id: 5 },
  { name: 'Chicken Udon Soup', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 16, foodcourt_id: 6 },
  { name: 'Fried Black Pepper Udon', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 16, foodcourt_id: 6 },
  { name: 'Chicken BBQ Rice', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 16, foodcourt_id: 6 },
  { name: 'Steamed Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 17, foodcourt_id: 6 },
  { name: 'Roasted Chicken Rice', variation: 'None', description: 'Admin food item', price: 3.30, stall_id: 17, foodcourt_id: 6 },
  { name: 'Chicken Rice Set', variation: 'None', description: 'Admin food item', price: 4.20, stall_id: 17, foodcourt_id: 6 },
  { name: 'Ban Mian', variation: 'None', description: 'Admin food item', price: 3.50, stall_id: 18, foodcourt_id: 6 },
  { name: 'Beef Noodles', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 18, foodcourt_id: 6 },
  { name: 'Fish Soup', variation: 'None', description: 'Admin food item', price: 4.50, stall_id: 18, foodcourt_id: 6 }
];


async function seed() {
  console.log('Seeding data...');

  // Insert users (batch)
  if (users.length > 0) {
    const userPlaceholders = users.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`);
    const userValues = users.flatMap((u) => [u.username,u.email, u.password]);
    await pool.query(
      `INSERT INTO "User" ("username", "email", "password") VALUES ${userPlaceholders.join(', ')}`,
      userValues,
    );
  }
  console.log(`Inserted ${users.length} users.`);

  // Insert foodcourts (batch)
  if (foodcourts.length > 0) {
    const foodcourtPlaceholders = foodcourts.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`);
    const foodcourtValues = foodcourts.flatMap((f) => [f.name, f.location]);
    await pool.query(
      `INSERT INTO "FoodCourt" ("name", "location") VALUES ${foodcourtPlaceholders.join(', ')}`,
      foodcourtValues,
    );
  }
  console.log(`Inserted ${foodcourts.length} foodcourts.`);

  // Insert stalls (batch)
  if (stalls.length > 0) {
    const stallPlaceholders = stalls.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);
    const stallValues = stalls.flatMap((s) => [s.name, s.foodcourt_id, s.halal, s.vegetarian]);
    await pool.query(
      `INSERT INTO "Stalls" ("name", "foodcourt_id", "halal", "vegetarian") VALUES ${stallPlaceholders.join(', ')}`,
      stallValues,
    );
  }
  console.log(`Inserted ${stalls.length} stalls.`);

  // Insert menu items (batch)
  if (menu.length > 0) {
    const menuPlaceholders = menu.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`);
    const menuValues = menu.flatMap((m) => [m.name, m.variation, m.description, m.price, m.stall_id, m.foodcourt_id]);
    await pool.query(
      `INSERT INTO "Menu" ("name", "variation", "description", "price", "stall_id", "foodcourt_id") VALUES ${menuPlaceholders.join(', ')}`,
      menuValues,
    );
  }
  console.log(`Inserted ${menu.length} menu items.`);

  console.log('Seed data inserted successfully.');
}

seed()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Seeding failed:', err);
    pool.end();
    process.exit(1);
  });
