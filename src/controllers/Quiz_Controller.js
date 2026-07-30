const QuizModel = require('../models/Quiz_model');

function cleanText(value) {
  return String(value || '').trim();
}

function getLowerText(value) {
  return cleanText(value).toLowerCase();
}

function getNumber(value) {
  const number = Number(value);

  if (!number || number < 0) {
    return null;
  }

  return number;
}

function getAllowedValue(value, allowedValues, fallback) {
  const cleanedValue = getLowerText(value);

  if (allowedValues.includes(cleanedValue)) {
    return cleanedValue;
  }

  return fallback;
}

function getBooleanValue(value, fallback) {
  if (value === true || value === 'true' || value === '1') {
    return true;
  }

  if (value === false || value === 'false' || value === '0') {
    return false;
  }

  return fallback;
}

function getQuizFilters(req) {
  const source = req.method === 'POST' ? req.body : req.query;

  return {
    search: cleanText(source.search),
    foodCourt: cleanText(source.foodCourt || source.food_court || 'all'),
    category: cleanText(source.category || 'all'),
    budget: getAllowedValue(source.budget, ['any', 'low', 'medium', 'high'], 'any'),
    time: getAllowedValue(source.time, ['any', 'quick', 'normal'], 'any'),
    mood: getAllowedValue(
      source.mood,
      ['any', 'comfort', 'healthy', 'filling', 'spicy', 'study', 'safe'],
      'any'
    ),
    spice: getAllowedValue(
      source.spice,
      ['any', 'not-spicy', 'mild', 'spicy'],
      'any'
    ),
    dietary: getAllowedValue(
      source.dietary,
      ['any', 'halal', 'vegetarian', 'vegan'],
      'any'
    ),
    temperature: getAllowedValue(
      source.temperature,
      ['any', 'hot', 'cold'],
      'any'
    ),
    sort: getAllowedValue(
      source.sort,
      ['best-match', 'rating', 'price-low', 'quick', 'popular'],
      'best-match'
    ),
    maxPrice: getNumber(source.maxPrice || source.max_price),
    limit: Math.min(getNumber(source.limit) || 6, 20),
    availableOnly: getBooleanValue(source.availableOnly, true),
  };
}

function includesText(value, keyword) {
  return getLowerText(value).includes(keyword);
}

function addScore(result, points, reason) {
  result.match_score += points;

  if (reason) {
    result.match_reasons.push(reason);
  }
}

function applyBudgetScore(result, item, filters) {
  if (filters.budget === 'any') {
    return;
  }

  const price = Number(item.price || 0);

  if (filters.budget === 'low') {
    if (item.is_budget_friendly || price <= 4.5) {
      addScore(result, 24, 'Matches your budget-friendly choice.');
    } else if (price > 6) {
      addScore(result, -16, 'More expensive than your budget preference.');
    }
  }

  if (filters.budget === 'medium') {
    if (price <= 6.2) {
      addScore(result, 16, 'Fits a normal student meal budget.');
    } else {
      addScore(result, -8, 'Slightly above a normal meal budget.');
    }
  }

  if (filters.budget === 'high') {
    if (price >= 5) {
      addScore(result, 12, 'Good treat-yourself option.');
    }
  }
}

function applyTimeScore(result, item, filters) {
  if (filters.time === 'any') {
    return;
  }

  const prepTime = Number(item.prep_time_minutes || 10);

  if (filters.time === 'quick') {
    if (item.is_quick_bite || prepTime <= 8) {
      addScore(result, 24, 'Good quick-bite option.');
    } else if (prepTime >= 12) {
      addScore(result, -14, 'May take longer than your quick-bite preference.');
    }
  }

  if (filters.time === 'normal') {
    if (prepTime <= 12) {
      addScore(result, 10, 'Fits a normal waiting time.');
    }
  }
}

function applyMoodScore(result, item, filters) {
  if (filters.mood === 'any') {
    return;
  }

  const studentNeed = getLowerText(item.student_need);
  const flavour = getLowerText(item.flavour_profile);
  const category = getLowerText(item.category);
  const nutrition = getLowerText(item.nutrition_level);
  const name = getLowerText(item.item_name);

  if (filters.mood === 'comfort') {
    if (
      studentNeed.includes('comfort') ||
      name.includes('soup') ||
      name.includes('ban mian') ||
      name.includes('pasta')
    ) {
      addScore(result, 26, 'Matches your comfort food mood.');
    }
  }

  if (filters.mood === 'healthy') {
    if (
      studentNeed.includes('healthy') ||
      category.includes('vegetarian') ||
      category.includes('vegan') ||
      nutrition.includes('light')
    ) {
      addScore(result, 28, 'Matches your healthier meal preference.');
    }
  }

  if (filters.mood === 'filling') {
    if (
      studentNeed.includes('filling') ||
      nutrition.includes('filling') ||
      item.protein_level === 'High protein' ||
      item.portion_size === 'Large'
    ) {
      addScore(result, 26, 'Good filling meal option.');
    }
  }

  if (filters.mood === 'spicy') {
    if (flavour.includes('spicy') || includesText(item.spice_level, 'spicy')) {
      addScore(result, 28, 'Matches your spicy craving.');
    }
  }

  if (filters.mood === 'study') {
    if (
      category.includes('drink') ||
      studentNeed.includes('study') ||
      item.is_quick_bite
    ) {
      addScore(result, 24, 'Good for a study break.');
    }
  }

  if (filters.mood === 'safe') {
    if (
      Number(item.item_rating || 0) >= 4 &&
      !includesText(item.spice_level, 'spicy')
    ) {
      addScore(result, 22, 'Safe choice with a solid rating.');
    }
  }
}

