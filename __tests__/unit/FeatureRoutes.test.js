const request = require('supertest');

jest.mock('../../src/models/FoodMap_model', () => ({
  selectFoodMapMarkers: jest.fn(),
}));
jest.mock('../../src/models/FoodStall_model', () => ({
  selectStalls: jest.fn(),
  selectStallById: jest.fn(),
  selectMenuByStallId: jest.fn(),
}));
jest.mock('../../src/models/MenuItem_model', () => ({
  selectAllMenuItems: jest.fn(),
  searchMenuItems: jest.fn(),
  filterMenuItemsByCategory: jest.fn(),
  filterMenuItemsByStallId: jest.fn(),
  filterMenuItemsByAvailability: jest.fn(),
  selectPopularMenuItems: jest.fn(),
  sortMenuItemsByPriceLow: jest.fn(),
  sortMenuItemsByPriceHigh: jest.fn(),
  sortMenuItemsByName: jest.fn(),
  selectMenuItemById: jest.fn(),
}));
jest.mock('../../src/models/Quiz_model', () => ({
  selectQuizOptions: jest.fn(),
  selectQuizMenuCandidates: jest.fn(),
}));
jest.mock('../../src/models/Review_model', () => ({
  selectReviews: jest.fn(),
  selectReviewById: jest.fn(),
  selectReviewsByFoodId: jest.fn(),
  selectMenuItemByFoodId: jest.fn(),
  selectReviewMenuOptions: jest.fn(),
  selectReviewFilterOptions: jest.fn(),
  insertReview: jest.fn(),
  updateMenuReviewStats: jest.fn(),
  incrementHelpfulCount: jest.fn(),
  updateStallReviewStatsByFoodId: jest.fn(),
  selectReviewSummary: jest.fn(),
}));
jest.mock('../../src/models/ReviewAdmin_model', () => ({
  selectAdminReviews: jest.fn(),
  selectAdminReviewById: jest.fn(),
  selectAdminSummary: jest.fn(),
  updateAdminReview: jest.fn(),
  deleteAdminReview: jest.fn(),
  incrementAdminHelpfulCount: jest.fn(),
  recalculateMenuStats: jest.fn(),
  recalculateStallStatsByFoodId: jest.fn(),
}));

const FoodMapModel = require('../../src/models/FoodMap_model');
const FoodStallModel = require('../../src/models/FoodStall_model');
const MenuItemModel = require('../../src/models/MenuItem_model');
const QuizModel = require('../../src/models/Quiz_model');
const ReviewModel = require('../../src/models/Review_model');
const ReviewAdminModel = require('../../src/models/ReviewAdmin_model');
const app = require('../../src/app');

function reply(mockFunction, error, result) {
  mockFunction.mockImplementationOnce((...args) => args.at(-1)(error, result));
}

afterEach(() => jest.clearAllMocks());

