const pool = require('../../src/models/db');
const FoodMapModel = require('../../src/models/FoodMap_model');
const FoodStallModel = require('../../src/models/FoodStall_model');
const MenuItemModel = require('../../src/models/MenuItem_model');
const QuizModel = require('../../src/models/Quiz_model');
const ReviewModel = require('../../src/models/Review_model');
const ReviewAdminModel = require('../../src/models/ReviewAdmin_model');

jest.mock('../../src/models/db', () => ({
  query: jest.fn(),
  end: jest.fn(),
  on: jest.fn(),
}));

function reply(error, rows = []) {
  pool.query.mockImplementationOnce((...args) => {
    const callback = args.at(-1);
    callback(error, { rows });
  });
}

function invoke(modelFunction, ...args) {
  return new Promise((resolve) => {
    modelFunction(...args, (error, data) => resolve({ error, data }));
  });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('FoodMap_model', () => {
  test('returns mapped food courts, marker fallbacks and no more than three dishes', async () => {
    reply(null, [
      {
        foodcourt_id: 1,
        name: 'Food Court 1',
        location: 'Block 1',
        description: 'Central',
        stall_count: '2',
        open_stall_count: '1',
        average_rating: '4.4',
      },
      {
        foodcourt_id: 9,
        name: 'Pop-up Court',
        location: 'Event Plaza',
        description: 'Temporary',
        stall_count: null,
        open_stall_count: null,
        average_rating: null,
      },
    ]);
    reply(null, [
      {
        foodcourt_id: 1,
        food_id: 1,
        item_name: 'A',
        price: '4.20',
        item_rating: '4.5',
      },
      {
        foodcourt_id: 1,
        food_id: 2,
        item_name: 'B',
        price: null,
        item_rating: null,
      },
      {
        foodcourt_id: 1,
        food_id: 3,
        item_name: 'C',
        price: '5.00',
        item_rating: '4.0',
      },
      {
        foodcourt_id: 1,
        food_id: 4,
        item_name: 'D',
        price: '6.00',
        item_rating: '3.0',
      },
      {
        foodcourt_id: 9,
        food_id: 5,
        item_name: 'E',
        price: '3.00',
        item_rating: '5.0',
      },
    ]);

    const { error, data } = await invoke(FoodMapModel.selectFoodMapMarkers);

    expect(error).toBeNull();
    expect(data[0]).toMatchObject({ marker_label: 'FC1', stall_count: 2 });
    expect(data[0].popular_dishes).toHaveLength(3);
    expect(data[1]).toMatchObject({
      marker_label: 'FC9',
      map_x: 50,
      average_rating: 0,
    });
    expect(data[1].popular_dishes[0]).toMatchObject({ price: 3, rating: 5 });
  });

  test('propagates the food-court query error', async () => {
    const databaseError = new Error('food court query failed');
    reply(databaseError);

    await expect(invoke(FoodMapModel.selectFoodMapMarkers)).resolves.toEqual({
      error: databaseError,
      data: null,
    });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  test('propagates the popular-dish query error', async () => {
    const databaseError = new Error('dish query failed');
    reply(null, []);
    reply(databaseError);

    await expect(invoke(FoodMapModel.selectFoodMapMarkers)).resolves.toEqual({
      error: databaseError,
      data: null,
    });
  });
});

describe('FoodStall_model', () => {
  test.each([
    ['halal', 'S."halal" = TRUE'],
    ['vegetarian', 'S."vegetarian" = TRUE'],
    ['vegan', 'S."vegan" = TRUE'],
  ])('builds a complete stall query for %s filtering', (dietary, expectedSql) => {
    const callback = jest.fn();
    FoodStallModel.selectStalls(
      {
        search: 'rice',
        foodCourt: 'Food Court 1',
        dietary,
        status: 'open',
        foodType: 'Asian',
      },
      callback,
    );

    const [sql, values, receivedCallback] = pool.query.mock.calls[0];
    expect(sql).toContain(expectedSql);
    expect(sql).toContain('M."variation" ILIKE $1');
    expect(values).toEqual(['%rice%', 'Food Court 1', 'open', '%Asian%']);
    expect(receivedCallback).toBe(callback);
  });

  test('supports no optional stall filters', () => {
    FoodStallModel.selectStalls({}, jest.fn());
    const [sql, values] = pool.query.mock.calls[0];
    expect(values).toEqual([]);
    expect(sql).not.toContain('ILIKE $1');
  });

  test('normalises a formatted stall id when selecting one stall', () => {
    FoodStallModel.selectStallById({ stall_id: 'stall_007' }, jest.fn());
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('REGEXP_REPLACE($1::TEXT');
    expect(values).toEqual(['stall_007']);
  });

  test('normalises a formatted stall id when selecting its menu', () => {
    FoodStallModel.selectMenuByStallId({ stall_id: 'stall_003' }, jest.fn());
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('M."stall_id" = CAST');
    expect(values).toEqual(['stall_003']);
  });
});

describe('MenuItem_model', () => {
  test('runs every menu query with the expected parameter or ordering', () => {
    const callback = jest.fn();
    MenuItemModel.selectAllMenuItems(callback);
    MenuItemModel.searchMenuItems({ search: 'rice' }, callback);
    MenuItemModel.filterMenuItemsByCategory({ category: 'Noodles' }, callback);
    MenuItemModel.filterMenuItemsByStallId({ stallId: 'stall_002' }, callback);
    MenuItemModel.filterMenuItemsByAvailability({ available: 'true' }, callback);
    MenuItemModel.filterMenuItemsByAvailability({ available: 'false' }, callback);
    MenuItemModel.selectPopularMenuItems(callback);
    MenuItemModel.sortMenuItemsByPriceLow(callback);
    MenuItemModel.sortMenuItemsByPriceHigh(callback);
    MenuItemModel.sortMenuItemsByName(callback);
    MenuItemModel.selectMenuItemById({ item_id: 'item_012' }, callback);

    expect(pool.query.mock.calls[1][1]).toEqual(['%rice%']);
    expect(pool.query.mock.calls[2][1]).toEqual(['%Noodles%']);
    expect(pool.query.mock.calls[3][1]).toEqual(['stall_002']);
    expect(pool.query.mock.calls[4][1]).toEqual([true]);
    expect(pool.query.mock.calls[5][1]).toEqual([false]);
    expect(pool.query.mock.calls[7][0]).toContain('M."price" ASC');
    expect(pool.query.mock.calls[8][0]).toContain('M."price" DESC');
    expect(pool.query.mock.calls[9][0]).toContain('M."name" ASC');
    expect(pool.query.mock.calls[10][1]).toEqual(['item_012']);
  });
});

describe('Quiz_model', () => {
  test('returns all quiz option groups and numeric price bounds', async () => {
    reply(null, [{ foodcourt_id: 1, foodcourt_name: 'FC1' }]);
    reply(null, [{ category: 'Rice' }, { category: 'Noodles' }]);
    reply(null, [{ min_price: '3.5', max_price: '9.9' }]);

    const { error, data } = await invoke(QuizModel.selectQuizOptions);

    expect(error).toBeNull();
    expect(data.categories).toEqual(['Rice', 'Noodles']);
    expect(data.price_range).toEqual({ min_price: 3.5, max_price: 9.9 });
    expect(data.budget_options).toHaveLength(4);
    expect(data.mood_options).toHaveLength(7);
    expect(data.sort_options).toHaveLength(5);
  });

  test.each([0, 1, 2])('propagates an option query error at stage %i', async (stage) => {
    for (let index = 0; index < stage; index += 1) reply(null, [{ category: 'Rice' }]);
    const databaseError = new Error(`stage ${stage}`);
    reply(databaseError);

    const result = await invoke(QuizModel.selectQuizOptions);
    expect(result).toEqual({ error: databaseError, data: null });
  });

  test('uses zero for empty quiz price bounds', async () => {
    reply(null, []);
    reply(null, []);
    reply(null, [{ min_price: null, max_price: null }]);
    const { data } = await invoke(QuizModel.selectQuizOptions);
    expect(data.price_range).toEqual({ min_price: 0, max_price: 0 });
  });

  test('builds candidate filters and returns rows', async () => {
    reply(null, [{ food_id: 1 }]);
    const filters = {
      availableOnly: true,
      search: 'rice',
      foodCourt: 'FC1',
      category: 'Rice',
      maxPrice: 6,
    };

    const { data } = await invoke(QuizModel.selectQuizMenuCandidates, filters);
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('m."is_available" = TRUE');
    expect(sql).toContain('m."price" <= $4');
    expect(values).toEqual(['rice', 'FC1', 'Rice', 6]);
    expect(data).toEqual([{ food_id: 1 }]);
  });

  test('supports no candidate filters and propagates query errors', async () => {
    const databaseError = new Error('candidate failure');
    reply(databaseError);
    const result = await invoke(QuizModel.selectQuizMenuCandidates, {
      availableOnly: false,
      search: '',
      foodCourt: 'all',
      category: 'all',
      maxPrice: null,
    });
    expect(pool.query.mock.calls[0][0]).not.toContain('WHERE');
    expect(result).toEqual({ error: databaseError, data: null });
  });
});

describe('Review_model', () => {
  test.each([
    ['highest', 'r."rating" DESC'],
    ['lowest', 'r."rating" ASC'],
    ['helpful', 'r."helpful_count" DESC'],
    ['dish', 'm."name" ASC'],
    ['newest', 'r."created_at" DESC'],
  ])('selectReviews supports %s sorting', async (sort, expectedSql) => {
    reply(null, [{ review_id: 1 }]);
    const { data } = await invoke(ReviewModel.selectReviews, {
      search: 'good',
      tag: 'Worth it',
      foodCourt: 'FC1',
      minRating: 4,
      ratingRange: '',
      sort,
    });
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain(expectedSql);
    expect(values).toEqual(['good', 'Worth it', 'FC1', 4]);
    expect(data).toEqual([{ review_id: 1 }]);
  });

  test('selectReviews prioritises below-three filtering and handles errors', async () => {
    const databaseError = new Error('reviews failed');
    reply(databaseError);
    const result = await invoke(ReviewModel.selectReviews, {
      search: '',
      tag: 'all',
      foodCourt: 'all',
      minRating: 5,
      ratingRange: 'below3',
      sort: 'newest',
    });
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain('r."rating" < 3');
    expect(values).toEqual([]);
    expect(result).toEqual({ error: databaseError, data: null });
  });

  test.each([
    ['selectReviewById', ReviewModel.selectReviewById, 7],
    ['selectReviewsByFoodId', ReviewModel.selectReviewsByFoodId, 8],
    ['selectMenuItemByFoodId', ReviewModel.selectMenuItemByFoodId, 9],
  ])('%s returns database results', async (name, method, id) => {
    reply(null, [{ id, marker: name }]);
    const { data } = await invoke(method, id);
    expect(pool.query.mock.calls[0][1]).toEqual([id]);
    if (name === 'selectReviewsByFoodId') {
      expect(data).toEqual([{ id, marker: name }]);
    } else {
      expect(data).toEqual({ id, marker: name });
    }
  });

  test.each([ReviewModel.selectReviewById, ReviewModel.selectMenuItemByFoodId])(
    'single-row selectors return null for no match',
    async (method) => {
      reply(null, []);
      await expect(invoke(method, 999)).resolves.toEqual({
        error: null,
        data: null,
      });
    },
  );

  test.each([
    ['rating', 'm."item_rating" DESC'],
    ['price-low', 'm."price" ASC'],
    ['price-high', 'm."price" DESC'],
    ['quick', 'm."prep_time_minutes" ASC'],
    ['name', 'm."name" ASC'],
    ['popular', 'm."is_popular" DESC'],
  ])('menu option sorting supports %s', async (sort, expectedSql) => {
    reply(null, [{ food_id: 2 }]);
    const { data } = await invoke(ReviewModel.selectReviewMenuOptions, {
      search: 'noodle',
      foodCourt: 'FC2',
      category: 'Noodles',
      availableOnly: true,
      sort,
    });
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain(expectedSql);
    expect(sql).toContain('m."is_available" = TRUE');
    expect(values).toEqual(['noodle', 'FC2', 'Noodles']);
    expect(data).toEqual([{ food_id: 2 }]);
  });

  test.each([0, 1, 2])('filter options propagate an error at stage %i', async (stage) => {
    for (let index = 0; index < stage; index += 1)
      reply(null, [{ tag: 'Cheap', category: 'Rice' }]);
    const databaseError = new Error(`filter stage ${stage}`);
    reply(databaseError);
    await expect(invoke(ReviewModel.selectReviewFilterOptions)).resolves.toEqual({
      error: databaseError,
      data: null,
    });
  });

  test('filter options return tags, courts, categories and UI choices', async () => {
    reply(null, [{ tag: 'Cheap' }]);
    reply(null, [{ foodcourt_id: 1, foodcourt_name: 'FC1' }]);
    reply(null, [{ category: 'Rice' }]);
    const { data } = await invoke(ReviewModel.selectReviewFilterOptions);
    expect(data).toMatchObject({ tags: ['Cheap'], categories: ['Rice'] });
    expect(data.rating_filters).toHaveLength(4);
    expect(data.sort_options).toHaveLength(5);
  });

  test('insertReview passes every value and returns the inserted id', async () => {
    reply(null, [{ review_id: 10, food_id: 2 }]);
    const reviewData = {
      food_id: 2,
      reviewer_name: 'Thomas',
      rating: 5,
      taste_rating: 5,
      value_rating: 4,
      portion_rating: 4,
      wait_time_rating: 3,
      review_text: 'A detailed and useful student review.',
      review_tag: 'Worth it',
      review_tags: ['Worth it'],
      best_time_to_buy: 'Lunch',
      review_photo_url: null,
    };
    const { data } = await invoke(ReviewModel.insertReview, reviewData);
    expect(pool.query.mock.calls[0][1]).toEqual(Object.values(reviewData));
    expect(data.review_id).toBe(10);
  });

  test.each([
    ['updateMenuReviewStats', ReviewModel.updateMenuReviewStats],
    ['incrementHelpfulCount', ReviewModel.incrementHelpfulCount],
    ['updateStallReviewStatsByFoodId', ReviewModel.updateStallReviewStatsByFoodId],
  ])('%s returns its updated row', async (name, method) => {
    reply(null, [{ name, food_id: 3 }]);
    const { data } = await invoke(method, 3);
    expect(data).toMatchObject({ name });
  });

  test.each([ReviewModel.incrementHelpfulCount, ReviewModel.updateStallReviewStatsByFoodId])(
    'nullable review mutations return null when no row changes',
    async (method) => {
      reply(null, []);
      await expect(invoke(method, 999)).resolves.toEqual({
        error: null,
        data: null,
      });
    },
  );

  test.each([0, 1, 2, 3])('summary propagates an error at stage %i', async (stage) => {
    for (let index = 0; index < stage; index += 1) reply(null, [{}]);
    const databaseError = new Error(`summary stage ${stage}`);
    reply(databaseError);
    await expect(invoke(ReviewModel.selectReviewSummary)).resolves.toEqual({
      error: databaseError,
      data: null,
    });
  });

  test('summary converts rating values and handles missing leaders', async () => {
    reply(null, [
      {
        total_reviews: 0,
        average_rating: null,
        average_taste_rating: null,
        average_value_rating: null,
        average_portion_rating: null,
        average_wait_time_rating: null,
        total_helpful_count: 0,
      },
    ]);
    reply(null, []);
    reply(null, []);
    reply(null, [{ rating_group: '4★+ Good', review_count: 0 }]);
    const { data } = await invoke(ReviewModel.selectReviewSummary);
    expect(data).toMatchObject({
      average_rating: 0,
      top_tag: null,
      top_dish: null,
    });
  });
});

describe('ReviewAdmin_model', () => {
  test.each([
    ['5', 'r."rating" >= 4.5'],
    ['4', 'r."rating" >= 4 AND'],
    ['3', 'r."rating" >= 3 AND'],
    ['below3', 'r."rating" < 3'],
    ['all', 'ORDER BY r."created_at"'],
  ])('builds the %s admin rating filter', async (ratingFilter, expectedSql) => {
    reply(null, [{ review_id: 1 }]);
    const { data } = await invoke(ReviewAdminModel.selectAdminReviews, {
      search: ratingFilter === 'all' ? '' : 'rice',
      ratingFilter,
    });
    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain(expectedSql);
    expect(values).toEqual(ratingFilter === 'all' ? [] : ['rice']);
    expect(data).toHaveLength(1);
  });

  test('admin list propagates database errors', async () => {
    const databaseError = new Error('admin list failed');
    reply(databaseError);
    await expect(
      invoke(ReviewAdminModel.selectAdminReviews, {
        search: '',
        ratingFilter: 'all',
      }),
    ).resolves.toEqual({ error: databaseError, data: null });
  });

  test('selectAdminReviewById returns one row or null', async () => {
    reply(null, [{ review_id: 2 }]);
    await expect(invoke(ReviewAdminModel.selectAdminReviewById, 2)).resolves.toEqual({
      error: null,
      data: { review_id: 2 },
    });
    pool.query.mockClear();
    reply(null, []);
    await expect(invoke(ReviewAdminModel.selectAdminReviewById, 99)).resolves.toEqual({
      error: null,
      data: null,
    });
  });

  test.each([0, 1, 2])('admin summary propagates an error at stage %i', async (stage) => {
    for (let index = 0; index < stage; index += 1) reply(null, [{}]);
    const databaseError = new Error(`admin summary ${stage}`);
    reply(databaseError);
    await expect(invoke(ReviewAdminModel.selectAdminSummary)).resolves.toEqual({
      error: databaseError,
      data: null,
    });
  });

  test('admin summary returns metrics and converts an empty average', async () => {
    reply(null, [
      {
        total_reviews: 0,
        average_rating: null,
        total_helpful_count: 0,
        photo_review_count: 0,
      },
    ]);
    reply(null, [{ label: '5 star', review_count: 0 }]);
    reply(null, []);
    const { data } = await invoke(ReviewAdminModel.selectAdminSummary);
    expect(data).toMatchObject({ average_rating: 0, total_reviews: 0 });
  });

  test('updateAdminReview supplies all edited values', async () => {
    reply(null, [{ review_id: 4, food_id: 7 }]);
    const reviewData = {
      rating: 5,
      taste_rating: 4,
      value_rating: 3,
      portion_rating: 4,
      wait_time_rating: 2,
      review_text: 'Updated review',
      review_tag: 'Cheap',
      review_tags: ['Cheap'],
      best_time_to_buy: 'Morning',
      review_photo_url: null,
    };
    const { data } = await invoke(ReviewAdminModel.updateAdminReview, 4, reviewData);
    expect(pool.query.mock.calls[0][1]).toEqual([4, ...Object.values(reviewData)]);
    expect(data.food_id).toBe(7);
  });

  test.each([
    ['deleteAdminReview', ReviewAdminModel.deleteAdminReview],
    ['incrementAdminHelpfulCount', ReviewAdminModel.incrementAdminHelpfulCount],
    ['recalculateMenuStats', ReviewAdminModel.recalculateMenuStats],
    ['recalculateStallStatsByFoodId', ReviewAdminModel.recalculateStallStatsByFoodId],
  ])('%s returns an updated row and supports no match', async (name, method) => {
    reply(null, [{ name }]);
    await expect(invoke(method, 5)).resolves.toEqual({
      error: null,
      data: { name },
    });
    pool.query.mockClear();
    reply(null, []);
    await expect(invoke(method, 99)).resolves.toEqual({
      error: null,
      data: null,
    });
  });

  test.each([
    ReviewAdminModel.selectAdminReviewById,
    ReviewAdminModel.updateAdminReview,
    ReviewAdminModel.deleteAdminReview,
    ReviewAdminModel.incrementAdminHelpfulCount,
    ReviewAdminModel.recalculateMenuStats,
    ReviewAdminModel.recalculateStallStatsByFoodId,
  ])('admin model mutations propagate database errors', async (method) => {
    const databaseError = new Error('database failed');
    reply(databaseError);
    const args = method === ReviewAdminModel.updateAdminReview ? [1, {}] : [1];
    await expect(invoke(method, ...args)).resolves.toEqual({
      error: databaseError,
      data: null,
    });
  });
});
