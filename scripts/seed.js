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
  password:
    process.env.DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.PGPASSWORD,
});

const foodCourts = [
  {
    name: 'Food Court 1',
    location: 'Level 2, T3B',
    description:
      'Busy campus food court with Korean, Japanese, and chicken rice options for students who want quick meals between classes.',
  },
  {
    name: 'Food Court 2',
    location: 'Level 1, T1A',
    description:
      'Student-friendly food court with noodles, vegetarian meals, light soups, and simple Japanese dishes.',
  },
  {
    name: 'Food Court 3',
    location: 'Poly Centre',
    description:
      'Central food court with curry rice, Korean bowls, and classic chicken rice stalls.',
  },
  {
    name: 'Food Court 4',
    location: 'Level 1, T18A',
    description:
      'Convenient food court for chicken rice, noodles, and Korean chicken meals near study blocks.',
  },
  {
    name: 'Food Court 5',
    location: 'Level 2, T3B',
    description:
      'Larger food court with fast food, sandwiches, cafe meals, drinks, and western options.',
  },
  {
    name: 'Food Court 6',
    location: 'Beside Swimming Pool. Near W14',
    description:
      'Food court near the sports area with hot noodles, soups, Japanese meals, and chicken rice.',
  },
];

const stalls = [
  {
    name: 'Korean Kitchen',
    foodcourt_id: 1,
    halal: false,
    vegetarian: false,
    description:
      'Korean rice bowls, soups, and warm comfort meals served hot for students.',
    cuisine_type: 'Korean',
    location_detail: 'Food Court 1, Level 2',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '6-10 min',
    rating: 4.5,
    rating_count: 128,
    image_url: '/images/stalls/Korean_Kitchen_logo.avif',
    vegan: false,
  },
  {
    name: 'Japanese Bento',
    foodcourt_id: 1,
    halal: false,
    vegetarian: false,
    description:
      'Japanese curry rice, don bowls, udon, and student-friendly bento meals.',
    cuisine_type: 'Japanese',
    location_detail: 'Food Court 1, Level 2',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '7-12 min',
    rating: 4.4,
    rating_count: 116,
    image_url: '/images/stalls/Japanese_Bento_logo.png',
    vegan: false,
  },
  {
    name: 'Chicken Rice Corner',
    foodcourt_id: 1,
    halal: true,
    vegetarian: false,
    description:
      'Classic steamed and roasted chicken rice with fragrant rice, soup, cucumber, and chilli.',
    cuisine_type: 'Chicken Rice',
    location_detail: 'Food Court 1, Level 2',
    opening_status: 'open',
    opening_time: '08:30 AM',
    closing_time: '05:30 PM',
    estimated_wait_time: '5-8 min',
    rating: 4.6,
    rating_count: 214,
    image_url: '/images/stalls/Chicken_rice_Corner.png',
    vegan: false,
  },
  {
    name: 'Noodle House',
    foodcourt_id: 2,
    halal: false,
    vegetarian: false,
    description:
      'Warm noodle bowls, dumpling noodles, ban mian, and light soup dishes.',
    cuisine_type: 'Noodles',
    location_detail: 'Food Court 2, Level 1',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '6-9 min',
    rating: 4.3,
    rating_count: 98,
    image_url: '/images/stalls/Noodle_House_logo.jfif',
    vegan: false,
  },
  {
    name: 'Japanese Express',
    foodcourt_id: 2,
    halal: false,
    vegetarian: false,
    description:
      'Simple Japanese rice bowls, miso soup, salmon don, and teriyaki meals.',
    cuisine_type: 'Japanese',
    location_detail: 'Food Court 2, Level 1',
    opening_status: 'closed',
    opening_time: '10:00 AM',
    closing_time: '05:00 PM',
    estimated_wait_time: '8-12 min',
    rating: 4.2,
    rating_count: 76,
    image_url: '/images/stalls/Japanese_Express_logo.avif',
    vegan: false,
  },
  {
    name: 'Green Plate',
    foodcourt_id: 2,
    halal: false,
    vegetarian: true,
    description:
      'Vegetarian and vegan-friendly rice bowls, tofu meals, soups, and lighter campus options.',
    cuisine_type: 'Vegetarian',
    location_detail: 'Food Court 2, Level 1',
    opening_status: 'open',
    opening_time: '09:30 AM',
    closing_time: '05:30 PM',
    estimated_wait_time: '5-8 min',
    rating: 4.5,
    rating_count: 143,
    image_url: '/images/stalls/Green_Plate_logo.jfif',
    vegan: true,
  },
  {
    name: 'Japanese Curry House',
    foodcourt_id: 3,
    halal: false,
    vegetarian: true,
    description:
      'Japanese curry rice with crispy toppings, mild curry sauce, and warm udon options.',
    cuisine_type: 'Japanese Curry',
    location_detail: 'Poly Centre',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '7-11 min',
    rating: 4.4,
    rating_count: 156,
    image_url: '/images/stalls/Japanese_Curry_House_logo.png',
    vegan: false,
  },
  {
    name: 'Korean Bowl',
    foodcourt_id: 3,
    halal: false,
    vegetarian: false,
    description:
      'Korean bibimbap, fried rice, chicken cutlet rice, and spicy rice bowls.',
    cuisine_type: 'Korean',
    location_detail: 'Poly Centre',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '8-12 min',
    rating: 4.6,
    rating_count: 189,
    image_url: '/images/stalls/Korean_Bowl_logo.avif',
    vegan: false,
  },
  {
    name: 'Hainanese Chicken Rice',
    foodcourt_id: 3,
    halal: true,
    vegetarian: false,
    description:
      'Tender chicken rice meals with fragrant rice, soup, chilli, and roasted chicken options.',
    cuisine_type: 'Chicken Rice',
    location_detail: 'Poly Centre',
    opening_status: 'open',
    opening_time: '08:30 AM',
    closing_time: '05:30 PM',
    estimated_wait_time: '5-8 min',
    rating: 4.7,
    rating_count: 231,
    image_url: '/images/stalls/Hainanese_Chicken_Rice_Stall_logo.jpg',
    vegan: false,
  },
  {
    name: 'Express Chicken Rice',
    foodcourt_id: 4,
    halal: true,
    vegetarian: false,
    description:
      'Affordable chicken rice bowls and chicken cutlet meals for students on the go.',
    cuisine_type: 'Chicken Rice',
    location_detail: 'Food Court 4, Level 1',
    opening_status: 'open',
    opening_time: '08:30 AM',
    closing_time: '05:30 PM',
    estimated_wait_time: '5-8 min',
    rating: 4.4,
    rating_count: 167,
    image_url: '/images/stalls/Express_Chicken_Rice_logo.jfif',
    vegan: false,
  },
  {
    name: 'Ban Mian House',
    foodcourt_id: 4,
    halal: false,
    vegetarian: false,
    description:
      'Ban mian, dumpling noodles, seafood noodles, and spicy tom yum noodle bowls.',
    cuisine_type: 'Noodles',
    location_detail: 'Food Court 4, Level 1',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '6-10 min',
    rating: 4.3,
    rating_count: 132,
    image_url: '/images/stalls/Ban_Mian_logo.jfif',
    vegan: false,
  },
  {
    name: 'Korean Fried Chicken',
    foodcourt_id: 4,
    halal: false,
    vegetarian: false,
    description:
      'Crispy Korean chicken rice bowls with sweet, spicy, mala, and honey mustard sauces.',
    cuisine_type: 'Korean / Chicken',
    location_detail: 'Food Court 4, Level 1',
    opening_status: 'closed',
    opening_time: '10:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '8-12 min',
    rating: 4.5,
    rating_count: 148,
    image_url: 'https://placehold.co/600x400?text=Korean+Fried+Chicken',
    vegan: false,
  },
  {
    name: 'KFC',
    foodcourt_id: 5,
    halal: true,
    vegetarian: false,
    description:
      'Fried chicken, burgers, wraps, sides, and quick fast food meals for students.',
    cuisine_type: 'Fast Food / Chicken',
    location_detail: 'Food Court 5, #01-01',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '08:00 PM',
    estimated_wait_time: '8-12 min',
    rating: 4.5,
    rating_count: 412,
    image_url: '/images/stalls/kfc_logo.png',
    vegan: false,
  },
  {
    name: 'Subway',
    foodcourt_id: 5,
    halal: true,
    vegetarian: true,
    description:
      'Fresh subs, wraps, and salads made to order with bread, vegetables, sauce, and toppings.',
    cuisine_type: 'Western / Sandwiches',
    location_detail: 'Food Court 5, #01-03',
    opening_status: 'open',
    opening_time: '08:30 AM',
    closing_time: '07:30 PM',
    estimated_wait_time: '5-8 min',
    rating: 4.6,
    rating_count: 238,
    image_url: '/images/stalls/Subway.jpg',
    vegan: false,
  },
  {
    name: 'Brunch Cafe',
    foodcourt_id: 5,
    halal: false,
    vegetarian: true,
    description:
      'Western breakfast plates, sandwiches, pasta, toast, and cafe drinks.',
    cuisine_type: 'Western / Cafe',
    location_detail: 'Food Court 5, #01-05',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '7-10 min',
    rating: 4.2,
    rating_count: 94,
    image_url: '/images/stalls/Brunch_Cafe_logo.png',
    vegan: false,
  },
  {
    name: 'Japanese Food',
    foodcourt_id: 6,
    halal: false,
    vegetarian: false,
    description:
      'Japanese noodles, BBQ rice, udon soup, and hot meals near the sports area.',
    cuisine_type: 'Japanese',
    location_detail: 'Food Court 6, near Swimming Pool',
    opening_status: 'open',
    opening_time: '09:00 AM',
    closing_time: '06:00 PM',
    estimated_wait_time: '7-10 min',
    rating: 4.3,
    rating_count: 119,
    image_url: '/images/stalls/Japanese_Food_logo.jpg',
    vegan: false,
  },
  {
    name: 'Chicken Rice Station',
    foodcourt_id: 6,
    halal: true,
    vegetarian: false,
    description:
      'Halal-friendly chicken rice meals with steamed, roasted, and drumstick options.',
    cuisine_type: 'Chicken Rice',
    location_detail: 'Food Court 6, near W14',
    opening_status: 'open',
    opening_time: '08:30 AM',
    closing_time: '05:30 PM',
    estimated_wait_time: '5-8 min',
    rating: 4.5,
    rating_count: 174,
    image_url: '/images/stalls/Chicken_Rice_Station_Logo.png',
    vegan: false,
  },
  {
    name: 'Soup Stall',
    foodcourt_id: 6,
    halal: false,
    vegetarian: false,
    description:
      'Comforting noodle soups, fish soup, herbal chicken soup, and warm lunch bowls.',
    cuisine_type: 'Soup / Noodles',
    location_detail: 'Food Court 6, near W14',
    opening_status: 'closed',
    opening_time: '10:00 AM',
    closing_time: '05:00 PM',
    estimated_wait_time: '6-10 min',
    rating: 4.1,
    rating_count: 82,
    image_url: 'https://placehold.co/600x400?text=Soup+Stall',
    vegan: false,
  },
];

