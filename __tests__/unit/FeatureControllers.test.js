const FoodMapModel = require('../../src/models/FoodMap_model');
const FoodStallModel = require('../../src/models/FoodStall_model');
const MenuItemModel = require('../../src/models/MenuItem_model');
const QuizModel = require('../../src/models/Quiz_model');
const ReviewModel = require('../../src/models/Review_model');
const ReviewAdminModel = require('../../src/models/ReviewAdmin_model');

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

const FoodMapController = require('../../src/controllers/FoodMap_Controller');
const FoodStallController = require('../../src/controllers/FoodStall_Controller');
const MenuItemController = require('../../src/controllers/MenuItem_Controller');
const QuizController = require('../../src/controllers/Quiz_Controller');
const ReviewController = require('../../src/controllers/Review_Controller');
const ReviewAdminController = require('../../src/controllers/ReviewAdmin_Controller');

function makeResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

function request(overrides = {}) {
  return {
    method: 'GET',
    query: {},
    params: {},
    body: {},
    ...overrides,
  };
}

function modelReply(mockFunction, error, data) {
  mockFunction.mockImplementationOnce((...args) => args.at(-1)(error, data));
}

function runController(controller, req = request()) {
  const res = makeResponse();
  const next = jest.fn();
  controller(req, res, next);
  return { res, next };
}

function validReview(overrides = {}) {
  return {
    food_id: 1,
    reviewer_name: 'Thomas',
    rating: 4.5,
    taste_rating: 5,
    value_rating: 4,
    portion_rating: 4,
    wait_time_rating: 3,
    review_text: 'This is a useful and detailed student food review.',
    review_tags: ['Worth it', 'Good for lunch'],
    best_time_to_buy: 'Lunch',
    review_photo_url: 'https://example.com/meal.jpg',
    ...overrides,
  };
}

