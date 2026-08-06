const QuizModel = require('../models/Quiz_model');

function cleanText(value) {
  return String(value || '').trim();
}

function getLowerText(value) {
  return cleanText(value).toLowerCase();
}

function getNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number) || number < 0) {
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

function getFoodCourtValue(value) {
  const foodCourt = cleanText(value || 'all');

  if (['all', 'any'].includes(getLowerText(foodCourt))) {
    return 'all';
  }

  return foodCourt;
}

function getQuizFilters(req) {
  const source = req.method === 'POST' ? req.body : req.query;

  return {
    search: cleanText(source.search),
    foodCourt: getFoodCourtValue(source.foodCourt || source.food_court),
    category: cleanText(source.category || 'all'),
    budget: getAllowedValue(source.budget, ['any', 'low', 'medium', 'high'], 'any'),
    time: getAllowedValue(source.time, ['any', 'quick', 'normal'], 'any'),
    mood: getAllowedValue(
      source.mood,
      ['any', 'comfort', 'healthy', 'filling', 'spicy', 'study', 'safe'],
      'any',
    ),
    craving: getAllowedValue(
      source.craving,
      ['any', 'rice', 'noodles', 'chicken', 'asian', 'western', 'drink'],
      'any',
    ),
    spice: getAllowedValue(source.spice, ['any', 'not-spicy', 'mild', 'spicy'], 'any'),
    dietary: getAllowedValue(source.dietary, ['any', 'halal', 'vegetarian', 'vegan'], 'any'),
    temperature: getAllowedValue(source.temperature, ['any', 'hot', 'cold'], 'any'),
    sort: getAllowedValue(
      source.sort,
      ['best-match', 'rating', 'price-low', 'quick', 'popular'],
      'best-match',
    ),
    maxPrice: getNumber(source.maxPrice || source.max_price),
    limit: Math.min(getNumber(source.limit) || 3, 20),
    availableOnly: getBooleanValue(source.availableOnly, true),
  };
}

function includesAny(value, keywords) {
  const text = getLowerText(value);

  return keywords.some((keyword) => {
    return text.includes(keyword);
  });
}

function getCombinedFoodText(item) {
  return [
    item.item_name,
    item.variation,
    item.description,
    item.category,
    item.nutrition_level,
    item.spice_level,
    item.dietary_tag,
    item.flavour_profile,
    item.student_need,
    item.temperature_type,
    item.menu_notes,
    item.stall_name,
    item.cuisine_type,
  ]
    .map((value) => getLowerText(value))
    .join(' ');
}

function addScore(result, points, reason) {
  result.match_score += points;

  if (reason) {
    result.match_reasons.push(reason);
  }
}

function matchesDietaryPreference(item, dietary) {
  if (dietary === 'any') {
    return true;
  }

  const dietaryTag = getLowerText(item.dietary_tag);
  const category = getLowerText(item.category);

  if (dietary === 'halal') {
    return Boolean(item.halal) || dietaryTag.includes('halal');
  }

  if (dietary === 'vegetarian') {
    return (
      Boolean(item.vegetarian) ||
      dietaryTag.includes('vegetarian') ||
      category.includes('vegetarian')
    );
  }

  if (dietary === 'vegan') {
    return Boolean(item.vegan) || dietaryTag.includes('vegan') || category.includes('vegan');
  }

  return true;
}

function matchesSpicePreference(item, spice) {
  if (spice === 'any') {
    return true;
  }

  const spiceLevel = getLowerText(item.spice_level);
  const flavourProfile = getLowerText(item.flavour_profile);
  const combinedText = `${spiceLevel} ${flavourProfile}`;

  if (spice === 'not-spicy') {
    return !combinedText.includes('spicy') || combinedText.includes('not spicy');
  }

  if (spice === 'mild') {
    return includesAny(combinedText, ['mild', 'medium', 'not spicy']);
  }

  if (spice === 'spicy') {
    return combinedText.includes('spicy') && !combinedText.includes('not spicy');
  }

  return true;
}

function matchesTemperaturePreference(item, temperature) {
  if (temperature === 'any') {
    return true;
  }

  const temperatureType = getLowerText(item.temperature_type);

  return temperatureType === temperature;
}

function shouldKeepItem(item, filters) {
  if (!matchesDietaryPreference(item, filters.dietary)) {
    return false;
  }

  if (!matchesSpicePreference(item, filters.spice)) {
    return false;
  }

  if (!matchesTemperaturePreference(item, filters.temperature)) {
    return false;
  }

  return true;
}

function applyBudgetScore(result, item, filters) {
  if (filters.budget === 'any') {
    return;
  }

  const price = Number(item.price || 0);

  if (filters.budget === 'low') {
    if (price <= 5 || item.is_budget_friendly) {
      addScore(result, 40, 'Fits your under $5 budget.');
    } else if (price <= 6) {
      addScore(result, 10, 'Slightly above budget but still affordable.');
    } else {
      addScore(result, -45, 'Too expensive for your budget choice.');
    }
  }

  if (filters.budget === 'medium') {
    if (price >= 5 && price <= 7) {
      addScore(result, 38, 'Fits your $5–$7 budget range.');
    } else if (price < 5) {
      addScore(result, 16, 'Affordable option below your usual range.');
    } else {
      addScore(result, -22, 'Above your selected budget range.');
    }
  }

  if (filters.budget === 'high') {
    if (price >= 7) {
      addScore(result, 34, 'Matches your treat-yourself budget.');
    } else if (price >= 5) {
      addScore(result, 15, 'Still feels like a proper meal choice.');
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
      addScore(result, 38, 'Good quick-bite option.');
    } else if (prepTime <= 11) {
      addScore(result, 10, 'Still quite manageable for waiting time.');
    } else {
      addScore(result, -32, 'May take too long for a quick meal.');
    }
  }

  if (filters.time === 'normal') {
    if (prepTime <= 13) {
      addScore(result, 24, 'Fits a normal waiting time.');
    } else {
      addScore(result, -12, 'Might take longer than expected.');
    }
  }
}

function applyMoodScore(result, item, filters) {
  if (filters.mood === 'any') {
    return;
  }

  const foodText = getCombinedFoodText(item);

  if (filters.mood === 'comfort') {
    if (
      includesAny(foodText, [
        'comfort',
        'soup',
        'noodle',
        'pasta',
        'rice',
        'ban mian',
        'chicken',
        'warm',
      ])
    ) {
      addScore(result, 40, 'Matches your comfort food craving.');
    }
  }

  if (filters.mood === 'healthy') {
    if (
      includesAny(foodText, [
        'healthy',
        'light',
        'balanced',
        'vegetarian',
        'vegan',
        'salad',
        'low sugar',
        'low fat',
      ])
    ) {
      addScore(result, 42, 'Matches your healthier meal preference.');
    }
  }

  if (filters.mood === 'filling') {
    if (
      includesAny(foodText, [
        'filling',
        'large',
        'high protein',
        'rice',
        'noodle',
        'chicken',
        'beef',
        'protein',
      ]) ||
      Number(item.calories || 0) >= 550
    ) {
      addScore(result, 42, 'Good filling meal option.');
    }
  }

  if (filters.mood === 'spicy') {
    if (
      includesAny(foodText, ['spicy', 'kimchi', 'curry', 'mala', 'chilli', 'sambal']) &&
      !foodText.includes('not spicy')
    ) {
      addScore(result, 44, 'Matches your spicy craving.');
    }
  }

  if (filters.mood === 'study') {
    if (
      includesAny(foodText, [
        'drink',
        'coffee',
        'tea',
        'milk tea',
        'snack',
        'quick',
        'study',
        'light',
      ]) ||
      item.is_quick_bite
    ) {
      addScore(result, 38, 'Good for a study break.');
    }
  }

  if (filters.mood === 'safe') {
    if (
      Number(item.item_rating || 0) >= 4 &&
      Number(item.item_review_count || 0) >= 20 &&
      !getLowerText(item.spice_level).includes('spicy')
    ) {
      addScore(result, 38, 'Safe choice with strong student ratings.');
    }
  }
}

function applyCravingScore(result, item, filters) {
  if (filters.craving === 'any') {
    return;
  }

  const foodText = getCombinedFoodText(item);
  const cravingKeywords = {
    rice: ['rice', 'don', 'bowl', 'porridge'],
    noodles: ['noodle', 'noodles', 'ban mian', 'ramen', 'mee', 'udon', 'laksa'],
    chicken: ['chicken', 'katsu', 'cutlet', 'poultry'],
    asian: ['korean', 'japanese', 'hainanese', 'bento', 'bibimbap', 'curry', 'asian'],
    western: ['western', 'sandwich', 'toast', 'pasta', 'burger', 'wrap', 'cafe'],
    drink: ['drink', 'latte', 'tea', 'coffee', 'juice', 'smoothie', 'beverage'],
  };

  if (includesAny(foodText, cravingKeywords[filters.craving] || [])) {
    addScore(result, 36, `Matches your ${filters.craving} craving.`);
  } else {
    addScore(result, -8, `Does not strongly match your ${filters.craving} craving.`);
  }
}

function applySpiceScore(result, item, filters) {
  if (filters.spice === 'any') {
    return;
  }

  if (filters.spice === 'not-spicy') {
    addScore(result, 28, 'Matches your non-spicy preference.');
  }

  if (filters.spice === 'mild') {
    addScore(result, 24, 'Matches your mild spice preference.');
  }

  if (filters.spice === 'spicy') {
    addScore(result, 30, 'Good spicy option.');
  }
}

function applyDietaryScore(result, item, filters) {
  if (filters.dietary === 'any') {
    return;
  }

  if (filters.dietary === 'halal') {
    addScore(result, 34, 'Matches halal-friendly preference.');
  }

  if (filters.dietary === 'vegetarian') {
    addScore(result, 34, 'Matches vegetarian preference.');
  }

  if (filters.dietary === 'vegan') {
    addScore(result, 34, 'Matches vegan preference.');
  }
}

function applyTemperatureScore(result, item, filters) {
  if (filters.temperature === 'any') {
    return;
  }

  if (filters.temperature === 'hot') {
    addScore(result, 18, 'Matches your hot meal preference.');
  }

  if (filters.temperature === 'cold') {
    addScore(result, 18, 'Matches your cold option preference.');
  }
}

function applyQualityScore(result, item) {
  const rating = Number(item.item_rating || 0);
  const reviewCount = Number(item.item_review_count || 0);
  const orderCount = Number(item.order_count || 0);

  if (rating > 0) {
    addScore(result, rating * 5, 'Uses real menu rating data.');
  }

  if (reviewCount >= 40) {
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

  applyBudgetScore(result, item, filters);
  applyTimeScore(result, item, filters);
  applyCravingScore(result, item, filters);
  applyMoodScore(result, item, filters);
  applySpiceScore(result, item, filters);
  applyDietaryScore(result, item, filters);
  applyTemperatureScore(result, item, filters);
  applyQualityScore(result, item);

  result.match_score = Math.max(0, Math.round(result.match_score));

  result.match_reasons = [...new Set(result.match_reasons)].slice(0, 4);

  if (result.match_reasons.length === 0) {
    result.match_reasons.push('Matches your general food preference.');
  }

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

    const strictMatches = menuItems.filter((item) => {
      return shouldKeepItem(item, filters);
    });

    const itemsToScore = strictMatches.length > 0 ? strictMatches : menuItems;

    const scoredItems = itemsToScore.map((item) => {
      return scoreMenuItem(item, filters);
    });

    const sortedItems = sortRecommendations(scoredItems, filters.sort);
    const recommendations = sortedItems.slice(0, filters.limit);

    res.status(200).json({
      message: 'Meal quiz recommendations retrieved successfully.',
      filters,
      matching_mode: strictMatches.length > 0 ? 'strict' : 'fallback',
      count: recommendations.length,
      total_candidates: menuItems.length,
      strict_candidates: strictMatches.length,
      data: recommendations,
    });
  });
};