const menuItems = [
  {
    name: 'Classic Bibimbap Bowl',
    variation: 'Gochujang Sauce',
    description:
      'Korean mixed rice bowl with seasoned vegetables, egg, sesame oil, and gochujang sauce.',
    price: 4.3,
    stall_id: 1,
    foodcourt_id: 1,
    category: 'Rice',
    image_url: '/images/Menu/Korean_Kitchen/Korean_Kitchen-Bibimbap.jpg',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Kimchi Tofu Soup',
    variation: 'Tofu and Rice',
    description:
      'Hot kimchi soup with tofu, vegetables, savoury broth, and a small portion of rice.',
    price: 4.3,
    stall_id: 1,
    foodcourt_id: 1,
    category: 'Soup',
    image_url: '/images/Menu/Korean_Kitchen/Korean_Kitchen-Kimchi_Soup.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken Cutlet Omelette Rice',
    variation: 'Chicken Cutlet',
    description:
      'Soft omelette rice served with crispy chicken cutlet and savoury Korean-style sauce.',
    price: 4.5,
    stall_id: 1,
    foodcourt_id: 1,
    category: 'Rice',
    image_url: '/images/Menu/Korean_Kitchen/Korean_Kitchen-Omelette_Rice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Soy Garlic Chicken Rice',
    variation: 'Boneless Chicken',
    description:
      'Boneless soy garlic chicken pieces served with rice, vegetables, and a light savoury glaze.',
    price: 5.6,
    stall_id: 1,
    foodcourt_id: 1,
    category: 'Chicken',
    image_url: null,
    is_available: false,
    is_popular: false,
  },

  {
    name: 'Chicken Katsu Curry Bento',
    variation: 'Chicken Katsu',
    description:
      'Japanese curry rice topped with crispy chicken katsu and served as a filling bento-style meal.',
    price: 4.8,
    stall_id: 2,
    foodcourt_id: 1,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Bento/Japanese_Bento-ChickenKatsu_CurryRice.jpg',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Cheese Omelette Curry Rice',
    variation: 'Cheese Omelette',
    description:
      'Japanese curry rice with a soft cheese omelette, mild curry sauce, and warm rice.',
    price: 3.8,
    stall_id: 2,
    foodcourt_id: 1,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Bento/Japanese_Bento-CheeseOmelette_CurryRice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken Katsu Don',
    variation: 'Katsu Don',
    description:
      'Rice bowl topped with chicken katsu, egg, onions, and savoury Japanese don sauce.',
    price: 4.3,
    stall_id: 2,
    foodcourt_id: 1,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Bento/Japanese_Bento-ChickenKatsu_Don.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Ebi Tempura Udon',
    variation: 'Prawn Tempura',
    description:
      'Thick udon noodles served in warm broth with crispy prawn tempura on the side.',
    price: 5.4,
    stall_id: 2,
    foodcourt_id: 1,
    category: 'Noodles',
    image_url: null,
    is_available: true,
    is_popular: false,
  },

  {
    name: 'Steamed Chicken Rice',
    variation: 'Classic',
    description:
      'Tender steamed chicken served with fragrant rice, soup, cucumber, and chilli sauce.',
    price: 3.3,
    stall_id: 3,
    foodcourt_id: 1,
    category: 'Chicken',
    image_url: '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Steamed_ChickenRice.png',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Roasted Chicken Rice',
    variation: 'Classic',
    description:
      'Roasted chicken served with fragrant rice, soup, cucumber, dark sauce, and chilli.',
    price: 3.3,
    stall_id: 3,
    foodcourt_id: 1,
    category: 'Chicken',
    image_url: '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Roasted_ChickenRice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken Rice Vegetable Set',
    variation: 'Extra Vegetables',
    description:
      'Chicken rice set with extra vegetables, soup, cucumber, chilli, and fragrant rice.',
    price: 4.2,
    stall_id: 3,
    foodcourt_id: 1,
    category: 'Chicken',
    image_url: '/images/Menu/Chicken_Rice_Corner/Chicken_Rice_Corner-Chicken_RiceSet.png',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Shredded Chicken Porridge',
    variation: 'Warm Bowl',
    description:
      'Soft rice porridge served with shredded chicken, spring onions, and light seasoning.',
    price: 3.2,
    stall_id: 3,
    foodcourt_id: 1,
    category: 'Chicken',
    image_url: null,
    is_available: true,
    is_popular: false,
  },

  {
    name: 'Dry Dumpling Noodles',
    variation: 'Dry',
    description:
      'Springy dry noodles served with dumplings, savoury sauce, vegetables, and chilli on request.',
    price: 3.5,
    stall_id: 4,
    foodcourt_id: 2,
    category: 'Noodles',
    image_url: '/images/Menu/Noodle_House/Noodle_House-Dumpling_Noodles.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Ban Mian Soup',
    variation: 'Soup',
    description:
      'Handmade noodles served in warm soup with egg, vegetables, minced meat, and ikan bilis.',
    price: 3.5,
    stall_id: 4,
    foodcourt_id: 2,
    category: 'Noodles',
    image_url: '/images/Menu/Noodle_House/Noodle_House-Ban_Mian.jfif',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Fish Soup with Rice',
    variation: 'Rice',
    description:
      'Light sliced fish soup served with vegetables, clear broth, and white rice.',
    price: 4.5,
    stall_id: 4,
    foodcourt_id: 2,
    category: 'Soup',
    image_url: '/images/Menu/Noodle_House/Noodle_House-Fish_Soup.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Spicy Laksa Noodles',
    variation: 'Coconut Broth',
    description:
      'Noodles served in spicy coconut laksa broth with tofu puffs, egg, and savoury toppings.',
    price: 4.8,
    stall_id: 4,
    foodcourt_id: 2,
    category: 'Noodles',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Teriyaki Chicken Rice',
    variation: 'Teriyaki Sauce',
    description:
      'Chicken teriyaki served with rice, vegetables, and sweet savoury Japanese sauce.',
    price: 4.3,
    stall_id: 5,
    foodcourt_id: 2,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Express/Japanese_Express-Teriyaki_ChickenRice.jpg',
    is_available: false,
    is_popular: true,
  },
  {
    name: 'Salmon Don',
    variation: 'Salmon Bowl',
    description:
      'Japanese salmon rice bowl with sauce, vegetables, and a simple don-style topping.',
    price: 5.2,
    stall_id: 5,
    foodcourt_id: 2,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Express/Japanese_Express-Salmon_Don.png',
    is_available: false,
    is_popular: false,
  },
  {
    name: 'Miso Soup',
    variation: 'Tofu and Seaweed',
    description:
      'Simple warm miso soup with tofu, seaweed, and spring onions.',
    price: 2.2,
    stall_id: 5,
    foodcourt_id: 2,
    category: 'Soup',
    image_url: '/images/Menu/Japanese_Express/Japanese_Express-Miso_Soup.jpg',
    is_available: false,
    is_popular: false,
  },
  {
    name: 'Beef Gyudon Bowl',
    variation: 'Sliced Beef',
    description:
      'Japanese beef rice bowl with sliced beef, onions, and sweet savoury sauce.',
    price: 5.5,
    stall_id: 5,
    foodcourt_id: 2,
    category: 'Rice',
    image_url: null,
    is_available: false,
    is_popular: true,
  },

  {
    name: 'Vegetarian Rice Set',
    variation: 'Daily Vegetables',
    description:
      'Vegetarian rice set with tofu, vegetables, mock protein, and light savoury sauce.',
    price: 4.3,
    stall_id: 6,
    foodcourt_id: 2,
    category: 'Vegetarian',
    image_url: '/images/Menu/Green_Plate/Green_Plate-Vegetarian_RiceSet.webp',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Tofu Noodle Bowl',
    variation: 'Vegan',
    description:
      'Noodle bowl with tofu, greens, light sauce, and a cleaner plant-based profile.',
    price: 4.5,
    stall_id: 6,
    foodcourt_id: 2,
    category: 'Vegan',
    image_url: '/images/Menu/Green_Plate/Green_Plate-Tofu_NoodleBowl.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Vegetable Tofu Soup',
    variation: 'Vegan',
    description:
      'Warm vegetable soup with tofu, greens, mushrooms, and a light broth.',
    price: 3.8,
    stall_id: 6,
    foodcourt_id: 2,
    category: 'Vegan',
    image_url: '/images/Menu/Green_Plate/Green_Plate-Vegetable_Soup.png',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Buddha Bowl',
    variation: 'Vegan Bowl',
    description:
      'Colourful vegan bowl with rice, tofu, vegetables, dressing, and crunchy toppings.',
    price: 5.2,
    stall_id: 6,
    foodcourt_id: 2,
    category: 'Vegan',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Chicken Katsu Curry Bowl',
    variation: 'Chicken Katsu',
    description:
      'Japanese curry rice with crispy chicken katsu and mild curry sauce.',
    price: 4.3,
    stall_id: 7,
    foodcourt_id: 3,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-ChickenKatsu_CurryRice.webp',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Vegetable Croquette Curry',
    variation: 'Vegetable Croquette',
    description:
      'Japanese curry rice with a crispy vegetable croquette and mild curry sauce.',
    price: 4.1,
    stall_id: 7,
    foodcourt_id: 3,
    category: 'Vegetarian',
    image_url: '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-Vegetable Croquette.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken Nuggets Curry Rice',
    variation: 'Chicken Nuggets',
    description:
      'Japanese curry rice served with chicken nuggets and warm curry sauce.',
    price: 4.3,
    stall_id: 7,
    foodcourt_id: 3,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Curry_House/Japanese_Curry_House-ChickenNuggets_CurryRice.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Curry Udon',
    variation: 'Mild Curry Broth',
    description:
      'Thick udon noodles served in mild Japanese curry broth with simple toppings.',
    price: 4.8,
    stall_id: 7,
    foodcourt_id: 3,
    category: 'Noodles',
    image_url: null,
    is_available: true,
    is_popular: false,
  },

  {
    name: 'Spicy Chicken Bibimbap',
    variation: 'Spicy Chicken',
    description:
      'Korean bibimbap topped with spicy chicken, vegetables, egg, and gochujang sauce.',
    price: 4.8,
    stall_id: 8,
    foodcourt_id: 3,
    category: 'Rice',
    image_url: '/images/Menu/Korean_Bowl/Korean_Bowl-SpicyChicken_Bibimbap.jpg',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Korean Chicken Cutlet Rice',
    variation: 'Chicken Cutlet',
    description:
      'Chicken cutlet served with rice, vegetables, and Korean-style savoury sauce.',
    price: 5.0,
    stall_id: 8,
    foodcourt_id: 3,
    category: 'Chicken',
    image_url: '/images/Menu/Korean_Bowl/Korean_Bowl-Chicken_CutletRice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Kimchi Fried Rice',
    variation: 'Kimchi and Egg',
    description:
      'Fried rice cooked with kimchi, egg, vegetables, and Korean seasoning.',
    price: 4.5,
    stall_id: 8,
    foodcourt_id: 3,
    category: 'Rice',
    image_url: '/images/Menu/Korean_Bowl/Korean_Bowl-Kimchi_FriedRice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Japchae Glass Noodles',
    variation: 'Stir Fried',
    description:
      'Korean glass noodles stir-fried with vegetables and a light savoury sauce.',
    price: 4.7,
    stall_id: 8,
    foodcourt_id: 3,
    category: 'Noodles',
    image_url: null,
    is_available: true,
    is_popular: false,
  },

  {
    name: 'Hainanese Steamed Chicken Rice',
    variation: 'Classic',
    description:
      'Tender steamed chicken served with fragrant rice, soup, cucumber, and chilli sauce.',
    price: 3.3,
    stall_id: 9,
    foodcourt_id: 3,
    category: 'Chicken',
    image_url: '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-Steamed_ChickenRice.png',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Hainanese Roasted Chicken Rice',
    variation: 'Roasted',
    description:
      'Roasted chicken rice with fragrant rice, soup, cucumber, dark sauce, and chilli.',
    price: 3.3,
    stall_id: 9,
    foodcourt_id: 3,
    category: 'Chicken',
    image_url: '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-Roasted_ChickenRice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Char Siew Sauce Chicken Rice',
    variation: 'Char Siew Sauce',
    description:
      'Chicken rice served with a char siew-style sweet savoury sauce and fragrant rice.',
    price: 4.3,
    stall_id: 9,
    foodcourt_id: 3,
    category: 'Chicken',
    image_url: '/images/Menu/Hainanese_Chicken_Rice/Hainanese_Chicken_Rice-CharSiew_ChickenRice.avif',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Roasted Drumstick Rice',
    variation: 'Drumstick',
    description:
      'Roasted chicken drumstick served with fragrant rice, soup, cucumber, and chilli.',
    price: 4.8,
    stall_id: 9,
    foodcourt_id: 3,
    category: 'Chicken',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Steamed Chicken Rice Bowl',
    variation: 'Classic',
    description:
      'Simple steamed chicken rice bowl with fragrant rice, soup, cucumber, and chilli.',
    price: 3.3,
    stall_id: 10,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Steamed_ChickenRice.png',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Roasted Chicken Rice Bowl',
    variation: 'Roasted',
    description:
      'Roasted chicken rice bowl served with soup, cucumber, chilli, and dark sauce.',
    price: 3.3,
    stall_id: 10,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Roasted_ChickenRice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken Cutlet Noodles',
    variation: 'Crispy Cutlet',
    description:
      'Noodles served with crispy chicken cutlet, vegetables, and savoury sauce.',
    price: 4.5,
    stall_id: 10,
    foodcourt_id: 4,
    category: 'Noodles',
    image_url: '/images/Menu/Express_Chicken_Rice/Express_Chicken_Rice-Chicken_Cutlet_Noodles.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Lemon Chicken Rice',
    variation: 'Crispy Chicken',
    description:
      'Crispy lemon chicken served with rice and a tangy lemon sauce.',
    price: 4.4,
    stall_id: 10,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Dumpling Noodles Soup',
    variation: 'Soup',
    description:
      'Warm soup noodles served with dumplings, vegetables, and light broth.',
    price: 4.0,
    stall_id: 11,
    foodcourt_id: 4,
    category: 'Noodles',
    image_url: '/images/Menu/Ban_Mian_House/Ban_Mian-Dumpling_Noodles.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Dry Ban Mian',
    variation: 'Dry',
    description:
      'Dry ban mian served with minced meat, egg, vegetables, and savoury sauce.',
    price: 4.0,
    stall_id: 11,
    foodcourt_id: 4,
    category: 'Noodles',
    image_url: '/images/Menu/Ban_Mian_House/Ban_Mian_House-Ban_Mian.jfif',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Seafood Noodle Soup',
    variation: 'Seafood',
    description:
      'Noodle soup served with seafood, vegetables, and warm savoury broth.',
    price: 4.5,
    stall_id: 11,
    foodcourt_id: 4,
    category: 'Noodles',
    image_url: '/images/Menu/Ban_Mian_House/Ban_Mian_House-Seafood_Noodle.avif',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Tom Yum Ban Mian',
    variation: 'Spicy Soup',
    description:
      'Ban mian noodles served in spicy tom yum soup with egg, vegetables, and savoury broth.',
    price: 4.8,
    stall_id: 11,
    foodcourt_id: 4,
    category: 'Noodles',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Sweet Spicy Chicken Bowl',
    variation: 'Sweet and Spicy',
    description:
      'Korean chicken bowl with sweet spicy sauce, rice, and vegetables.',
    price: 4.5,
    stall_id: 12,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken-SweetSpicy_ChickenBowl.jpg',
    is_available: false,
    is_popular: true,
  },
  {
    name: 'Mala Chicken Bowl',
    variation: 'Mala Sauce',
    description:
      'Korean chicken bowl with mala sauce, rice, and vegetables for students who like heat.',
    price: 4.5,
    stall_id: 12,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken_Mala_ChickenBowl.jpg',
    is_available: false,
    is_popular: false,
  },
  {
    name: 'Honey Mustard Chicken Bowl',
    variation: 'Honey Mustard',
    description:
      'Korean chicken bowl with honey mustard sauce, rice, and vegetables.',
    price: 4.5,
    stall_id: 12,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: '/images/Menu/Korean_Fried_Chicken/Korean_Fried_Chicken-HoneyMustard_ChickenBowl.jpg',
    is_available: false,
    is_popular: false,
  },
  {
    name: 'Yangnyeom Chicken Bites',
    variation: 'Spicy Sauce',
    description:
      'Crispy Korean chicken bites coated with spicy yangnyeom sauce.',
    price: 5.8,
    stall_id: 12,
    foodcourt_id: 4,
    category: 'Chicken',
    image_url: null,
    is_available: false,
    is_popular: true,
  },

  {
    name: 'Two Piece Fried Chicken Meal',
    variation: '2 Piece Meal',
    description:
      'Two pieces of fried chicken served with a side dish as a filling fast food meal.',
    price: 5.5,
    stall_id: 13,
    foodcourt_id: 5,
    category: 'Chicken',
    image_url: '/images/Menu/KFC/KFC-2P_FriendChicken.png',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Mac N Cheese',
    variation: 'Regular',
    description:
      'Creamy mac and cheese side dish for students who want a warm comfort side.',
    price: 5.5,
    stall_id: 13,
    foodcourt_id: 5,
    category: 'Sides',
    image_url: '/images/Menu/KFC/KFC-MacNCheese.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken Wrap',
    variation: 'Original',
    description:
      'Chicken wrap with vegetables and sauce, served as a portable quick meal.',
    price: 6.0,
    stall_id: 13,
    foodcourt_id: 5,
    category: 'Chicken',
    image_url: '/images/Menu/KFC/KFC-Chicken_Wrap.png',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Zinger Burger',
    variation: 'Spicy Chicken',
    description:
      'Spicy chicken burger with lettuce, sauce, and a crispy chicken fillet.',
    price: 6.4,
    stall_id: 13,
    foodcourt_id: 5,
    category: 'Burger',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Chicken Delight Sub',
    variation: '6-inch',
    description:
      'Fresh six-inch sub with chicken, vegetables, sauce, and bread made to order.',
    price: 6.8,
    stall_id: 14,
    foodcourt_id: 5,
    category: 'Sandwich',
    image_url: '/images/Menu/Subway/Subway-Chicken_Delight_Sub.jpg',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Spicy Beef Taco Sub',
    variation: '6-inch',
    description:
      'Six-inch sub with spicy beef taco filling, fresh vegetables, and sauce.',
    price: 6.8,
    stall_id: 14,
    foodcourt_id: 5,
    category: 'Sandwich',
    image_url: '/images/Menu/Subway/Subway-Spicy_BeefTaco.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Veggie Delight Sub',
    variation: '6-inch',
    description:
      'Vegetarian six-inch sub with fresh vegetables, sauce, and bread made to order.',
    price: 6.8,
    stall_id: 14,
    foodcourt_id: 5,
    category: 'Vegetarian',
    image_url: '/images/Menu/Subway/Subway-Veggie_Delight.jpg',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Tuna Mayo Sub',
    variation: '6-inch',
    description:
      'Six-inch tuna mayo sub with vegetables, sauce, and bread made to order.',
    price: 6.2,
    stall_id: 14,
    foodcourt_id: 5,
    category: 'Sandwich',
    image_url: null,
    is_available: true,
    is_popular: false,
  },

  {
    name: 'Chicken Mayo Toasted Sandwich',
    variation: 'Toast',
    description:
      'Toasted sandwich with chicken mayo filling, simple vegetables, and cafe-style bread.',
    price: 4.8,
    stall_id: 15,
    foodcourt_id: 5,
    category: 'Sandwich',
    image_url: '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Chicken_Mayo_Sandwich.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Mushroom Cream Pasta',
    variation: 'Cream Sauce',
    description:
      'Creamy pasta with mushrooms, sauce, and a western cafe-style flavour.',
    price: 5.2,
    stall_id: 15,
    foodcourt_id: 5,
    category: 'Western',
    image_url: '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Mushroom_Pasta.webp',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Iced Latte',
    variation: 'Regular',
    description:
      'Chilled latte made with coffee, milk, and ice for a quick study drink.',
    price: 3.8,
    stall_id: 15,
    foodcourt_id: 5,
    category: 'Drinks',
    image_url: '/images/Menu/Brunch%20Cafe/Brunch_Cafe-Iced_Latte.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Scrambled Egg Toast',
    variation: 'Breakfast',
    description:
      'Cafe-style toast served with scrambled egg as a simple breakfast or light meal.',
    price: 4.2,
    stall_id: 15,
    foodcourt_id: 5,
    category: 'Western',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Chicken Udon Soup',
    variation: 'Chicken Slices',
    description:
      'Warm udon soup served with chicken slices, broth, and simple Japanese toppings.',
    price: 4.5,
    stall_id: 16,
    foodcourt_id: 6,
    category: 'Noodles',
    image_url: '/images/Menu/Japanese_Food/Japanese_Food-Chicken_Udon_Soup.jpg',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Fried Black Pepper Udon',
    variation: 'Black Pepper',
    description:
      'Fried udon with black pepper sauce, vegetables, and savoury Japanese-style seasoning.',
    price: 4.5,
    stall_id: 16,
    foodcourt_id: 6,
    category: 'Noodles',
    image_url: '/images/Menu/Japanese_Food/Japanese_Food-Fried_BlackPepper_Udon.JPG',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Chicken BBQ Rice',
    variation: 'BBQ Chicken',
    description:
      'Japanese BBQ chicken served with rice, vegetables, and smoky savoury sauce.',
    price: 4.5,
    stall_id: 16,
    foodcourt_id: 6,
    category: 'Rice',
    image_url: '/images/Menu/Japanese_Food/Japanese_Food-Chicken_BBQRice.webp',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Beef Yakiniku Rice',
    variation: 'Grilled Beef',
    description:
      'Japanese grilled beef served with rice, onions, and savoury yakiniku sauce.',
    price: 5.6,
    stall_id: 16,
    foodcourt_id: 6,
    category: 'Rice',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Halal Steamed Chicken Rice',
    variation: 'Classic',
    description:
      'Halal-friendly steamed chicken rice with fragrant rice, soup, cucumber, and chilli.',
    price: 3.3,
    stall_id: 17,
    foodcourt_id: 6,
    category: 'Chicken',
    image_url: '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Steamed_ChickenRice.png',
    is_available: true,
    is_popular: true,
  },
  {
    name: 'Halal Roasted Chicken Rice',
    variation: 'Roasted',
    description:
      'Halal-friendly roasted chicken rice with fragrant rice, soup, cucumber, and chilli.',
    price: 3.3,
    stall_id: 17,
    foodcourt_id: 6,
    category: 'Chicken',
    image_url: '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Roasted_Chicken_Rice.jpg',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Halal Chicken Rice Set',
    variation: 'Extra Vegetables',
    description:
      'Halal-friendly chicken rice set with vegetables, soup, cucumber, and chilli.',
    price: 4.2,
    stall_id: 17,
    foodcourt_id: 6,
    category: 'Chicken',
    image_url: '/images/Menu/Chicken_Rice_Station/Chicken_Rice_Station-Chicken_Rice_Set.png',
    is_available: true,
    is_popular: false,
  },
  {
    name: 'Halal Roasted Drumstick Rice',
    variation: 'Drumstick',
    description:
      'Halal-friendly roasted drumstick rice with fragrant rice, soup, cucumber, and chilli.',
    price: 4.8,
    stall_id: 17,
    foodcourt_id: 6,
    category: 'Chicken',
    image_url: null,
    is_available: true,
    is_popular: true,
  },

  {
    name: 'Soup Stall Ban Mian',
    variation: 'Soup',
    description:
      'Warm ban mian soup with handmade noodles, vegetables, egg, and light broth.',
    price: 3.5,
    stall_id: 18,
    foodcourt_id: 6,
    category: 'Noodles',
    image_url: '/images/Menu/Soup%20Stall/Soup_Stall-Ban_Mian.jfif',
    is_available: false,
    is_popular: false,
  },
  {
    name: 'Beef Noodle Soup',
    variation: 'Soup',
    description:
      'Beef noodles served in warm broth with vegetables and savoury seasoning.',
    price: 4.5,
    stall_id: 18,
    foodcourt_id: 6,
    category: 'Noodles',
    image_url: '/images/Menu/Soup%20Stall/Soup_Stall-Beef_Noodles.avif',
    is_available: false,
    is_popular: true,
  },
  {
    name: 'Soup Stall Fish Soup with Rice',
    variation: 'Rice',
    description:
      'Light sliced fish soup served with rice, vegetables, and clear broth.',
    price: 4.5,
    stall_id: 18,
    foodcourt_id: 6,
    category: 'Soup',
    image_url: '/images/Menu/Soup%20Stall/Soup_Stall-Fish_Soup.png',
    is_available: false,
    is_popular: false,
  },
  {
    name: 'Herbal Chicken Soup',
    variation: 'Warm Bowl',
    description:
      'Herbal chicken soup served hot with a comforting broth and simple toppings.',
    price: 5.2,
    stall_id: 18,
    foodcourt_id: 6,
    category: 'Soup',
    image_url: null,
    is_available: false,
    is_popular: true,
  },
];