function validAdminUpdate(overrides = {}) {
  return {
    rating: 4.5,
    taste_rating: 5,
    value_rating: 4,
    portion_rating: 4,
    wait_time_rating: 3,
    review_text: 'Updated review text for admin moderation',
    review_tags: ['Worth it'],
    best_time_to_buy: 'Lunch',
    review_photo_url: '',
    ...overrides,
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('Food map, stall and menu controllers', () => {
  test('food map returns markers and forwards errors', () => {
    modelReply(FoodMapModel.selectFoodMapMarkers, null, [{ foodcourt_id: 1 }]);
    const success = runController(FoodMapController.readFoodMapMarkers);
    expect(success.res.status).toHaveBeenCalledWith(200);
    expect(success.res.json.mock.calls[0][0].data).toHaveLength(1);

    const databaseError = new Error('map failed');
    modelReply(FoodMapModel.selectFoodMapMarkers, databaseError, null);
    const failure = runController(FoodMapController.readFoodMapMarkers);
    expect(failure.next).toHaveBeenCalledWith(databaseError);
  });

  test('stall list forwards all filters and returns a count', () => {
    modelReply(FoodStallModel.selectStalls, null, {
      rows: [{ stall_id: 'stall_001' }],
    });
    const req = request({
      query: {
        search: 'rice',
        foodCourt: 'FC1',
        dietary: 'halal',
        status: 'open',
        foodType: 'Asian',
      },
    });
    const { res } = runController(FoodStallController.readStalls, req);
    expect(FoodStallModel.selectStalls.mock.calls[0][0]).toEqual(req.query);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      count: 1,
    });
  });

  test('stall list forwards database errors', () => {
    const databaseError = new Error('stalls failed');
    modelReply(FoodStallModel.selectStalls, databaseError, null);
    const { next } = runController(FoodStallController.readStalls);
    expect(next).toHaveBeenCalledWith(databaseError);
  });

  test('single stall supports success, no match and database error', () => {
    modelReply(FoodStallModel.selectStallById, null, {
      rows: [{ stall_id: 'stall_001' }],
    });
    const found = runController(
      FoodStallController.readStallById,
      request({ params: { stall_id: 'stall_001' } }),
    );
    expect(found.res.status).toHaveBeenCalledWith(200);

    modelReply(FoodStallModel.selectStallById, null, { rows: [] });
    const missing = runController(
      FoodStallController.readStallById,
      request({ params: { stall_id: 'stall_999' } }),
    );
    expect(missing.res.status).toHaveBeenCalledWith(404);

    const databaseError = new Error('stall failed');
    modelReply(FoodStallModel.selectStallById, databaseError, null);
    const failed = runController(FoodStallController.readStallById);
    expect(failed.next).toHaveBeenCalledWith(databaseError);
  });

  test('stall menu returns rows and forwards errors', () => {
    modelReply(FoodStallModel.selectMenuByStallId, null, {
      rows: [{ food_id: 1 }],
    });
    const success = runController(
      FoodStallController.readMenuByStallId,
      request({ params: { stall_id: 'stall_001' } }),
    );
    expect(success.res.json.mock.calls[0][0].count).toBe(1);

    const databaseError = new Error('menu failed');
    modelReply(FoodStallModel.selectMenuByStallId, databaseError, null);
    const failure = runController(FoodStallController.readMenuByStallId);
    expect(failure.next).toHaveBeenCalledWith(databaseError);
  });

  const menuBranches = [
    [{ search: 'rice' }, MenuItemModel.searchMenuItems],
    [{ category: 'Noodles' }, MenuItemModel.filterMenuItemsByCategory],
    [{ stallId: 'stall_001' }, MenuItemModel.filterMenuItemsByStallId],
    [{ available: 'true' }, MenuItemModel.filterMenuItemsByAvailability],
    [{ available: 'false' }, MenuItemModel.filterMenuItemsByAvailability],
    [{ popular: 'true' }, MenuItemModel.selectPopularMenuItems],
    [{ sort: 'price_asc' }, MenuItemModel.sortMenuItemsByPriceLow],
    [{ sort: 'price_desc' }, MenuItemModel.sortMenuItemsByPriceHigh],
    [{ sort: 'name_asc' }, MenuItemModel.sortMenuItemsByName],
    [{}, MenuItemModel.selectAllMenuItems],
  ];

  test.each(menuBranches)('menu list selects the correct model branch for %j', (query, model) => {
    modelReply(model, null, { rows: [{ food_id: 1 }] });
    const { res } = runController(MenuItemController.readMenuItems, request({ query }));
    expect(model).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: true,
      count: 1,
    });
  });

  test.each(menuBranches)('each menu list branch forwards model errors for %j', (query, model) => {
    const databaseError = new Error('branch failed');
    modelReply(model, databaseError, null);
    const { next } = runController(MenuItemController.readMenuItems, request({ query }));
    expect(next).toHaveBeenCalledWith(databaseError);
  });

  test('menu item id supports invalid, missing, success and database error outcomes', () => {
    const invalid = runController(
      MenuItemController.readMenuItemById,
      request({ params: { item_id: '' } }),
    );
    expect(invalid.res.status).toHaveBeenCalledWith(400);

    modelReply(MenuItemModel.selectMenuItemById, null, { rows: [] });
    const missing = runController(
      MenuItemController.readMenuItemById,
      request({ params: { food_id: '999' } }),
    );
    expect(missing.res.status).toHaveBeenCalledWith(404);

    modelReply(MenuItemModel.selectMenuItemById, null, {
      rows: [{ food_id: 1 }],
    });
    const found = runController(
      MenuItemController.readMenuItemById,
      request({ params: { item_id: 'item_001' } }),
    );
    expect(found.res.status).toHaveBeenCalledWith(200);

    const databaseError = new Error('item failed');
    modelReply(MenuItemModel.selectMenuItemById, databaseError, null);
    const failed = runController(
      MenuItemController.readMenuItemById,
      request({ params: { item_id: 'item_001' } }),
    );
    expect(failed.next).toHaveBeenCalledWith(databaseError);
  });
});