describe('Feature API routing', () => {
  test('serves the frontend, favicon and JSON 404 response', async () => {
    await request(app).get('/stalls.html').expect(200).expect('Content-Type', /html/);
    await request(app).get('/favicon.ico').expect(204);
    const missing = await request(app).get('/not-a-real-route').expect(404);
    expect(missing.body.error).toContain('Unknown resource GET');
  });

  test('routes food-map requests and formats unexpected errors as JSON', async () => {
    reply(FoodMapModel.selectFoodMapMarkers, null, [{ foodcourt_id: 1 }]);
    const success = await request(app).get('/api/food-map').expect(200);
    expect(success.body.data).toHaveLength(1);

    reply(FoodMapModel.selectFoodMapMarkers, new Error('map unavailable'), null);
    const failure = await request(app).get('/api/food-map').expect(500);
    expect(failure.body).toEqual({ error: 'map unavailable' });
  });

  test('routes stall discovery, detail and menu requests', async () => {
    reply(FoodStallModel.selectStalls, null, {
      rows: [{ stall_id: 'stall_001' }],
    });
    await request(app).get('/api/stalls?search=rice&status=open').expect(200);

    reply(FoodStallModel.selectStallById, null, {
      rows: [{ stall_id: 'stall_001' }],
    });
    await request(app).get('/api/stalls/stall_001').expect(200);

    reply(FoodStallModel.selectMenuByStallId, null, {
      rows: [{ item_id: 'item_001' }],
    });
    await request(app).get('/api/stalls/stall_001/menu').expect(200);
  });

  test('routes menu search and item lookup', async () => {
    reply(MenuItemModel.searchMenuItems, null, { rows: [{ food_id: 1 }] });
    const list = await request(app).get('/api/menu-items?search=rice').expect(200);
    expect(list.body.count).toBe(1);

    reply(MenuItemModel.selectMenuItemById, null, { rows: [{ food_id: 1 }] });
    const item = await request(app).get('/api/menu-items/item_001').expect(200);
    expect(item.body.data.food_id).toBe(1);
  });

  test('routes quiz options and GET/POST recommendation journeys', async () => {
    reply(QuizModel.selectQuizOptions, null, { categories: ['Rice'] });
    await request(app).get('/api/quiz/options').expect(200);

    reply(QuizModel.selectQuizMenuCandidates, null, []);
    await request(app).get('/api/quiz/recommendations?budget=low').expect(200);

    reply(QuizModel.selectQuizMenuCandidates, null, []);
    await request(app).post('/api/quiz/recommendations').send({ mood: 'healthy' }).expect(200);
  });

  test('routes public review reads and both helpful HTTP methods', async () => {
    reply(ReviewModel.selectReviews, null, [{ review_id: 1 }]);
    await request(app).get('/api/reviews').expect(200);

    reply(ReviewModel.selectReviewSummary, null, { total_reviews: 1 });
    await request(app).get('/api/reviews/summary').expect(200);

    reply(ReviewModel.selectReviewFilterOptions, null, { tags: [] });
    await request(app).get('/api/reviews/filter-options').expect(200);

    reply(ReviewModel.selectReviewMenuOptions, null, []);
    await request(app).get('/api/reviews/menu-options').expect(200);

    reply(ReviewModel.selectReviewsByFoodId, null, []);
    await request(app).get('/api/reviews/menu/1').expect(200);

    reply(ReviewModel.incrementHelpfulCount, null, {
      review_id: 1,
      helpful_count: 1,
    });
    await request(app).patch('/api/reviews/1/helpful').expect(200);

    reply(ReviewModel.incrementHelpfulCount, null, {
      review_id: 1,
      helpful_count: 2,
    });
    await request(app).post('/api/reviews/1/helpful').expect(200);
  });

  test('routes review creation through every connected model update', async () => {
    reply(ReviewModel.selectMenuItemByFoodId, null, {
      food_id: 1,
      name: 'Rice',
    });
    reply(ReviewModel.insertReview, null, { review_id: 5, food_id: 1 });
    reply(ReviewModel.updateMenuReviewStats, null, { item_rating: 5 });
    reply(ReviewModel.updateStallReviewStatsByFoodId, null, { rating: 5 });
    reply(ReviewModel.selectReviewById, null, { review_id: 5, rating: 5 });

    const response = await request(app)
      .post('/api/reviews')
      .send({
        food_id: 1,
        reviewer_name: 'CA4 route test',
        rating: 5,
        review_text: 'This is a detailed route-level review test.',
      })
      .expect(201);
    expect(response.body.data.review.review_id).toBe(5);
  });

  test('routes all admin review operations', async () => {
    reply(ReviewAdminModel.selectAdminReviews, null, [{ review_id: 1 }]);
    await request(app).get('/api/admin/reviews').expect(200);

    reply(ReviewAdminModel.selectAdminSummary, null, { total_reviews: 1 });
    await request(app).get('/api/admin/reviews/summary').expect(200);

    reply(ReviewAdminModel.updateAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    reply(ReviewAdminModel.recalculateMenuStats, null, {});
    reply(ReviewAdminModel.recalculateStallStatsByFoodId, null, {});
    reply(ReviewAdminModel.selectAdminReviewById, null, { review_id: 1 });
    await request(app)
      .put('/api/admin/reviews/1')
      .send({
        rating: 4,
        taste_rating: 4,
        value_rating: 4,
        portion_rating: 4,
        wait_time_rating: 4,
        review_text: 'Updated through the admin API.',
      })
      .expect(200);

    reply(ReviewAdminModel.incrementAdminHelpfulCount, null, {
      review_id: 1,
      helpful_count: 2,
    });
    await request(app).patch('/api/admin/reviews/1/helpful').expect(200);

    reply(ReviewAdminModel.deleteAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    reply(ReviewAdminModel.recalculateMenuStats, null, {});
    reply(ReviewAdminModel.recalculateStallStatsByFoodId, null, {});
    await request(app).delete('/api/admin/reviews/1').expect(200);
  });
});