const baseRatings = [
  4.8, 4.2, 3.7, 2.9,
  4.7, 4.1, 4.3, 3.4,
  4.8, 4.5, 4.0, 3.6,
  3.9, 4.4, 4.2, 4.6,
  3.3, 3.1, 2.7, 3.5,
  4.5, 4.1, 3.8, 4.6,
  4.7, 3.9, 3.6, 4.0,
  4.8, 4.2, 4.1, 3.4,
  4.9, 4.6, 3.9, 4.5,
  4.7, 4.2, 3.8, 4.4,
  3.7, 4.5, 4.1, 4.6,
  4.5, 3.1, 3.9, 4.2,
  4.6, 2.8, 3.5, 4.4,
  4.5, 3.8, 4.6, 3.3,
  3.7, 4.2, 4.0, 4.1,
  4.5, 3.6, 4.0, 4.6,
  4.7, 4.4, 3.8, 4.5,
  2.9, 3.6, 3.2, 3.9,
];

const studentNames = [
  'Alicia Tan',
  'Marcus Lee',
  'Jia Min',
  'Daniel Koh',
  'Siti Nur',
  'Ryan Ng',
  'Nora Lim',
  'Ethan Chua',
  'Chloe Tan',
  'Wei Lun',
  'Priya Nair',
  'Hafiz Rahman',
  'Sarah Wong',
  'Brandon Teo',
  'Shermaine Low',
  'Joel Tan',
  'Farah Aziz',
  'Kenneth Goh',
  'Mei Qi',
  'Arun Kumar',
  'Vanessa Lim',
  'Jun Hao',
  'Isabelle Ong',
  'Darren Yap',
  'Natasha Lee',
  'Rae Chen',
  'Irfan Malik',
  'Grace Ho',
  'Lucas Tan',
  'Tanya Lim',
  'Yuki Tan',
  'Lin Hui',
  'David Chen',
  'Raj Kumar',
  'Alex Tan',
  'Melissa Lee',
];