describe('Quiz controller', () => {
  const baseItem = {
    food_id: 1,
    item_name: 'Chicken rice',
    variation: 'Roasted',
    description: 'Warm comfort rice meal',
    price: 5,
    category: 'Rice',
    nutrition_level: 'Balanced',
    spice_level: 'Not spicy',
    dietary_tag: 'Halal',
    flavour_profile: 'Savoury',
    student_need: 'Filling',
    temperature_type: 'hot',
    menu_notes: 'Quick lunch',
    stall_name: 'Chicken Rice Corner',
    cuisine_type: 'Asian',
    halal: true,
    vegetarian: false,
    vegan: false,
    is_budget_friendly: true,
    is_quick_bite: true,
    is_student_favourite: true,
    is_popular: true,
    prep_time_minutes: 7,
    calories: 600,
    item_rating: 4.5,
    item_review_count: 50,
    order_count: 150,
  };

  function quizRun(query, items, method = 'GET') {
    modelReply(QuizModel.selectQuizMenuCandidates, null, items);
    const source = method === 'POST' ? { body: query } : { query };
    return runController(QuizController.getQuizRecommendations, request({ method, ...source }));
  }

  test('quiz options return data and forward model errors', () => {
    modelReply(QuizModel.selectQuizOptions, null, { categories: ['Rice'] });
    const success = runController(QuizController.readQuizOptions);
    expect(success.res.status).toHaveBeenCalledWith(200);

    const databaseError = new Error('options failed');
    modelReply(QuizModel.selectQuizOptions, databaseError, null);
    const failure = runController(QuizController.readQuizOptions);
    expect(failure.next).toHaveBeenCalledWith(databaseError);
  });

  test('invalid inputs fall back safely and limit is capped at twenty', () => {
    const { res } = quizRun(
      {
        budget: 'INVALID',
        time: 'INVALID',
        mood: 'INVALID',
        spice: 'INVALID',
        dietary: 'INVALID',
        temperature: 'INVALID',
        sort: 'INVALID',
        maxPrice: '-2',
        limit: '99',
        availableOnly: '0',
      },
      [baseItem],
    );
    const body = res.json.mock.calls[0][0];
    expect(body.filters).toMatchObject({
      budget: 'any',
      maxPrice: null,
      limit: 20,
      availableOnly: false,
    });
  });

  test('POST accepts alias fields, decimal numbers and explicit boolean values', () => {
    const { res } = quizRun(
      {
        food_court: 'FC1',
        max_price: '6.5',
        availableOnly: false,
        limit: '2',
      },
      [baseItem],
      'POST',
    );
    expect(res.json.mock.calls[0][0].filters).toMatchObject({
      foodCourt: 'FC1',
      maxPrice: 6.5,
      limit: 2,
      availableOnly: false,
    });
  });

  test('normalises any food-court choice to an unfiltered request', () => {
    const { res } = quizRun({ foodCourt: 'any' }, [baseItem]);
    expect(res.json.mock.calls[0][0].filters.foodCourt).toBe('all');
  });

  test.each([
    ['low', [4.5, 5.5, 8]],
    ['medium', [4.5, 6, 8]],
    ['high', [4, 6, 8]],
  ])('scores all %s budget ranges', (budget, prices) => {
    const items = prices.map((price, index) => ({
      ...baseItem,
      food_id: index + 1,
      price,
      is_budget_friendly: false,
      is_student_favourite: false,
      is_popular: false,
      item_review_count: 0,
      order_count: 0,
    }));
    const { res } = quizRun({ budget, limit: 10 }, items);
    const scores = res.json.mock.calls[0][0].data.map((item) => item.match_score);
    expect(scores).toHaveLength(3);
    expect(scores.every((score) => score >= 0)).toBe(true);
  });

  test.each([
    ['quick', [6, 10, 20]],
    ['normal', [10, 20]],
  ])('scores %s waiting-time boundaries', (time, prepTimes) => {
    const items = prepTimes.map((prepTime, index) => ({
      ...baseItem,
      food_id: index + 1,
      prep_time_minutes: prepTime,
      is_quick_bite: false,
    }));
    const { res } = quizRun({ time, limit: 10 }, items);
    expect(res.json.mock.calls[0][0].data).toHaveLength(prepTimes.length);
  });

  test.each(['comfort', 'healthy', 'filling', 'spicy', 'study', 'safe'])(
    'scores the %s mood using meaningful food attributes',
    (mood) => {
      const item = {
        ...baseItem,
        description: 'Healthy comfort soup with spicy curry, coffee and high protein',
        spice_level: mood === 'safe' ? 'Not spicy' : 'Spicy',
      };
      const { res } = quizRun({ mood }, [item]);
      expect(res.json.mock.calls[0][0].data[0].match_reasons.length).toBeGreaterThan(0);
    },
  );

  test.each([
    ['rice', 'Chicken rice bowl'],
    ['noodles', 'Spicy laksa noodles'],
    ['chicken', 'Chicken cutlet'],
    ['asian', 'Japanese curry bento'],
    ['western', 'Western cafe sandwich'],
    ['drink', 'Iced coffee drink'],
  ])('scores the %s craving using menu data', (craving, itemName) => {
    const { res } = quizRun({ craving }, [{ ...baseItem, item_name: itemName }]);
    expect(res.json.mock.calls[0][0].data[0].match_reasons).toContain(
      `Matches your ${craving} craving.`,
    );
  });

  test('penalises a meal that does not match the selected craving', () => {
    const { res } = quizRun({ craving: 'drink' }, [{ ...baseItem, item_name: 'Plain rice' }]);
    expect(res.json.mock.calls[0][0].data[0].match_reasons).toContain(
      'Does not strongly match your drink craving.',
    );
  });

  test.each([
    ['halal', { halal: true, dietary_tag: '' }],
    ['vegetarian', { vegetarian: true, dietary_tag: '' }],
    ['vegetarian', { vegetarian: false, dietary_tag: 'Vegetarian' }],
    ['vegan', { vegan: false, dietary_tag: '', category: 'Vegan bowls' }],
  ])('strictly matches the %s dietary preference', (dietary, override) => {
    const { res } = quizRun({ dietary }, [{ ...baseItem, ...override }]);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      matching_mode: 'strict',
      count: 1,
    });
  });

  test.each([
    ['not-spicy', { spice_level: 'Not spicy' }],
    ['mild', { spice_level: 'Mild' }],
    ['spicy', { spice_level: 'Very spicy' }],
  ])('strictly matches %s food', (spice, override) => {
    const { res } = quizRun({ spice }, [{ ...baseItem, ...override }]);
    expect(res.json.mock.calls[0][0].matching_mode).toBe('strict');
  });

  test('returns an empty result when no candidate matches the dietary choice', () => {
    const { res } = quizRun({ dietary: 'vegan', spice: 'spicy', temperature: 'cold' }, [
      { ...baseItem, halal: false, dietary_tag: 'None', category: 'Rice' },
    ]);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      matching_mode: 'none',
      strict_candidates: 0,
      total_candidates: 1,
      count: 0,
    });
  });

  test('relaxes spice or temperature only after keeping the dietary constraint', () => {
    const { res } = quizRun({ dietary: 'vegan', spice: 'spicy', temperature: 'cold' }, [
      { ...baseItem, food_id: 1, vegan: true, spice_level: 'Not spicy', temperature_type: 'hot' },
      { ...baseItem, food_id: 2, vegan: false, dietary_tag: 'Contains meat' },
    ]);
    const { matching_mode: mode, data } = res.json.mock.calls[0][0];
    expect(mode).toBe('fallback');
    expect(data.map((item) => item.food_id)).toEqual([1]);
    expect(data[0].match_reasons).not.toContain('Good spicy option.');
    expect(data[0].match_reasons).not.toContain('Matches your cold option preference.');
  });

  test.each([
    ['rating', 'item_rating'],
    ['price-low', 'price'],
    ['quick', 'prep_time_minutes'],
    ['popular', 'order_count'],
    ['best-match', 'match_score'],
  ])('sorts recommendations by %s', (sort, field) => {
    const first = {
      ...baseItem,
      food_id: 1,
      [field]: 1,
      is_student_favourite: false,
      is_popular: false,
      item_review_count: 0,
      order_count: 0,
    };
    const second = { ...baseItem, food_id: 2, [field]: 10 };
    const { res } = quizRun({ sort, limit: 2 }, [first, second]);
    const results = res.json.mock.calls[0][0].data;
    if (sort === 'price-low' || sort === 'quick') expect(results[0].food_id).toBe(1);
    else expect(results[0].food_id).toBe(2);
  });

  test('adds the general reason when no optional preference or rating data exists', () => {
    const emptyItem = Object.fromEntries(Object.keys(baseItem).map((key) => [key, null]));
    emptyItem.food_id = 9;
    const { res } = quizRun({}, [emptyItem]);
    expect(res.json.mock.calls[0][0].data[0].match_reasons).toContain(
      'Matches your general food preference.',
    );
  });

  test('forwards candidate query errors', () => {
    const databaseError = new Error('recommendation failed');
    modelReply(QuizModel.selectQuizMenuCandidates, databaseError, null);
    const { next } = runController(QuizController.getQuizRecommendations);
    expect(next).toHaveBeenCalledWith(databaseError);
  });
});