function applySpiceScore(result, item, filters) {
  if (filters.spice === 'any') {
    return;
  }

  const spiceLevel = getLowerText(item.spice_level);
  const flavour = getLowerText(item.flavour_profile);

  if (filters.spice === 'not-spicy') {
    if (spiceLevel.includes('not spicy')) {
      addScore(result, 20, 'Matches your non-spicy preference.');
    } else if (spiceLevel.includes('spicy') || flavour.includes('spicy')) {
      addScore(result, -18, 'This may be spicier than you want.');
    }
  }

  if (filters.spice === 'mild') {
    if (spiceLevel.includes('mild') || spiceLevel.includes('medium')) {
      addScore(result, 18, 'Matches your mild spice preference.');
    }
  }

  if (filters.spice === 'spicy') {
    if (spiceLevel.includes('spicy') || flavour.includes('spicy')) {
      addScore(result, 22, 'Good spicy option.');
    }
  }
}

function applyDietaryScore(result, item, filters) {
  if (filters.dietary === 'any') {
    return;
  }

  const dietaryTag = getLowerText(item.dietary_tag);
  const category = getLowerText(item.category);

  if (filters.dietary === 'halal') {
    if (item.halal || dietaryTag.includes('halal')) {
      addScore(result, 26, 'Matches halal-friendly preference.');
    } else {
      addScore(result, -30, 'Does not match halal-friendly preference.');
    }
  }

  if (filters.dietary === 'vegetarian') {
    if (item.vegetarian || category.includes('vegetarian')) {
      addScore(result, 26, 'Matches vegetarian preference.');
    } else {
      addScore(result, -30, 'Does not match vegetarian preference.');
    }
  }

  if (filters.dietary === 'vegan') {
    if (item.vegan || category.includes('vegan') || dietaryTag.includes('vegan')) {
      addScore(result, 26, 'Matches vegan preference.');
    } else {
      addScore(result, -30, 'Does not match vegan preference.');
    }
  }
}

function applyTemperatureScore(result, item, filters) {
  if (filters.temperature === 'any') {
    return;
  }

  const temperature = getLowerText(item.temperature_type);

  if (temperature === filters.temperature) {
    addScore(result, 12, `Matches your ${filters.temperature} preference.`);
  }
}

function applyBaseQualityScore(result, item) {
  const rating = Number(item.item_rating || 0);
  const reviewCount = Number(item.item_review_count || 0);
  const orderCount = Number(item.order_count || 0);

  addScore(result, rating * 8, 'Uses actual menu rating data.');

  if (reviewCount >= 50) {
    addScore(result, 6, 'Has enough student review data.');
  }

  if (item.is_student_favourite || item.is_popular) {
    addScore(result, 8, 'Popular student choice.');
  }

  if (orderCount >= 120) {
    addScore(result, 5, 'Frequently ordered by students.');
  }
}

function scoreMenuItem(item, filters) {
  const result = {
    ...item,
    match_score: 0,
    match_reasons: [],
  };

  applyBaseQualityScore(result, item);
  applyBudgetScore(result, item, filters);
  applyTimeScore(result, item, filters);
  applyMoodScore(result, item, filters);
  applySpiceScore(result, item, filters);
  applyDietaryScore(result, item, filters);
  applyTemperatureScore(result, item, filters);

  result.match_score = Math.round(result.match_score);

  if (result.match_reasons.length === 0) {
    result.match_reasons.push('General campus food option.');
  }

  result.match_reasons = [...new Set(result.match_reasons)].slice(0, 5);

  return result;
}

function sortRecommendations(items, sortOption) {
  if (sortOption === 'rating') {
    return items.sort((a, b) => {
      return Number(b.item_rating) - Number(a.item_rating);
    });
  }

  if (sortOption === 'price-low') {
    return items.sort((a, b) => {
      return Number(a.price) - Number(b.price);
    });
  }

  if (sortOption === 'quick') {
    return items.sort((a, b) => {
      return Number(a.prep_time_minutes) - Number(b.prep_time_minutes);
    });
  }

  if (sortOption === 'popular') {
    return items.sort((a, b) => {
      return Number(b.order_count) - Number(a.order_count);
    });
  }

  return items.sort((a, b) => {
    return Number(b.match_score) - Number(a.match_score);
  });
}

module.exports.readQuizOptions = (req, res, next) => {
  QuizModel.selectQuizOptions((error, options) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      message: 'Quiz options retrieved successfully.',
      data: options,
    });
  });
};

module.exports.getQuizRecommendations = (req, res, next) => {
  const filters = getQuizFilters(req);

  QuizModel.selectQuizMenuCandidates(filters, (error, menuItems) => {
    if (error) {
      next(error);
      return;
    }

    const scoredItems = menuItems.map((item) => {
      return scoreMenuItem(item, filters);
    });

    const sortedItems = sortRecommendations(scoredItems, filters.sort);
    const recommendations = sortedItems.slice(0, filters.limit);

    res.status(200).json({
      message: 'Meal quiz recommendations retrieved successfully.',
      filters,
      count: recommendations.length,
      total_candidates: menuItems.length,
      data: recommendations,
    });
  });
};