function roundRating(value) {
  const rounded = Math.round(Number(value) * 10) / 10;

  if (rounded > 5) {
    return 5.0;
  }

  if (rounded < 1) {
    return 1.0;
  }

  return rounded;
}

function getPrepTime(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('drink')) return 3;
  if (name.includes('miso soup')) return 4;
  if (name.includes('chicken rice')) return 6;
  if (name.includes('porridge')) return 6;
  if (name.includes('sandwich') || name.includes('sub') || name.includes('wrap')) return 6;
  if (name.includes('ban mian')) return 8;
  if (name.includes('fish soup')) return 8;
  if (name.includes('udon')) return 9;
  if (name.includes('bibimbap')) return 10;
  if (name.includes('fried rice')) return 10;
  if (name.includes('curry')) return 11;
  if (name.includes('katsu')) return 12;
  if (name.includes('fried chicken') || name.includes('burger')) return 12;

  return 10;
}

function getMealType(item) {
  const category = item.category.toLowerCase();

  if (category.includes('drink')) return 'Drink';
  if (category.includes('side')) return 'Side';
  if (category.includes('soup')) return 'Soup';
  if (category.includes('sandwich')) return 'Light Meal';
  if (category.includes('vegetarian') || category.includes('vegan')) return 'Healthy Meal';

  return 'Main';
}

