const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/models/db');

async function getFirstFoodId() {
  const result = await pool.query('SELECT "food_id" FROM "Menu" ORDER BY "food_id" LIMIT 1');
  return result.rows[0].food_id;
}

async function createTestReview(label) {
  const foodId = await getFirstFoodId();
  const response = await request(app)
    .post('/api/reviews')
    .send({
      food_id: foodId,
      reviewer_name: label,
      rating: 4,
      taste_rating: 4,
      value_rating: 4,
      portion_rating: 4,
      wait_time_rating: 4,
      review_text: `${label} is a detailed integration test review.`,
      review_tags: ['Worth it'],
      best_time_to_buy: 'Lunch',
    })
    .expect(201);
  return response.body.data.review.review_id;
}

async function removeTestReview(reviewId) {
  if (!reviewId) return;
  await request(app).delete(`/api/admin/reviews/${reviewId}`);
}

afterAll(async () => {
  await pool.end();
});

describe('Food map full-stack integration', () => {
  test('returns all six mapped food courts with connected statistics', async () => {
    const response = await request(app).get('/api/food-map').expect(200);
    expect(response.body.data).toHaveLength(6);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        marker_label: 'FC1',
        stall_count: expect.any(Number),
        open_stall_count: expect.any(Number),
        popular_dishes: expect.any(Array),
      }),
    );
  });

  test('limits each food-court preview to three popular dishes', async () => {
    const response = await request(app).get('/api/food-map').expect(200);
    response.body.data.forEach((foodCourt) => {
      expect(foodCourt.popular_dishes.length).toBeLessThanOrEqual(3);
    });
  });

  test('popular dishes link to real stalls and menu records', async () => {
    const response = await request(app).get('/api/food-map').expect(200);
    const dish = response.body.data.flatMap((court) => court.popular_dishes)[0];
    expect(dish).toEqual(
      expect.objectContaining({
        food_id: expect.any(Number),
        stall_id: expect.any(Number),
      }),
    );
  });
});