describe('Review controller', () => {
  test('review list normalises filters, returns data and forwards errors', () => {
    modelReply(ReviewModel.selectReviews, null, [{ review_id: 1 }]);
    const { res } = runController(
      ReviewController.readAllReviews,
      request({
        query: {
          search: ' rice ',
          tag: 'Cheap',
          foodCourt: 'FC1',
          minRating: '4',
          sort: 'DISH',
        },
      }),
    );
    expect(ReviewModel.selectReviews.mock.calls[0][0]).toEqual({
      search: 'rice',
      tag: 'Cheap',
      foodCourt: 'FC1',
      minRating: 4,
      ratingRange: '',
      sort: 'dish',
    });
    expect(res.json.mock.calls[0][0].count).toBe(1);

    const databaseError = new Error('list failed');
    modelReply(ReviewModel.selectReviews, databaseError, null);
    const failed = runController(ReviewController.readAllReviews);
    expect(failed.next).toHaveBeenCalledWith(databaseError);
  });

  test('review list rejects invalid rating/sort and accepts below-three range', () => {
    modelReply(ReviewModel.selectReviews, null, []);
    runController(
      ReviewController.readAllReviews,
      request({
        query: { minRating: '8', ratingRange: 'below3', sort: 'unknown' },
      }),
    );
    expect(ReviewModel.selectReviews.mock.calls[0][0]).toMatchObject({
      minRating: null,
      ratingRange: 'below3',
      sort: 'newest',
    });
  });

  test('food review lookup supports invalid id, success and error', () => {
    const invalid = runController(
      ReviewController.readReviewsByFoodId,
      request({ params: { food_id: 'nope' } }),
    );
    expect(invalid.res.status).toHaveBeenCalledWith(400);

    modelReply(ReviewModel.selectReviewsByFoodId, null, [{ review_id: 1 }]);
    const success = runController(
      ReviewController.readReviewsByFoodId,
      request({ params: { food_id: '2' } }),
    );
    expect(success.res.json.mock.calls[0][0]).toMatchObject({
      food_id: 2,
      count: 1,
    });

    const databaseError = new Error('lookup failed');
    modelReply(ReviewModel.selectReviewsByFoodId, databaseError, null);
    const failed = runController(
      ReviewController.readReviewsByFoodId,
      request({ params: { food_id: '2' } }),
    );
    expect(failed.next).toHaveBeenCalledWith(databaseError);
  });

  test('menu options normalise flags and sorting, with error forwarding', () => {
    modelReply(ReviewModel.selectReviewMenuOptions, null, [{ food_id: 1 }]);
    const { res } = runController(
      ReviewController.readReviewMenuOptions,
      request({
        query: {
          search: ' rice ',
          foodCourt: 'FC1',
          category: 'Rice',
          availableOnly: '1',
          sort: 'price-low',
        },
      }),
    );
    expect(ReviewModel.selectReviewMenuOptions.mock.calls[0][0]).toMatchObject({
      search: 'rice',
      availableOnly: true,
      sort: 'price-low',
    });
    expect(res.status).toHaveBeenCalledWith(200);

    const databaseError = new Error('menu options failed');
    modelReply(ReviewModel.selectReviewMenuOptions, databaseError, null);
    const failed = runController(ReviewController.readReviewMenuOptions);
    expect(failed.next).toHaveBeenCalledWith(databaseError);
  });

  test('filter options and summary support success and errors', () => {
    modelReply(ReviewModel.selectReviewFilterOptions, null, {
      tags: ['Cheap'],
    });
    expect(runController(ReviewController.readReviewFilterOptions).res.status).toHaveBeenCalledWith(
      200,
    );
    modelReply(ReviewModel.selectReviewSummary, null, { total_reviews: 3 });
    expect(runController(ReviewController.readReviewSummary).res.status).toHaveBeenCalledWith(200);

    const optionsError = new Error('filters failed');
    modelReply(ReviewModel.selectReviewFilterOptions, optionsError, null);
    expect(runController(ReviewController.readReviewFilterOptions).next).toHaveBeenCalledWith(
      optionsError,
    );
    const summaryError = new Error('summary failed');
    modelReply(ReviewModel.selectReviewSummary, summaryError, null);
    expect(runController(ReviewController.readReviewSummary).next).toHaveBeenCalledWith(
      summaryError,
    );
  });

  const invalidCreateBodies = [
    [{ food_id: 0 }, 'food_id'],
    [{ rating: 0 }, 'rating'],
    [{ taste_rating: 8 }, 'taste_rating'],
    [{ value_rating: -1 }, 'value_rating'],
    [{ portion_rating: 'bad' }, 'portion_rating'],
    [{ wait_time_rating: 6 }, 'wait_time_rating'],
    [{ review_text: 'too short' }, 'review_text'],
    [{ reviewer_name: 'x'.repeat(51) }, 'reviewer_name'],
    [{ review_text: 'x'.repeat(501) }, 'review_text'],
    [{ review_photo_url: `https://example.com/${'x'.repeat(501)}` }, 'review_photo_url'],
  ];

  test.each(invalidCreateBodies)(
    'create review rejects invalid %s data',
    (override, messagePart) => {
      const { res } = runController(
        ReviewController.createReview,
        request({ method: 'POST', body: validReview(override) }),
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].message).toContain(messagePart);
      expect(ReviewModel.selectMenuItemByFoodId).not.toHaveBeenCalled();
    },
  );

  test.each([
    [{ review_tags: 'Cheap, Worth it' }, ['Cheap', 'Worth it']],
    [{ review_tags: undefined, review_tag: 'Spicy' }, ['Spicy']],
    [{ review_tags: undefined, review_tag: '' }, ['General']],
  ])('create review accepts alternate tag formats', (override, expectedTags) => {
    modelReply(ReviewModel.selectMenuItemByFoodId, null, null);
    runController(
      ReviewController.createReview,
      request({ method: 'POST', body: validReview(override) }),
    );
    const menuLookupStarted = ReviewModel.selectMenuItemByFoodId.mock.calls[0][0];
    expect(menuLookupStarted).toBe(1);
    expect(ReviewModel.insertReview).not.toHaveBeenCalled();
    expect(expectedTags.length).toBeGreaterThan(0);
  });

  test('create review uses optional rating fallbacks and completes all connected updates', () => {
    modelReply(ReviewModel.selectMenuItemByFoodId, null, {
      food_id: 1,
      name: 'Chicken Rice',
      stall_id: 2,
      stall_name: 'Corner',
      foodcourt_id: 1,
      foodcourt_name: 'FC1',
    });
    modelReply(ReviewModel.insertReview, null, { review_id: 10, food_id: 1 });
    modelReply(ReviewModel.updateMenuReviewStats, null, { item_rating: 4.5 });
    modelReply(ReviewModel.updateStallReviewStatsByFoodId, null, {
      rating: 4.4,
    });
    modelReply(ReviewModel.selectReviewById, null, {
      review_id: 10,
      review_text: 'Full review',
    });

    const body = validReview({
      reviewer_name: '',
      taste_rating: '',
      value_rating: null,
      portion_rating: undefined,
      wait_time_rating: '',
      review_photo_url: '',
    });
    const { res } = runController(ReviewController.createReview, request({ method: 'POST', body }));
    const insertedData = ReviewModel.insertReview.mock.calls[0][0];
    expect(insertedData).toMatchObject({
      reviewer_name: 'Anonymous Student',
      rating: 4.5,
      taste_rating: 4.5,
      review_photo_url: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0].data.review.review_id).toBe(10);
  });

  test('create review returns inserted data when expanded lookup has no row', () => {
    modelReply(ReviewModel.selectMenuItemByFoodId, null, { food_id: 1 });
    modelReply(ReviewModel.insertReview, null, { review_id: 11, food_id: 1 });
    modelReply(ReviewModel.updateMenuReviewStats, null, {});
    modelReply(ReviewModel.updateStallReviewStatsByFoodId, null, {});
    modelReply(ReviewModel.selectReviewById, null, null);
    const { res } = runController(
      ReviewController.createReview,
      request({ method: 'POST', body: validReview() }),
    );
    expect(res.json.mock.calls[0][0].data.review.review_id).toBe(11);
  });

  test.each([
    ['menu lookup', ReviewModel.selectMenuItemByFoodId, []],
    ['insert', ReviewModel.insertReview, [[ReviewModel.selectMenuItemByFoodId, { food_id: 1 }]]],
    [
      'menu stats',
      ReviewModel.updateMenuReviewStats,
      [
        [ReviewModel.selectMenuItemByFoodId, { food_id: 1 }],
        [ReviewModel.insertReview, { review_id: 1 }],
      ],
    ],
    [
      'stall stats',
      ReviewModel.updateStallReviewStatsByFoodId,
      [
        [ReviewModel.selectMenuItemByFoodId, { food_id: 1 }],
        [ReviewModel.insertReview, { review_id: 1 }],
        [ReviewModel.updateMenuReviewStats, {}],
      ],
    ],
    [
      'full review lookup',
      ReviewModel.selectReviewById,
      [
        [ReviewModel.selectMenuItemByFoodId, { food_id: 1 }],
        [ReviewModel.insertReview, { review_id: 1 }],
        [ReviewModel.updateMenuReviewStats, {}],
        [ReviewModel.updateStallReviewStatsByFoodId, {}],
      ],
    ],
  ])('create review forwards a %s error', (name, failingModel, priorReplies) => {
    priorReplies.forEach(([model, data]) => modelReply(model, null, data));
    const databaseError = new Error(`${name} failed`);
    modelReply(failingModel, databaseError, null);
    const { next } = runController(
      ReviewController.createReview,
      request({ method: 'POST', body: validReview() }),
    );
    expect(next).toHaveBeenCalledWith(databaseError);
  });

  test('create review returns 404 when menu item does not exist', () => {
    modelReply(ReviewModel.selectMenuItemByFoodId, null, null);
    const { res } = runController(
      ReviewController.createReview,
      request({ method: 'POST', body: validReview() }),
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('helpful action handles invalid id, missing review, success and error', () => {
    const invalid = runController(
      ReviewController.addHelpfulToReview,
      request({ params: { review_id: 'nope' } }),
    );
    expect(invalid.res.status).toHaveBeenCalledWith(400);

    modelReply(ReviewModel.incrementHelpfulCount, null, null);
    const missing = runController(
      ReviewController.addHelpfulToReview,
      request({ params: { review_id: '9' } }),
    );
    expect(missing.res.status).toHaveBeenCalledWith(404);

    modelReply(ReviewModel.incrementHelpfulCount, null, {
      review_id: 1,
      helpful_count: 2,
    });
    const success = runController(
      ReviewController.addHelpfulToReview,
      request({ params: { review_id: '1' } }),
    );
    expect(success.res.status).toHaveBeenCalledWith(200);

    const databaseError = new Error('helpful failed');
    modelReply(ReviewModel.incrementHelpfulCount, databaseError, null);
    const failed = runController(
      ReviewController.addHelpfulToReview,
      request({ params: { review_id: '1' } }),
    );
    expect(failed.next).toHaveBeenCalledWith(databaseError);
  });
});

describe('Review admin controller', () => {
  test('admin list normalises filters and handles success/error', () => {
    modelReply(ReviewAdminModel.selectAdminReviews, null, [{ review_id: 1 }]);
    const { res } = runController(
      ReviewAdminController.readAdminReviews,
      request({ query: { search: ' rice ', rating: '4' } }),
    );
    expect(ReviewAdminModel.selectAdminReviews.mock.calls[0][0]).toEqual({
      search: 'rice',
      ratingFilter: '4',
    });
    expect(res.json.mock.calls[0][0].count).toBe(1);

    modelReply(ReviewAdminModel.selectAdminReviews, null, []);
    runController(
      ReviewAdminController.readAdminReviews,
      request({ query: { rating: 'invalid' } }),
    );
    expect(ReviewAdminModel.selectAdminReviews.mock.calls[1][0].ratingFilter).toBe('all');

    const databaseError = new Error('admin list failed');
    modelReply(ReviewAdminModel.selectAdminReviews, databaseError, null);
    expect(runController(ReviewAdminController.readAdminReviews).next).toHaveBeenCalledWith(
      databaseError,
    );
  });

  test('admin summary handles success and errors', () => {
    modelReply(ReviewAdminModel.selectAdminSummary, null, { total_reviews: 2 });
    expect(runController(ReviewAdminController.readAdminSummary).res.status).toHaveBeenCalledWith(
      200,
    );
    const databaseError = new Error('summary failed');
    modelReply(ReviewAdminModel.selectAdminSummary, databaseError, null);
    expect(runController(ReviewAdminController.readAdminSummary).next).toHaveBeenCalledWith(
      databaseError,
    );
  });

  const invalidAdminUpdates = [
    [{ rating: 0 }, 'rating'],
    [{ taste_rating: 9 }, 'taste_rating'],
    [{ value_rating: -1 }, 'value_rating'],
    [{ portion_rating: 'nope' }, 'portion_rating'],
    [{ wait_time_rating: 6 }, 'wait_time_rating'],
    [{ review_text: 'short' }, 'review_text'],
    [{ review_text: 'x'.repeat(501) }, 'review_text'],
    [{ review_photo_url: 'x'.repeat(501) }, 'review_photo_url'],
  ];

  test('admin update rejects an invalid review id', () => {
    const { res } = runController(
      ReviewAdminController.updateAdminReview,
      request({ params: { review_id: 'x' }, body: validAdminUpdate() }),
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test.each(invalidAdminUpdates)(
    'admin update rejects invalid %s data',
    (override, messagePart) => {
      const { res } = runController(
        ReviewAdminController.updateAdminReview,
        request({
          params: { review_id: '1' },
          body: validAdminUpdate(override),
        }),
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json.mock.calls[0][0].message).toContain(messagePart);
    },
  );

  test.each([
    [{ review_tags: 'Cheap, Spicy' }, ['Cheap', 'Spicy']],
    [{ review_tags: undefined, review_tag: 'Healthy' }, ['Healthy']],
    [{ review_tags: undefined, review_tag: '' }, ['General']],
  ])('admin update accepts alternate tags and defaults', (override, expectedTags) => {
    modelReply(ReviewAdminModel.updateAdminReview, null, null);
    runController(
      ReviewAdminController.updateAdminReview,
      request({
        params: { review_id: '1' },
        body: validAdminUpdate(override),
      }),
    );
    expect(ReviewAdminModel.updateAdminReview.mock.calls[0][1].review_tags).toEqual(expectedTags);
  });

  test('admin update completes connected rating recalculation', () => {
    modelReply(ReviewAdminModel.updateAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    modelReply(ReviewAdminModel.recalculateMenuStats, null, {
      food_id: 2,
      item_rating: 4.5,
    });
    modelReply(ReviewAdminModel.recalculateStallStatsByFoodId, null, {
      stall_id: 3,
      rating: 4.4,
    });
    modelReply(ReviewAdminModel.selectAdminReviewById, null, {
      review_id: 1,
      review_text: 'Updated',
    });
    const { res } = runController(
      ReviewAdminController.updateAdminReview,
      request({ params: { review_id: '1' }, body: validAdminUpdate() }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.updated_stats).toHaveProperty('menu_stats');
  });

  test('admin update handles missing row and errors from each connected stage', () => {
    modelReply(ReviewAdminModel.updateAdminReview, null, null);
    const missing = runController(
      ReviewAdminController.updateAdminReview,
      request({ params: { review_id: '1' }, body: validAdminUpdate() }),
    );
    expect(missing.res.status).toHaveBeenCalledWith(404);

    const updateError = new Error('update failed');
    modelReply(ReviewAdminModel.updateAdminReview, updateError, null);
    expect(
      runController(
        ReviewAdminController.updateAdminReview,
        request({ params: { review_id: '1' }, body: validAdminUpdate() }),
      ).next,
    ).toHaveBeenCalledWith(updateError);

    modelReply(ReviewAdminModel.updateAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    const menuError = new Error('menu recalculation failed');
    modelReply(ReviewAdminModel.recalculateMenuStats, menuError, null);
    expect(
      runController(
        ReviewAdminController.updateAdminReview,
        request({ params: { review_id: '1' }, body: validAdminUpdate() }),
      ).next,
    ).toHaveBeenCalledWith(menuError);

    modelReply(ReviewAdminModel.updateAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    modelReply(ReviewAdminModel.recalculateMenuStats, null, {});
    const stallError = new Error('stall recalculation failed');
    modelReply(ReviewAdminModel.recalculateStallStatsByFoodId, stallError, null);
    expect(
      runController(
        ReviewAdminController.updateAdminReview,
        request({ params: { review_id: '1' }, body: validAdminUpdate() }),
      ).next,
    ).toHaveBeenCalledWith(stallError);

    modelReply(ReviewAdminModel.updateAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    modelReply(ReviewAdminModel.recalculateMenuStats, null, {});
    modelReply(ReviewAdminModel.recalculateStallStatsByFoodId, null, {});
    const selectError = new Error('expanded lookup failed');
    modelReply(ReviewAdminModel.selectAdminReviewById, selectError, null);
    expect(
      runController(
        ReviewAdminController.updateAdminReview,
        request({ params: { review_id: '1' }, body: validAdminUpdate() }),
      ).next,
    ).toHaveBeenCalledWith(selectError);
  });

  test('admin delete covers invalid, missing, success and connected errors', () => {
    expect(
      runController(
        ReviewAdminController.deleteAdminReview,
        request({ params: { review_id: 'bad' } }),
      ).res.status,
    ).toHaveBeenCalledWith(400);

    modelReply(ReviewAdminModel.deleteAdminReview, null, null);
    expect(
      runController(
        ReviewAdminController.deleteAdminReview,
        request({ params: { review_id: '1' } }),
      ).res.status,
    ).toHaveBeenCalledWith(404);

    modelReply(ReviewAdminModel.deleteAdminReview, null, {
      review_id: 1,
      food_id: 2,
    });
    modelReply(ReviewAdminModel.recalculateMenuStats, null, {});
    modelReply(ReviewAdminModel.recalculateStallStatsByFoodId, null, {});
    expect(
      runController(
        ReviewAdminController.deleteAdminReview,
        request({ params: { review_id: '1' } }),
      ).res.status,
    ).toHaveBeenCalledWith(200);

    const deleteError = new Error('delete failed');
    modelReply(ReviewAdminModel.deleteAdminReview, deleteError, null);
    expect(
      runController(
        ReviewAdminController.deleteAdminReview,
        request({ params: { review_id: '1' } }),
      ).next,
    ).toHaveBeenCalledWith(deleteError);
  });

  test('admin helpful covers invalid, missing, success and database errors', () => {
    expect(
      runController(
        ReviewAdminController.markHelpfulAdminReview,
        request({ params: { review_id: 'bad' } }),
      ).res.status,
    ).toHaveBeenCalledWith(400);

    modelReply(ReviewAdminModel.incrementAdminHelpfulCount, null, null);
    expect(
      runController(
        ReviewAdminController.markHelpfulAdminReview,
        request({ params: { review_id: '1' } }),
      ).res.status,
    ).toHaveBeenCalledWith(404);

    modelReply(ReviewAdminModel.incrementAdminHelpfulCount, null, {
      review_id: 1,
      helpful_count: 3,
    });
    expect(
      runController(
        ReviewAdminController.markHelpfulAdminReview,
        request({ params: { review_id: '1' } }),
      ).res.status,
    ).toHaveBeenCalledWith(200);

    const databaseError = new Error('helpful failed');
    modelReply(ReviewAdminModel.incrementAdminHelpfulCount, databaseError, null);
    expect(
      runController(
        ReviewAdminController.markHelpfulAdminReview,
        request({ params: { review_id: '1' } }),
      ).next,
    ).toHaveBeenCalledWith(databaseError);
  });
});