function getDietaryTag(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('vegan')) return 'Vegan';
  if (category.includes('vegetarian')) return 'Vegetarian';
  if ([3, 9, 10, 13, 14, 17].includes(item.stall_id)) return 'Halal-friendly';
  if (name.includes('fish')) return 'Pescatarian-friendly';
  if (category.includes('drink')) return 'Dairy option';

  return 'Contains meat';
}

function getFlavourProfile(item) {
  const name = item.name.toLowerCase();

  if (
    name.includes('spicy') ||
    name.includes('mala') ||
    name.includes('tom yum') ||
    name.includes('laksa')
  ) {
    return 'Spicy';
  }

  if (name.includes('kimchi')) return 'Tangy and savoury';
  if (name.includes('curry')) return 'Rich and savoury';
  if (name.includes('lemon')) return 'Tangy';
  if (name.includes('honey') || name.includes('sweet')) return 'Sweet savoury';
  if (name.includes('latte')) return 'Creamy';
  if (name.includes('sandwich') || name.includes('sub') || name.includes('salad')) return 'Fresh';
  if (name.includes('fried') || name.includes('cutlet') || name.includes('katsu')) return 'Crispy';

  return 'Savoury';
}

function getStudentNeed(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (item.price <= 4.0) return 'Budget Meal';
  if (category.includes('drink')) return 'Study Drink';
  if (category.includes('vegetarian') || category.includes('vegan') || name.includes('fish soup')) {
    return 'Healthy Choice';
  }
  if (name.includes('chicken rice') || name.includes('sandwich') || name.includes('sub')) {
    return 'Quick Bite';
  }
  if (
    name.includes('bibimbap') ||
    name.includes('katsu') ||
    name.includes('curry') ||
    name.includes('burger')
  ) {
    return 'Filling Meal';
  }
  if (name.includes('soup') || name.includes('ban mian') || name.includes('pasta')) {
    return 'Comfort Food';
  }

  return 'General Student Meal';
}