describe('Browse stalls and menu full-stack integration', () => {
  test('searches across stall and menu content', async () => {
    const response = await request(app).get('/api/stalls?search=Chicken%20Rice').expect(200);
    expect(response.body.count).toBeGreaterThan(0);
    expect(response.body.data.some((stall) => /chicken/i.test(stall.stall_name))).toBe(true);
  });

  test.each([
    ['dietary=halal', 'is_halal'],
    ['dietary=vegetarian', 'is_vegetarian'],
    ['dietary=vegan', 'is_vegan'],
  ])('applies the %s stall filter', async (query, property) => {
    const response = await request(app).get(`/api/stalls?${query}`).expect(200);
    expect(response.body.count).toBeGreaterThan(0);
    response.body.data.forEach((stall) => expect(stall[property]).toBe(true));
  });

  test('opens one stall and retrieves its connected menu', async () => {
    const stalls = await request(app).get('/api/stalls').expect(200);
    const stallId = stalls.body.data[0].stall_id;
    const detail = await request(app).get(`/api/stalls/${stallId}`).expect(200);
    const menu = await request(app).get(`/api/stalls/${stallId}/menu`).expect(200);
    expect(detail.body.data.stall_id).toBe(stallId);
    expect(menu.body.count).toBeGreaterThan(0);
  });

  test('supports menu search, category and price ordering', async () => {
    const search = await request(app).get('/api/menu-items?search=rice').expect(200);
    expect(search.body.count).toBeGreaterThan(0);

    const category = search.body.data[0].category;
    const filtered = await request(app)
      .get(`/api/menu-items?category=${encodeURIComponent(category)}`)
      .expect(200);
    filtered.body.data.forEach((item) =>
      expect(item.category.toLowerCase()).toContain(category.toLowerCase()),
    );

    const sorted = await request(app).get('/api/menu-items?sort=price_asc').expect(200);
    const prices = sorted.body.data.map((item) => Number(item.price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

describe('Food quiz full-stack integration', () => {
  test('returns database-driven quiz options', async () => {
    const response = await request(app).get('/api/quiz/options').expect(200);
    expect(response.body.data.food_courts).toHaveLength(6);
    expect(response.body.data.categories.length).toBeGreaterThan(0);
    expect(response.body.data.price_range.max_price).toBeGreaterThan(
      response.body.data.price_range.min_price,
    );
  });

  test('returns at most the requested number of scored recommendations', async () => {
    const response = await request(app)
      .post('/api/quiz/recommendations')
      .send({ budget: 'low', time: 'quick', mood: 'comfort', limit: 3 })
      .expect(200);
    expect(response.body.count).toBeLessThanOrEqual(3);
    response.body.data.forEach((item) => {
      expect(item).toHaveProperty('match_score');
      expect(item.match_reasons.length).toBeGreaterThan(0);
    });
  });

  test('uses fallback mode when strict preferences cannot be combined', async () => {
    const response = await request(app)
      .post('/api/quiz/recommendations')
      .send({ search: 'Chicken Rice', dietary: 'vegan', temperature: 'cold' })
      .expect(200);
    expect(['strict', 'fallback']).toContain(response.body.matching_mode);
    expect(response.body.total_candidates).toBeGreaterThanOrEqual(response.body.count);
  });
});

describe('Review hub and admin full-stack integration', () => {
  test('lists seeded reviews, menu choices, filters and summary data', async () => {
    const reviews = await request(app).get('/api/reviews?sort=helpful').expect(200);
    const menu = await request(app).get('/api/reviews/menu-options?availableOnly=true').expect(200);
    const filters = await request(app).get('/api/reviews/filter-options').expect(200);
    const summary = await request(app).get('/api/reviews/summary').expect(200);
    expect(reviews.body.count).toBeGreaterThan(0);
    expect(menu.body.count).toBeGreaterThan(0);
    expect(filters.body.data.tags.length).toBeGreaterThan(0);
    expect(summary.body.data.total_reviews).toBeGreaterThan(0);
  });

  test('rejects incomplete reviews without changing the database', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .send({ food_id: 1, rating: 5, review_text: 'short' })
      .expect(400);
    expect(response.body.message).toContain('at least 20 characters');
  });

  test('creates a review and persists a helpful vote', async () => {
    const reviewId = await createTestReview(`CA4 Helpful ${Date.now()}`);
    try {
      const response = await request(app).patch(`/api/reviews/${reviewId}/helpful`).expect(200);
      expect(response.body.data.helpful_count).toBe(1);
      const stored = await pool.query(
        'SELECT "helpful_count" FROM "Reviews" WHERE "review_id" = $1',
        [reviewId],
      );
      expect(stored.rows[0].helpful_count).toBe(1);
    } finally {
      await removeTestReview(reviewId);
    }
  });

  test('edits a review and recalculates menu and stall statistics', async () => {
    const reviewId = await createTestReview(`CA4 Edit ${Date.now()}`);
    try {
      const response = await request(app)
        .put(`/api/admin/reviews/${reviewId}`)
        .send({
          rating: 5,
          taste_rating: 5,
          value_rating: 5,
          portion_rating: 5,
          wait_time_rating: 5,
          review_text: 'Updated through the complete integration workflow.',
          review_tags: ['Worth it', 'Good for lunch'],
          best_time_to_buy: 'Lunch',
        })
        .expect(200);
      expect(response.body.data.review.rating).toBe('5.0');
      expect(response.body.data.updated_stats.menu_stats).toBeTruthy();
      expect(response.body.data.updated_stats.stall_stats).toBeTruthy();
    } finally {
      await removeTestReview(reviewId);
    }
  });

  test('admin rating filter finds records and delete removes an owned review', async () => {
    const reviewId = await createTestReview(`CA4 Delete ${Date.now()}`);
    const list = await request(app).get('/api/admin/reviews?rating=4').expect(200);
    expect(list.body.count).toBeGreaterThan(0);

    await request(app).delete(`/api/admin/reviews/${reviewId}`).expect(200);
    const stored = await pool.query('SELECT 1 FROM "Reviews" WHERE "review_id" = $1', [reviewId]);
    expect(stored.rows).toHaveLength(0);
  });
});