function getTemperatureType(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('drink') || name.includes('iced')) {
    return 'Cold';
  }

  return 'Hot';
}

function getCalories(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('drink')) return 160;
  if (category.includes('side')) return 360;
  if (category.includes('rice')) return 580;
  if (category.includes('noodle')) return 540;
  if (name.includes('fried')) return 680;
  if (name.includes('burger')) return 650;
  if (name.includes('set') || name.includes('bento')) return 700;

  return 500;
}

function getNutritionLevel(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (name.includes('salad') || name.includes('fish soup') || category.includes('vegetarian') || category.includes('vegan')) {
    return 'Light';
  }

  if (name.includes('fried') || name.includes('burger') || item.stall_id === 13) {
    return 'Indulgent';
  }

  if (category.includes('drink')) return 'Light';
  if (category.includes('rice') || category.includes('noodle') || category.includes('chicken')) return 'Filling';

  return 'Moderate';
}

function getCarbLevel(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('rice') || category.includes('noodle')) return 'High carb';
  if (name.includes('burger') || name.includes('sandwich') || name.includes('wrap') || name.includes('sub')) {
    return 'Medium carb';
  }
  if (category.includes('drink') || name.includes('salad') || name.includes('fish soup')) return 'Low carb';

  return 'Medium carb';
}

function getProteinLevel(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (
    name.includes('chicken') ||
    name.includes('fish') ||
    name.includes('egg') ||
    name.includes('beef') ||
    name.includes('katsu') ||
    name.includes('tofu')
  ) {
    return 'High protein';
  }

  if (category.includes('drink')) return 'Low protein';

  return 'Medium protein';
}

function getFatLevel(item) {
  const name = item.name.toLowerCase();

  if (name.includes('fried') || name.includes('burger') || item.stall_id === 13) {
    return 'High fat';
  }

  if (name.includes('curry') || name.includes('katsu') || name.includes('cream')) {
    return 'Medium fat';
  }

  if (name.includes('salad') || name.includes('fish soup')) {
    return 'Low fat';
  }

  return 'Medium fat';
}

function getSugarLevel(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('drink') || name.includes('latte') || name.includes('tea') || name.includes('coffee')) {
    return 'Medium';
  }

  if (name.includes('honey') || name.includes('sweet')) {
    return 'Medium';
  }

  return 'Low';
}

function getSpiceLevel(item) {
  const name = item.name.toLowerCase();

  if (name.includes('mala') || name.includes('tom yum') || name.includes('spicy') || name.includes('laksa')) {
    return 'Spicy';
  }

  if (name.includes('kimchi')) return 'Medium spicy';
  if (name.includes('curry') || name.includes('bibimbap')) return 'Mild spicy';

  return 'Not spicy';
}

function getAllergenInfo(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (name.includes('egg') || name.includes('bibimbap')) {
    return 'Contains egg. May contain soy or sesame.';
  }

  if (
    name.includes('noodle') ||
    name.includes('udon') ||
    name.includes('ban mian') ||
    name.includes('sub') ||
    name.includes('sandwich') ||
    name.includes('wrap')
  ) {
    return 'May contain gluten, egg, dairy, or soy.';
  }

  if (name.includes('latte') || category.includes('drink') || name.includes('cheese') || name.includes('cream')) {
    return 'May contain dairy.';
  }

  if (name.includes('curry')) {
    return 'May contain dairy, gluten, or soy.';
  }

  if (name.includes('chicken') || name.includes('beef')) {
    return 'May contain soy, gluten, or sesame.';
  }

  return 'Check with stall before ordering.';
}

function getPortionSize(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (category.includes('drink')) return 'Regular cup';
  if (category.includes('side')) return 'Small';
  if (name.includes('set') || name.includes('bento') || name.includes('drumstick')) return 'Large';
  if (category.includes('rice') || category.includes('noodle') || category.includes('chicken')) return 'Regular bowl';

  return 'Regular';
}

function isQuickBite(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  return (
    category.includes('drink') ||
    name.includes('chicken rice') ||
    name.includes('sandwich') ||
    name.includes('sub') ||
    name.includes('wrap') ||
    name.includes('miso soup') ||
    name.includes('porridge') ||
    item.price <= 4.0
  );
}

function isCustomisable(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  return (
    name.includes('sub') ||
    name.includes('sandwich') ||
    name.includes('wrap') ||
    name.includes('bibimbap') ||
    name.includes('bowl') ||
    name.includes('ban mian') ||
    name.includes('noodle') ||
    category.includes('drink')
  );
}

function getCustomisationOptions(item) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (name.includes('sub') || name.includes('sandwich') || name.includes('wrap')) {
    return 'Choose vegetables, sauce, bread type, and extra toppings.';
  }

  if (name.includes('bibimbap') || name.includes('bowl')) {
    return 'Adjust sauce level, add egg, add vegetables, or request less spicy.';
  }

  if (name.includes('ban mian') || name.includes('noodle')) {
    return 'Choose dry or soup style, chilli level, and extra noodles.';
  }

  if (name.includes('chicken rice')) {
    return 'Choose steamed or roasted style, extra chilli, extra rice, or less sauce.';
  }

  if (category.includes('drink')) {
    return 'Choose less ice or less sugar if available.';
  }

  return 'Standard portion. Ask stall for simple changes if available.';
}

function getMenuNotes(item, meta) {
  const name = item.name.toLowerCase();

  if (meta.is_budget_friendly && meta.is_quick_bite) {
    return 'Good for students who want something affordable and fast.';
  }

  if (meta.is_student_favourite) {
    return 'Popular among students based on rating, orders, or popularity.';
  }

  if (item.category.toLowerCase().includes('vegetarian') || item.category.toLowerCase().includes('vegan')) {
    return 'Good option for students looking for a lighter or plant-based meal.';
  }

  if (name.includes('spicy') || name.includes('mala') || name.includes('tom yum')) {
    return 'Recommended for students who enjoy stronger spicy flavours.';
  }

  if (name.includes('soup') || name.includes('ban mian')) {
    return 'Comforting option for a warm meal between classes.';
  }

  return 'Useful campus meal option with flexible filtering details.';
}

function getOrderCount(index, item, rating) {
  if (item.is_popular) {
    return 120 + index * 3;
  }

  if (rating >= 4.4) {
    return 90 + index * 2;
  }

  if (rating < 3.2) {
    return 20 + index;
  }

  return 45 + index;
}

function getMenuMeta(item, index) {
  const baseRating = baseRatings[index];
  const prepTime = getPrepTime(item);
  const studentNeed = getStudentNeed(item);
  const quickBite = isQuickBite(item);
  const budgetFriendly = item.price <= 4.5;
  const studentFavourite = item.is_popular || baseRating >= 4.6;

  const meta = {
    calories: getCalories(item),
    nutrition_level: getNutritionLevel(item),
    carb_level: getCarbLevel(item),
    protein_level: getProteinLevel(item),
    fat_level: getFatLevel(item),
    sugar_level: getSugarLevel(item),
    spice_level: getSpiceLevel(item),
    allergen_info: getAllergenInfo(item),
    portion_size: getPortionSize(item),
    order_count: getOrderCount(index, item, baseRating),
    prep_time_minutes: prepTime,
    meal_type: getMealType(item),
    dietary_tag: getDietaryTag(item),
    flavour_profile: getFlavourProfile(item),
    student_need: studentNeed,
    temperature_type: getTemperatureType(item),
    is_budget_friendly: budgetFriendly,
    is_quick_bite: quickBite,
    is_student_favourite: studentFavourite,
    is_customisable: isCustomisable(item),
    customisation_options: getCustomisationOptions(item),
  };

  meta.menu_notes = getMenuNotes(item, meta);

  return meta;
}

function getMainReviewTag(item, rating, meta) {
  if (rating < 3.0) return 'Can improve';
  if (rating < 3.5) return 'Mixed experience';
  if (meta.is_budget_friendly) return 'Budget';
  if (meta.is_quick_bite) return 'Quick bite';
  if (meta.student_need === 'Healthy Choice') return 'Healthy';
  if (meta.student_need === 'Comfort Food') return 'Comfort food';
  if (meta.student_need === 'Filling Meal') return 'Filling';
  if (meta.flavour_profile === 'Spicy') return 'Spicy';

  return 'Worth it';
}

function getReviewTags(item, rating, meta, reviewIndex) {
  const tags = [];

  if (rating < 3.0) {
    tags.push('Can improve');
  }

  if (rating >= 4.5) {
    tags.push('Worth it');
  }

  if (meta.is_budget_friendly) {
    tags.push('Cheap');
  }

  if (meta.is_quick_bite) {
    tags.push('Good for lunch');
  }

  if (meta.student_need === 'Filling Meal') {
    tags.push('Large portion');
  }

  if (meta.student_need === 'Comfort Food') {
    tags.push('Comfort food');
  }

  if (meta.student_need === 'Healthy Choice') {
    tags.push('Healthy choice');
  }

  if (meta.flavour_profile === 'Spicy') {
    tags.push('Spicy');
  }

  if (meta.prep_time_minutes >= 11 || reviewIndex === 2) {
    tags.push('Long queue');
  }

  if (tags.length === 0) {
    tags.push('Worth it');
  }

  return [...new Set(tags)];
}

function getReviewText(item, rating, meta, reviewIndex) {
  if (rating >= 4.6) {
    return `${item.name} is one of the better choices from this stall. It tastes good, feels satisfying, and I would get it again during lunch.`;
  }

  if (rating >= 4.0) {
    return `${item.name} is a solid option. The flavour is decent and the portion works well for a normal school day.`;
  }

  if (rating >= 3.5) {
    return `${item.name} is okay, but it depends on what you are craving. It is not bad, but there are better choices when the queue is long.`;
  }

  if (reviewIndex === 1) {
    return `${item.name} was a bit disappointing for me. The taste was acceptable, but the value and waiting time could be better.`;
  }

  return `${item.name} can improve. It is still edible, but I would only buy it again if the queue is short or I really wanted this type of meal.`;
}

function buildReviewRows(insertedMenuItems) {
  const reviews = [];
  let reviewerIndex = 0;

  insertedMenuItems.forEach((item, index) => {
    const meta = getMenuMeta(item, index);
    const baseRating = baseRatings[index];
    const reviewCount = item.is_popular ? 3 : index % 5 === 0 ? 2 : 1;
    const variationList = reviewCount === 3 ? [0.1, -0.2, 0.3] : [0, -0.3];

    for (let count = 0; count < reviewCount; count += 1) {
      const rating = roundRating(baseRating + variationList[count]);
      const tasteRating = roundRating(rating + (meta.flavour_profile === 'Spicy' ? 0.1 : 0));
      const valueRating = roundRating(rating + (meta.is_budget_friendly ? 0.2 : -0.2));
      const portionRating = roundRating(rating + (meta.student_need === 'Filling Meal' ? 0.2 : 0));
      const waitTimeRating = roundRating(5.2 - meta.prep_time_minutes / 4 - (count === 2 ? 0.3 : 0));
      const reviewTags = getReviewTags(item, rating, meta, count);
      const reviewTag = getMainReviewTag(item, rating, meta);
      const helpfulCount = Math.max(
        1,
        Math.round(rating * 2 + index + count * 3)
      );

      reviews.push({
        food_id: item.food_id,
        reviewer_name: studentNames[reviewerIndex % studentNames.length],
        rating,
        taste_rating: tasteRating,
        value_rating: valueRating,
        portion_rating: portionRating,
        wait_time_rating: waitTimeRating,
        review_text: getReviewText(item, rating, meta, count),
        review_tag: reviewTag,
        review_tags: reviewTags,
        best_time_to_buy:
          meta.is_quick_bite || meta.is_budget_friendly
            ? 'Before peak lunch'
            : 'Lunch',
        review_photo_url:
          item.image_url && (index + count) % 4 === 0 ? item.image_url : null,
        helpful_count: helpfulCount,
        created_at: `2026-07-${String((index % 24) + 1).padStart(2, '0')} 12:00:00`,
      });

      reviewerIndex += 1;
    }
  });

  return reviews;
}

async function ensureReviewSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Reviews" (
      "review_id" SERIAL PRIMARY KEY,
      "food_id" INT NOT NULL REFERENCES "Menu"("food_id") ON DELETE CASCADE,
      "reviewer_name" TEXT NOT NULL,
      "rating" DECIMAL(2, 1) NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
      "taste_rating" DECIMAL(2, 1) DEFAULT 4.0 CHECK ("taste_rating" >= 1 AND "taste_rating" <= 5),
      "value_rating" DECIMAL(2, 1) DEFAULT 4.0 CHECK ("value_rating" >= 1 AND "value_rating" <= 5),
      "portion_rating" DECIMAL(2, 1) DEFAULT 4.0 CHECK ("portion_rating" >= 1 AND "portion_rating" <= 5),
      "wait_time_rating" DECIMAL(2, 1) DEFAULT 4.0 CHECK ("wait_time_rating" >= 1 AND "wait_time_rating" <= 5),
      "review_text" TEXT NOT NULL,
      "review_tag" TEXT DEFAULT 'General',
      "review_tags" TEXT[] DEFAULT ARRAY['General'],
      "best_time_to_buy" TEXT DEFAULT 'Anytime',
      "review_photo_url" TEXT,
      "helpful_count" INT DEFAULT 0,
      "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE "Menu"
    ADD COLUMN IF NOT EXISTS "wait_time_rating" DECIMAL(2,1) DEFAULT 4.0;

    ALTER TABLE "Reviews"
    ADD COLUMN IF NOT EXISTS "taste_rating" DECIMAL(2, 1) DEFAULT 4.0,
    ADD COLUMN IF NOT EXISTS "value_rating" DECIMAL(2, 1) DEFAULT 4.0,
    ADD COLUMN IF NOT EXISTS "portion_rating" DECIMAL(2, 1) DEFAULT 4.0,
    ADD COLUMN IF NOT EXISTS "wait_time_rating" DECIMAL(2, 1) DEFAULT 4.0,
    ADD COLUMN IF NOT EXISTS "review_tags" TEXT[] DEFAULT ARRAY['General'],
    ADD COLUMN IF NOT EXISTS "review_photo_url" TEXT,
    ADD COLUMN IF NOT EXISTS "helpful_count" INT DEFAULT 0;
  `);
}

async function clearTables() {
  await pool.query(`
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
  `);
}

async function seedStarterData() {
  await pool.query(`
    INSERT INTO "Something" ("name") VALUES
    ('Seed 1'),
    ('Seed 2');

    INSERT INTO "Person" ("email", "name") VALUES
    ('alice@example.com', 'Alice'),
    ('bob@example.com', 'Bob');

    INSERT INTO "User" ("username", "email", "password", "balance") VALUES
    ('Admin', 'admin@gmail.com', 'admin', 0);
  `);
}

async function seedFoodCourts() {
  const sql = `
    INSERT INTO "FoodCourt" ("name", "location", "description")
    VALUES ($1, $2, $3);
  `;

  for (const foodCourt of foodCourts) {
    await pool.query(sql, [
      foodCourt.name,
      foodCourt.location,
      foodCourt.description,
    ]);
  }
}

async function seedStalls() {
  const sql = `
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
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15
    );
  `;

  for (const stall of stalls) {
    await pool.query(sql, [
      stall.name,
      stall.foodcourt_id,
      stall.halal,
      stall.vegetarian,
      stall.description,
      stall.cuisine_type,
      stall.location_detail,
      stall.opening_status,
      stall.opening_time,
      stall.closing_time,
      stall.estimated_wait_time,
      stall.rating,
      stall.rating_count,
      stall.image_url,
      stall.vegan,
    ]);
  }
}

async function seedMenuItems() {
  const insertedMenuItems = [];

  const sql = `
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
      "is_popular",

      "calories",
      "nutrition_level",
      "carb_level",
      "protein_level",
      "fat_level",
      "sugar_level",
      "spice_level",
      "allergen_info",
      "portion_size",

      "order_count",
      "prep_time_minutes",
      "meal_type",
      "dietary_tag",
      "flavour_profile",
      "student_need",
      "temperature_type",
      "is_budget_friendly",
      "is_quick_bite",
      "is_student_favourite",
      "is_customisable",
      "customisation_options",
      "menu_notes"
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25,
      $26, $27, $28, $29, $30,
      $31, $32
    )
    RETURNING
      "food_id",
      "name",
      "variation",
      "description",
      "price",
      "stall_id",
      "foodcourt_id",
      "category",
      "image_url",
      "is_available",
      "is_popular";
  `;

  for (let index = 0; index < menuItems.length; index += 1) {
    const item = menuItems[index];
    const meta = getMenuMeta(item, index);

    const result = await pool.query(sql, [
      item.name,
      item.variation,
      item.description,
      item.price,
      item.stall_id,
      item.foodcourt_id,
      item.category,
      item.image_url,
      item.is_available,
      item.is_popular,

      meta.calories,
      meta.nutrition_level,
      meta.carb_level,
      meta.protein_level,
      meta.fat_level,
      meta.sugar_level,
      meta.spice_level,
      meta.allergen_info,
      meta.portion_size,

      meta.order_count,
      meta.prep_time_minutes,
      meta.meal_type,
      meta.dietary_tag,
      meta.flavour_profile,
      meta.student_need,
      meta.temperature_type,
      meta.is_budget_friendly,
      meta.is_quick_bite,
      meta.is_student_favourite,
      meta.is_customisable,
      meta.customisation_options,
      meta.menu_notes,
    ]);

    insertedMenuItems.push(result.rows[0]);
  }

  return insertedMenuItems;
}

async function seedReviews(insertedMenuItems) {
  const reviews = buildReviewRows(insertedMenuItems);

  const sql = `
    INSERT INTO "Reviews" (
      "food_id",
      "reviewer_name",
      "rating",
      "taste_rating",
      "value_rating",
      "portion_rating",
      "wait_time_rating",
      "review_text",
      "review_tag",
      "review_tags",
      "best_time_to_buy",
      "review_photo_url",
      "helpful_count",
      "created_at"
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14
    );
  `;

  for (const review of reviews) {
    await pool.query(sql, [
      review.food_id,
      review.reviewer_name,
      review.rating,
      review.taste_rating,
      review.value_rating,
      review.portion_rating,
      review.wait_time_rating,
      review.review_text,
      review.review_tag,
      review.review_tags,
      review.best_time_to_buy,
      review.review_photo_url,
      review.helpful_count,
      review.created_at,
    ]);
  }
}

async function updateMenuStatsFromReviews() {
  await pool.query(`
    UPDATE "Menu"
    SET
      "item_rating" = review_stats.average_rating,
      "item_review_count" = review_stats.review_count,
      "taste_rating" = review_stats.average_taste,
      "value_rating" = review_stats.average_value,
      "portion_rating" = review_stats.average_portion,
      "wait_time_rating" = review_stats.average_wait
    FROM (
      SELECT
        "food_id",
        ROUND(AVG("rating")::numeric, 1) AS average_rating,
        COUNT("review_id")::INT AS review_count,
        ROUND(AVG("taste_rating")::numeric, 1) AS average_taste,
        ROUND(AVG("value_rating")::numeric, 1) AS average_value,
        ROUND(AVG("portion_rating")::numeric, 1) AS average_portion,
        ROUND(AVG("wait_time_rating")::numeric, 1) AS average_wait
      FROM "Reviews"
      GROUP BY "food_id"
    ) AS review_stats
    WHERE "Menu"."food_id" = review_stats."food_id";
  `);
}

async function seed() {
  console.log('Running seed...');

  try {
    await pool.query('BEGIN');

    await ensureReviewSchema();
    await clearTables();
    await seedStarterData();
    await seedFoodCourts();
    await seedStalls();

    const insertedMenuItems = await seedMenuItems();

    await seedReviews(insertedMenuItems);
    await updateMenuStatsFromReviews();

    await pool.query('COMMIT');

    console.log('Seed data inserted successfully.');
    console.log(`${foodCourts.length} food courts inserted.`);
    console.log(`${stalls.length} stalls inserted.`);
    console.log(`${menuItems.length} menu items inserted.`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();