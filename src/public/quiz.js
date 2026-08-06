const quizSection = document.getElementById('quizSection');
const resultSection = document.getElementById('resultSection');

const progressDots = document.getElementById('progressDots');
const currentQuestionNumber = document.getElementById('currentQuestionNumber');
const questionTitle = document.getElementById('questionTitle');
const questionSubtitle = document.getElementById('questionSubtitle');
const questionOptions = document.getElementById('questionOptions');
const backQuestionBtn = document.getElementById('backQuestionBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');

const foodPersonalityText = document.getElementById('foodPersonalityText');
const resultSubline = document.getElementById('resultSubline');
const mainRecommendation = document.getElementById('mainRecommendation');
const otherOptions = document.getElementById('otherOptions');
const loadedMealCount = document.getElementById('loadedMealCount');

const patternCards = document.getElementById('patternCards');

const favouriteSlider = document.getElementById('favouriteSlider');
const tryLaterSlider = document.getElementById('tryLaterSlider');
const favouriteCount = document.getElementById('favouriteCount');
const tryLaterCount = document.getElementById('tryLaterCount');

const FAVOURITE_KEY = 'spEatsFavouriteMeals';
const TRY_LATER_KEY = 'spEatsTryLaterMeals';

const LEGACY_FAVOURITE_KEYS = [
  'quickbiteFavouriteMeals',
  'qbqFavouriteMeals',
  'sqFavouriteMeals',
  'reviewFavouriteMeals',
  'quickbiteFavourites',
];

const LEGACY_TRY_LATER_KEYS = [
  'quickbiteTryLaterMeals',
  'qbqTryLaterMeals',
  'sqTryLaterMeals',
  'reviewTryLaterMeals',
  'quickbiteTryNextMeals',
];

const CLOSE_MATCH_COUNT = 3;

const questions = [
  {
    key: 'budget',
    title: 'What is your budget?',
    subtitle: 'Choose a price range that feels realistic for today.',
    options: [
      {
        label: 'Under $5',
        value: 'budget',
        detail: 'Best when you want to save money.',
      },
      {
        label: '$5-$7',
        value: 'standard',
        detail: 'Normal student lunch range.',
      },
      {
        label: 'Above $7',
        value: 'flexible',
        detail: 'Focus more on quality and review points.',
      },
    ],
  },
  {
    key: 'craving',
    title: 'What are you craving?',
    subtitle: 'Choose the closest food mood.',
    options: [
      {
        label: 'Rice meal',
        value: 'rice',
        detail: 'Rice bowls, chicken rice, curry rice, or don.',
      },
      {
        label: 'Noodles',
        value: 'noodles',
        detail: 'Ban mian, ramen, mee, or soup noodles.',
      },
      {
        label: 'Chicken',
        value: 'chicken',
        detail: 'Chicken dishes, cutlets, or katsu.',
      },
      {
        label: 'Korean or Japanese',
        value: 'asian',
        detail: 'Bibimbap, sushi, curry, bento, or don.',
      },
      {
        label: 'Western or sandwich',
        value: 'western',
        detail: 'Pasta, sandwich, toast, grill, or burger.',
      },
      {
        label: 'Drink or light bite',
        value: 'drink',
        detail: 'Cafe drinks, soup, or smaller options.',
      },
      {
        label: 'Anything',
        value: 'any',
        detail: 'Let SP Eats choose from all meals.',
      },
    ],
  },
  {
    key: 'time',
    title: 'How much time do you have?',
    subtitle: 'Choose based on your school schedule.',
    options: [
      {
        label: 'Rushing',
        value: 'rush',
        detail: 'I need something quick.',
      },
      {
        label: 'Normal break',
        value: 'normal',
        detail: 'I can wait a normal amount.',
      },
      {
        label: 'No rush',
        value: 'relaxed',
        detail: 'I want the best match.',
      },
    ],
  },
  {
    key: 'spice',
    title: 'How spicy?',
    subtitle: 'Choose your spice level for today.',
    options: [
      {
        label: 'Not spicy',
        value: 'none',
        detail: 'Safe and mild.',
      },
      {
        label: 'Mild',
        value: 'mild',
        detail: 'A little spice is okay.',
      },
      {
        label: 'Spicy',
        value: 'spicy',
        detail: 'I want stronger flavour.',
      },
      {
        label: 'Anything',
        value: 'any',
        detail: 'Spice does not matter.',
      },
    ],
  },
  {
    key: 'need',
    title: 'What do you need?',
    subtitle: 'Pick the student situation that fits you.',
    options: [
      {
        label: 'Filling meal',
        value: 'filling',
        detail: 'Keep me full for class.',
      },
      {
        label: 'Light meal',
        value: 'light',
        detail: 'Not too heavy.',
      },
      {
        label: 'High protein',
        value: 'protein',
        detail: 'Chicken, egg, fish, or protein-heavy meals.',
      },
      {
        label: 'Comfort food',
        value: 'comfort',
        detail: 'Safe and satisfying.',
      },
      {
        label: 'Lower sugar',
        value: 'lowSugar',
        detail: 'Avoid sweet choices.',
      },
      {
        label: 'No preference',
        value: 'any',
        detail: 'Just give me a good meal.',
      },
    ],
  },
  {
    key: 'foodCourt',
    title: 'Which food court?',
    subtitle: 'Choose a location or search all.',
    options: [
      {
        label: 'Any food court',
        value: 'any',
        detail: 'Search everywhere.',
      },
      {
        label: 'Food Court 1',
        value: '1',
        detail: 'FC1 only.',
      },
      {
        label: 'Food Court 2',
        value: '2',
        detail: 'FC2 only.',
      },
      {
        label: 'Food Court 3',
        value: '3',
        detail: 'FC3 only.',
      },
      {
        label: 'Food Court 4',
        value: '4',
        detail: 'FC4 only.',
      },
      {
        label: 'Food Court 5',
        value: '5',
        detail: 'FC5 only.',
      },
      {
        label: 'Food Court 6',
        value: '6',
        detail: 'FC6 only.',
      },
    ],
  },
  {
    key: 'priority',
    title: 'What matters most?',
    subtitle: 'Choose how SP Eats should rank your result.',
    options: [
      {
        label: 'Best match',
        value: 'match',
        detail: 'Balance all answers.',
      },
      {
        label: 'Highest rated',
        value: 'rating',
        detail: 'Use review points more.',
      },
      {
        label: 'Cheapest',
        value: 'price',
        detail: 'Prioritise lower price.',
      },
      {
        label: 'Popular',
        value: 'popular',
        detail: 'Use review count and order count.',
      },
    ],
  },
];

const answers = {};
let currentQuestionIndex = 0;
let allMeals = [];
let currentRecommendations = [];

let savedMeals = {
  favourite: [],
  tryLater: [],
};

window.addEventListener('DOMContentLoaded', () => {
  initialiseQuiz();
});

function initialiseQuiz() {
  questions.forEach((question) => {
    answers[question.key] = question.options[0].value;
  });

  setupEvents();
  syncSavedMealsFromStorage();
  renderQuestion();
  renderSavedMeals();
  renderDefaultPatternCards();
  loadedMealCount.textContent = 'Quiz ready';
}

function setupEvents() {
  questionOptions.addEventListener('click', handleOptionClick);
  backQuestionBtn.addEventListener('click', handleBackQuestion);
  nextQuestionBtn.addEventListener('click', handleNextQuestion);
  tryAgainBtn.addEventListener('click', restartQuiz);

  document.addEventListener('click', handlePageClick);

  window.addEventListener('focus', () => {
    syncSavedMealsFromStorage();
    renderSavedMeals();
  });

  window.addEventListener('storage', () => {
    syncSavedMealsFromStorage();
    renderSavedMeals();
  });

  window.addEventListener('quickbiteSavedMealsUpdated', () => {
    syncSavedMealsFromStorage();
    renderSavedMeals();
  });
}

async function loadMealsFromMenu() {
  try {
    loadedMealCount.textContent = 'Loading meals...';
    allMeals = await loadMealsFromPublicApis();

    loadedMealCount.textContent = `${allMeals.length} meals loaded`;
  } catch (error) {
    console.error('Unable to load menu meals:', error);
    loadedMealCount.textContent = '0 meals loaded';
  }
}

async function loadMealsFromPublicApis() {
  const stallResponse = await fetch('/api/stalls');
  const stallResult = await stallResponse.json();

  if (!stallResponse.ok) {
    throw new Error(stallResult.message || 'Unable to load stalls.');
  }

  const stalls = extractArray(stallResult);

  const menuGroups = await Promise.all(
    stalls.map(async (stall) => {
      const stallId = getStallApiId(stall);

      if (!stallId) {
        return [];
      }

      try {
        const menuResponse = await fetch(`/api/stalls/${stallId}/menu`);
        const menuResult = await menuResponse.json();

        if (!menuResponse.ok) {
          return [];
        }

        return extractArray(menuResult).map((item) => {
          return normaliseMeal(item, stall);
        });
      } catch (error) {
        console.error('Menu load failed:', stallId, error);
        return [];
      }
    }),
  );

  return menuGroups.flat().filter((meal) => {
    return meal.isAvailable;
  });
}

function extractArray(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result.data)) {
    return result.data;
  }

  if (Array.isArray(result.menu)) {
    return result.menu;
  }

  if (Array.isArray(result.items)) {
    return result.items;
  }

  if (Array.isArray(result.rows)) {
    return result.rows;
  }

  return [];
}

function getStallApiId(stall) {
  const rawId = stall.stall_id || stall.id || stall.stallId;

  if (!rawId) {
    return null;
  }

  if (String(rawId).startsWith('stall_')) {
    return String(Number(String(rawId).replace('stall_', '')));
  }

  return String(rawId);
}

function normaliseMeal(item, stall) {
  const stallId = item.stall_id || stall.stall_id || stall.id || '';

  const foodCourtId =
    item.foodcourt_id ||
    item.food_court_id ||
    stall.foodcourt_id ||
    parseFoodCourtId(
      item.foodcourt_name || item.food_court || stall.foodcourt_name || stall.food_court,
    );

  const itemId =
    item.food_id ||
    item.item_id ||
    item.id ||
    `${stallId}-${item.item_name || item.name || 'meal'}`;

  const availability = item.is_available ?? item.available ?? true;

  return {
    id: String(itemId),
    foodId: item.food_id || item.item_id || item.id || itemId,
    stallId,
    foodCourtId,
    name: item.item_name || item.name || item.food_name || 'Unnamed Meal',
    variation: item.variation || '',
    description: item.description || item.menu_notes || '',
    price: Number(item.price || 0),
    category: item.category || 'Meal',
    imageUrl: item.image_url || item.imageUrl || '',
    isAvailable:
      availability !== false &&
      availability !== 'false' &&
      availability !== 0 &&
      availability !== '0',
    isPopular: item.is_popular === true || item.is_popular === 'true',
    calories: Number(item.calories || 0),
    nutritionLevel: item.nutrition_level || '',
    spiceLevel: item.spice_level || '',
    portionSize: item.portion_size || '',
    dietaryTag: item.dietary_tag || '',
    mealType: item.meal_type || '',
    studentNeed: item.student_need || '',
    rating: Number(item.item_rating || item.rating || 0),
    reviewCount: Number(item.item_review_count || item.review_count || item.rating_count || 0),
    orderCount: Number(item.order_count || 0),
    stallName: item.stall_name || stall.stall_name || stall.name || 'Campus Stall',
    cuisineType: item.cuisine_type || stall.cuisine_type || '',
    foodCourtName:
      item.foodcourt_name ||
      item.food_court ||
      stall.foodcourt_name ||
      stall.food_court ||
      stall.foodcourt ||
      `Food Court ${foodCourtId || ''}`.trim(),
  };
}

function parseFoodCourtId(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function handleOptionClick(event) {
  const optionCard = event.target.closest('[data-option-value]');

  if (!optionCard) {
    return;
  }

  const question = questions[currentQuestionIndex];
  answers[question.key] = optionCard.dataset.optionValue;

  renderQuestion();
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  const selectedValue = answers[question.key];

  currentQuestionNumber.textContent = String(currentQuestionIndex + 1);
  questionTitle.textContent = question.title;
  questionSubtitle.textContent = question.subtitle;

  questionOptions.innerHTML = question.options
    .map((option) => {
      const isActive = option.value === selectedValue;

      return `
        <button
          class="qclean-option-btn ${isActive ? 'active' : ''}"
          type="button"
          data-option-value="${escapeHtml(option.value)}"
        >
          <strong>${escapeHtml(option.label)}</strong>
          <span>${escapeHtml(option.detail)}</span>
        </button>
      `;
    })
    .join('');

  progressDots.innerHTML = questions
    .map((_, index) => {
      return `<span class="${index <= currentQuestionIndex ? 'active' : ''}"></span>`;
    })
    .join('');

  backQuestionBtn.disabled = currentQuestionIndex === 0;
  nextQuestionBtn.textContent =
    currentQuestionIndex === questions.length - 1 ? 'Show Result' : 'Next';
}

function handleNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
    return;
  }

  showResult();
}

function handleBackQuestion() {
  if (currentQuestionIndex === 0) {
    return;
  }

  currentQuestionIndex -= 1;
  renderQuestion();
}

async function showResult() {
  nextQuestionBtn.disabled = true;
  nextQuestionBtn.textContent = 'Matching...';

  try {
    const recommendationResult = await loadQuizRecommendations();
    currentRecommendations = recommendationResult.recommendations;
    allMeals = currentRecommendations;
    loadedMealCount.textContent = `${recommendationResult.totalCandidates} meals checked`;
  } catch (error) {
    console.error('Quiz recommendation API failed, using the local fallback:', error);

    if (allMeals.length === 0) {
      await loadMealsFromMenu();
    }

    currentRecommendations = buildQuizRecommendations(allMeals);
  }

  nextQuestionBtn.disabled = false;
  nextQuestionBtn.textContent = 'Show Result';

  if (currentRecommendations.length === 0) {
    renderNoMealsFound();
    return;
  }

  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  renderResult();
  renderPatternCards();

  resultSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

async function loadQuizRecommendations() {
  const response = await fetch('/api/quiz/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildQuizApiPayload()),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to load quiz recommendations.');
  }

  const recommendations = extractArray(result).map((item) => {
    const meal = normaliseMeal(item, item);

    return {
      ...meal,
      matchPercent: Math.max(12, Math.min(98, Number(item.match_score || 0))),
      reasons: Array.isArray(item.match_reasons) ? item.match_reasons : [],
      studentTip: buildStudentTip(meal, Number(item.match_score || 0)),
    };
  });

  return {
    recommendations,
    totalCandidates: Number(result.total_candidates || recommendations.length),
  };
}

function buildQuizApiPayload() {
  const budgetMap = {
    budget: 'low',
    standard: 'medium',
    flexible: 'high',
  };
  const timeMap = {
    rush: 'quick',
    normal: 'normal',
    relaxed: 'any',
  };
  const spiceMap = {
    none: 'not-spicy',
    mild: 'mild',
    spicy: 'spicy',
    any: 'any',
  };
  const moodMap = {
    filling: 'filling',
    light: 'healthy',
    protein: 'filling',
    comfort: 'comfort',
    lowSugar: 'healthy',
    any: 'any',
  };
  const sortMap = {
    match: 'best-match',
    rating: 'rating',
    price: 'price-low',
    popular: 'popular',
  };

  return {
    budget: budgetMap[answers.budget] || 'any',
    craving: answers.craving || 'any',
    time: timeMap[answers.time] || 'any',
    mood: moodMap[answers.need] || 'any',
    spice: spiceMap[answers.spice] || 'any',
    foodCourt: answers.foodCourt === 'any' ? 'all' : answers.foodCourt || 'all',
    sort: sortMap[answers.priority] || 'best-match',
    availableOnly: true,
    limit: 8,
  };
}

function buildQuizRecommendations(meals) {
  return meals
    .map((meal) => {
      const result = scoreMeal(meal);

      return {
        ...meal,
        matchPercent: result.matchPercent,
        reasons: result.reasons,
        studentTip: result.studentTip,
      };
    })
    .sort((a, b) => {
      if (answers.priority === 'price') {
        return a.price - b.price || b.matchPercent - a.matchPercent;
      }

      if (answers.priority === 'rating') {
        return b.rating - a.rating || b.matchPercent - a.matchPercent;
      }

      if (answers.priority === 'popular') {
        const aPopular = Number(a.reviewCount || 0) + Number(a.orderCount || 0);
        const bPopular = Number(b.reviewCount || 0) + Number(b.orderCount || 0);

        return bPopular - aPopular || b.matchPercent - a.matchPercent;
      }

      return b.matchPercent - a.matchPercent || b.rating - a.rating;
    })
    .slice(0, 8);
}

function scoreMeal(meal) {
  let score = 32;
  const reasons = [];

  const text = [
    meal.name,
    meal.variation,
    meal.description,
    meal.category,
    meal.stallName,
    meal.cuisineType,
    meal.foodCourtName,
    meal.nutritionLevel,
    meal.spiceLevel,
    meal.portionSize,
    meal.dietaryTag,
    meal.mealType,
    meal.studentNeed,
  ]
    .join(' ')
    .toLowerCase();

  function add(points, reason) {
    score += points;

    if (reason && !reasons.includes(reason)) {
      reasons.push(reason);
    }
  }

  function subtract(points) {
    score -= points;
  }

  if (answers.budget === 'budget') {
    if (meal.price > 0 && meal.price < 5) {
      add(25, 'fits your under $5 budget');
    } else if (meal.price <= 6) {
      add(10, 'is close to your budget');
    } else {
      subtract(13);
    }
  }

  if (answers.budget === 'standard') {
    if (meal.price >= 5 && meal.price <= 7) {
      add(22, 'fits your $5-$7 budget');
    } else if (meal.price < 5) {
      add(10, 'is cheaper than your chosen range');
    }
  }

  if (answers.budget === 'flexible') {
    if (meal.rating >= 4.2) {
      add(16, 'has stronger review points');
    }

    if (meal.reviewCount >= 5) {
      add(9, 'has useful student review data');
    }
  }

  if (answers.craving !== 'any') {
    const words = getCravingWords(answers.craving);
    const match = words.some((word) => {
      return text.includes(word);
    });

    if (match) {
      add(25, `matches your ${getSelectedLabel('craving').toLowerCase()} preference`);
    } else {
      subtract(6);
    }
  }

  if (answers.time === 'rush') {
    if (
      text.includes('drink') ||
      text.includes('sandwich') ||
      text.includes('toast') ||
      text.includes('quick') ||
      meal.price <= 5
    ) {
      add(14, 'works well when you are rushing');
    } else {
      subtract(4);
    }
  }

  if (answers.time === 'normal') {
    add(8, 'fits a normal lunch break');
  }

  if (answers.time === 'relaxed' && meal.rating >= 4) {
    add(10, 'is worth choosing when you are not rushing');
  }

  if (answers.spice === 'none') {
    if (text.includes('not spicy') || text.includes('mild') || !text.includes('spicy')) {
      add(14, 'matches your low spice preference');
    } else {
      subtract(12);
    }
  }

  if (answers.spice === 'mild') {
    if (text.includes('mild') || text.includes('not spicy') || !text.includes('very spicy')) {
      add(12, 'keeps the spice level manageable');
    }
  }

  if (answers.spice === 'spicy') {
    if (text.includes('spicy') || text.includes('korean') || text.includes('curry')) {
      add(16, 'has the spice you want');
    }
  }

  if (answers.need === 'filling') {
    if (
      text.includes('rice') ||
      text.includes('noodle') ||
      text.includes('large') ||
      text.includes('regular') ||
      meal.calories >= 550
    ) {
      add(15, 'has a filling portion');
    }
  }

  if (answers.need === 'light') {
    if (
      text.includes('light') ||
      text.includes('drink') ||
      text.includes('sandwich') ||
      meal.calories <= 500
    ) {
      add(15, 'fits a light meal choice');
    }
  }

  if (answers.need === 'protein') {
    if (
      text.includes('protein') ||
      text.includes('chicken') ||
      text.includes('egg') ||
      text.includes('fish')
    ) {
      add(17, 'matches your high protein choice');
    }
  }

  if (answers.need === 'comfort') {
    if (
      text.includes('rice') ||
      text.includes('noodle') ||
      text.includes('soup') ||
      text.includes('comfort')
    ) {
      add(13, 'feels like comfort food');
    }
  }

  if (answers.need === 'lowSugar') {
    if (!text.includes('sweet') && !text.includes('dessert') && !text.includes('sugar')) {
      add(12, 'avoids sweet or dessert-heavy choices');
    } else {
      subtract(10);
    }
  }

  if (answers.foodCourt !== 'any') {
    if (String(meal.foodCourtId) === String(answers.foodCourt)) {
      add(18, `is located at ${getSelectedLabel('foodCourt')}`);
    } else {
      subtract(15);
    }
  }

  if (meal.isPopular) {
    add(8, 'is marked as popular');
  }

  if (meal.rating >= 4.5) {
    add(10, 'has very strong review points');
  } else if (meal.rating >= 4) {
    add(6, 'has good review points');
  }

  if (meal.reviewCount >= 10) {
    add(6, 'has multiple student reviews');
  }

  if (answers.priority === 'rating') {
    score += meal.rating * 4;
  }

  if (answers.priority === 'popular') {
    score += Math.min(14, (meal.reviewCount + meal.orderCount) / 7);
  }

  if (answers.priority === 'price' && meal.price > 0) {
    score += Math.max(0, 11 - meal.price);
  }

  return {
    matchPercent: Math.max(12, Math.min(98, Math.round(score))),
    reasons: reasons.slice(0, 3),
    studentTip: buildStudentTip(meal, score),
  };
}

function getCravingWords(craving) {
  const map = {
    rice: ['rice', 'don', 'bowl'],
    noodles: ['noodle', 'noodles', 'ban mian', 'ramen', 'mee', 'soup'],
    chicken: ['chicken', 'katsu', 'cutlet'],
    asian: ['korean', 'japanese', 'bento', 'curry', 'bibimbap', 'don', 'sushi'],
    western: ['western', 'sandwich', 'toast', 'pasta', 'grill', 'burger'],
    drink: ['drink', 'latte', 'tea', 'coffee', 'juice', 'smoothie', 'cafe'],
  };

  return map[craving] || [];
}

function buildStudentTip(meal, score) {
  if (score >= 80) {
    return 'Strong match for your current school-day situation.';
  }

  if (meal.price > 0 && meal.price <= 5) {
    return 'Good choice when you want something affordable before class.';
  }

  if (meal.rating >= 4.3) {
    return 'Good choice when you want something trusted by student reviews.';
  }

  return 'A decent option if you want to try something different today.';
}

function renderResult() {
  const topMeal = currentRecommendations[0];

  if (!topMeal) {
    renderNoMealsFound();
    return;
  }

  foodPersonalityText.textContent = getFoodPersonality();
  resultSubline.textContent = getPersonalityLine();
  loadedMealCount.textContent = `${allMeals.length} meals loaded`;

  renderMainRecommendation(topMeal);
  renderOtherOptions(currentRecommendations.slice(1, CLOSE_MATCH_COUNT + 1));
}

function renderMainRecommendation(meal) {
  const reasonText =
    meal.reasons && meal.reasons.length > 0 ? meal.reasons.join(', ') : 'matches your quiz choices';

  mainRecommendation.innerHTML = `
    <div class="qclean-main-image">
      ${renderMealImage(meal, 'large')}
    </div>

    <div class="qclean-main-content">
      <div class="qclean-main-top">
        <div>
          <h2>${escapeHtml(meal.name)}</h2>

          <div class="qclean-rating-row">
            <span class="qclean-stars">${renderStars(meal.rating)}</span>
            <strong>${formatRating(meal.rating)}</strong>
            <em>(${Number(meal.reviewCount || 0)})</em>
          </div>

          <p>${escapeHtml(meal.stallName)} - ${escapeHtml(meal.foodCourtName)}</p>
        </div>

        <span class="qclean-match">${formatPercent(meal.matchPercent)}</span>
      </div>

      <strong class="qclean-price">$${formatPrice(meal.price)}</strong>

      <div class="qclean-why-box">
        <strong>Why:</strong>
        <span>${escapeHtml(reasonText)}.</span>
      </div>

      <p class="qclean-tip">${escapeHtml(meal.studentTip)}</p>

      <div class="qclean-main-actions">
        <button type="button" data-save-action="favourite" data-meal-id="${escapeHtml(String(meal.id))}">
          Add Favourite
        </button>

        <button type="button" data-save-action="tryLater" data-meal-id="${escapeHtml(String(meal.id))}">
          Try Later
        </button>

        <a href="./stall-detail.html?stall_id=${encodeURIComponent(meal.stallId)}">
          Open Stall
        </a>
      </div>
    </div>
  `;
}

function renderOtherOptions(meals) {
  if (meals.length === 0) {
    otherOptions.innerHTML = `
      <div class="qclean-empty-state">
        No close matches found.
      </div>
    `;
    return;
  }

  otherOptions.innerHTML = meals
    .map((meal) => {
      return `
        <article class="qclean-option-card">
          <div class="qclean-option-image">
            ${renderMealImage(meal, 'small')}
          </div>

          <div class="qclean-option-body">
            <strong>${escapeHtml(meal.name)}</strong>
            <p>${escapeHtml(meal.stallName)}</p>

            <div class="qclean-option-meta">
              <span>$${formatPrice(meal.price)}</span>
              <em>${formatPercent(meal.matchPercent)}</em>
            </div>

            <div class="qclean-option-actions">
              <button type="button" data-save-action="favourite" data-meal-id="${escapeHtml(String(meal.id))}">
                Favourite
              </button>

              <button type="button" data-save-action="tryLater" data-meal-id="${escapeHtml(String(meal.id))}">
                Try Later
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderDefaultPatternCards() {
  const defaultCards = [
    {
      title: 'Take the quiz to unlock your match',
      text: 'Food mood',
    },
    {
      title: 'Saved meals stay visible',
      text: 'Favourite list',
    },
    {
      title: 'Try Later is always available',
      text: 'Planning list',
    },
    {
      title: 'Ratings come from reviews',
      text: 'Review points',
    },
    {
      title: 'Meals come from your menu',
      text: 'Live dishes',
    },
  ];

  renderPatternList(defaultCards);
}

function renderPatternCards() {
  const patternData = [
    {
      title: `${getSelectedLabel('craving')} choice`,
      text: 'Craving pattern',
    },
    {
      title: `${getSelectedLabel('budget')} budget`,
      text: 'Price pattern',
    },
    {
      title: `${getSelectedLabel('need')} need`,
      text: 'Meal purpose',
    },
    {
      title: `${getSelectedLabel('spice')} spice`,
      text: 'Taste pattern',
    },
    {
      title: `${getSelectedLabel('foodCourt')}`,
      text: 'Campus location',
    },
  ];

  renderPatternList(patternData);
}

function renderPatternList(cards) {
  patternCards.innerHTML = cards
    .map((card, index) => {
      return `
        <article class="qclean-pattern-card">
          <div class="qclean-pattern-mark">${index + 1}</div>
          <strong>${escapeHtml(card.title)}</strong>
          <span>${escapeHtml(card.text)}</span>
        </article>
      `;
    })
    .join('');
}

function restartQuiz() {
  currentQuestionIndex = 0;

  questions.forEach((question) => {
    answers[question.key] = question.options[0].value;
  });

  resultSection.classList.add('hidden');
  quizSection.classList.remove('hidden');

  renderQuestion();
  renderDefaultPatternCards();

  quizSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function handlePageClick(event) {
  const saveButton = event.target.closest('[data-save-action][data-meal-id]');

  if (saveButton) {
    const action = saveButton.dataset.saveAction;
    const mealId = saveButton.dataset.mealId;

    const meal = [...currentRecommendations, ...allMeals].find((item) => {
      return String(item.id) === String(mealId);
    });

    if (!meal) {
      return;
    }

    saveMealToStorage(action, meal);
    saveButton.textContent = 'Saved';
    renderSavedMeals();
    return;
  }

  const removeButton = event.target.closest('[data-remove-saved][data-meal-id]');

  if (removeButton) {
    removeSavedMeal(removeButton.dataset.removeSaved, removeButton.dataset.mealId);
    renderSavedMeals();
  }
}

function saveMealToStorage(type, meal) {
  const cleanMeal = normaliseSavedMeal(meal);
  const targetList = savedMeals[type];

  const exists = targetList.some((item) => {
    return String(item.id) === String(cleanMeal.id);
  });

  if (!exists) {
    targetList.unshift(cleanMeal);
  }

  persistSavedMealList(type);
  window.dispatchEvent(new Event('quickbiteSavedMealsUpdated'));
}

function removeSavedMeal(type, mealId) {
  const keyList = getSavedKeyList(type);

  keyList.forEach((key) => {
    removeSavedMealFromKey(key, mealId);
  });

  syncSavedMealsFromStorage();
  persistSavedMealList(type);

  window.dispatchEvent(new Event('quickbiteSavedMealsUpdated'));
}

function getSavedKeyList(type) {
  if (type === 'favourite') {
    return [FAVOURITE_KEY, ...LEGACY_FAVOURITE_KEYS];
  }

  return [TRY_LATER_KEY, ...LEGACY_TRY_LATER_KEYS];
}

function removeSavedMealFromKey(key, mealId) {
  const currentList = loadSavedArray(key);

  const updatedList = currentList.filter((meal) => {
    const normalisedMeal = normaliseSavedMeal(meal);

    return String(normalisedMeal.id) !== String(mealId);
  });

  localStorage.setItem(key, JSON.stringify(updatedList));
}

function persistSavedMealList(type) {
  const key = type === 'favourite' ? FAVOURITE_KEY : TRY_LATER_KEY;
  localStorage.setItem(key, JSON.stringify(savedMeals[type].slice(0, 24)));
}

function syncSavedMealsFromStorage() {
  savedMeals = {
    favourite: loadMergedSavedMeals(FAVOURITE_KEY, LEGACY_FAVOURITE_KEYS),
    tryLater: loadMergedSavedMeals(TRY_LATER_KEY, LEGACY_TRY_LATER_KEYS),
  };

  localStorage.setItem(FAVOURITE_KEY, JSON.stringify(savedMeals.favourite));
  localStorage.setItem(TRY_LATER_KEY, JSON.stringify(savedMeals.tryLater));
}

function loadMergedSavedMeals(mainKey, legacyKeys) {
  const collected = [];

  [mainKey, ...legacyKeys].forEach((key) => {
    loadSavedArray(key).forEach((meal) => {
      if (isProbablyMealSave(meal)) {
        collected.push(normaliseSavedMeal(meal));
      }
    });
  });

  const unique = [];

  collected.forEach((meal) => {
    const exists = unique.some((item) => {
      return String(item.id) === String(meal.id);
    });

    if (!exists && meal.id) {
      unique.push(meal);
    }
  });

  return unique.slice(0, 24);
}

function isProbablyMealSave(meal) {
  return Boolean(
    meal.foodId || meal.food_id || meal.item_id || meal.item_name || meal.food_name || meal.price,
  );
}

function loadSavedArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normaliseSavedMeal(meal) {
  return {
    id: String(meal.id || meal.foodId || meal.food_id || meal.item_id || meal.name || Date.now()),
    foodId: meal.foodId || meal.food_id || meal.item_id || meal.id || '',
    stallId: meal.stallId || meal.stall_id || '',
    foodCourtId: meal.foodCourtId || meal.foodcourt_id || '',
    name: meal.name || meal.item_name || meal.food_name || 'Saved Meal',
    stallName: meal.stallName || meal.stall_name || meal.stall || 'Campus Stall',
    foodCourtName: meal.foodCourtName || meal.foodcourt_name || meal.food_court || 'SP Food Court',
    imageUrl: meal.imageUrl || meal.image_url || '',
    price: Number(meal.price || 0),
    rating: Number(meal.rating || meal.item_rating || 0),
    reviewCount: Number(meal.reviewCount || meal.item_review_count || meal.review_count || 0),
    matchPercent: Number(meal.matchPercent || meal.match_score || 0),
    category: meal.category || 'Meal',
  };
}

function renderSavedMeals() {
  renderSavedList('favourite', favouriteSlider, favouriteCount);
  renderSavedList('tryLater', tryLaterSlider, tryLaterCount);
}

function renderSavedList(type, container, countElement) {
  const list = savedMeals[type] || [];

  countElement.textContent = `${list.length} saved`;
  container.classList.toggle('is-slider', list.length > 4);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="qclean-empty-state">
        No meals saved yet.
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .map((meal) => {
      return `
        <article class="qclean-saved-card">
          <div class="qclean-saved-image">
            ${renderMealImage(meal, 'small')}
          </div>

          <div class="qclean-saved-body">
            <strong>${escapeHtml(meal.name)}</strong>
            <p>${escapeHtml(meal.stallName)}</p>
            <span>$${formatPrice(meal.price)} - ${formatRating(meal.rating)} rating</span>
          </div>

          <div class="qclean-saved-actions">
            ${
              meal.stallId
                ? `<a href="./stall-detail.html?stall_id=${encodeURIComponent(meal.stallId)}">Open</a>`
                : ''
            }

            <button type="button" data-remove-saved="${type}" data-meal-id="${escapeHtml(String(meal.id))}">
              Remove
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderMealImage(meal, size) {
  const imageUrl = meal.imageUrl || meal.image_url || '';
  const name = meal.name || meal.item_name || 'Meal';
  const placeholderClass =
    size === 'large' ? 'qclean-image-placeholder large' : 'qclean-image-placeholder';

  const placeholder = `
    <div class="${placeholderClass}">
      ${escapeHtml(getInitials(name))}
    </div>
  `;

  if (!imageUrl) {
    return placeholder;
  }

  return `
    <img
      src="${escapeHtml(imageUrl)}"
      alt="${escapeHtml(name)}"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
    />
    <div class="${placeholderClass}" style="display:none;">
      ${escapeHtml(getInitials(name))}
    </div>
  `;
}

function renderNoMealsFound() {
  quizSection.classList.add('hidden');
  resultSection.classList.remove('hidden');

  loadedMealCount.textContent = '0 meals loaded';

  mainRecommendation.innerHTML = `
    <div class="qclean-empty-state">
      No available menu dishes were found. Test /api/stalls and /api/stalls/1/menu.
    </div>
  `;

  otherOptions.innerHTML = '';
}

function getFoodPersonality() {
  if (answers.budget === 'budget') {
    return 'The Budget Boss';
  }

  if (answers.craving === 'asian') {
    return 'The Bowl Hunter';
  }

  if (answers.need === 'protein') {
    return 'The Power Eater';
  }

  if (answers.time === 'rush') {
    return 'The Quick Grabber';
  }

  if (answers.spice === 'spicy') {
    return 'The Spice Seeker';
  }

  return 'The Adventurer';
}

function getPersonalityLine() {
  if (answers.budget === 'budget') {
    return 'You know how to eat well without overspending.';
  }

  if (answers.time === 'rush') {
    return 'You need something fast, simple, and practical between classes.';
  }

  if (answers.need === 'protein') {
    return 'You prefer meals that feel stronger and more filling.';
  }

  return 'Your match is based on real dish data, review points, and your quiz choices.';
}

function getSelectedLabel(key) {
  const question = questions.find((item) => {
    return item.key === key;
  });

  if (!question) {
    return 'Any';
  }

  const option = question.options.find((item) => {
    return item.value === answers[key];
  });

  return option ? option.label : 'Any';
}

function renderStars(rating) {
  const roundedRating = Math.round(Number(rating || 0));

  return [1, 2, 3, 4, 5]
    .map((starValue) => {
      return `<span class="${starValue <= roundedRating ? 'filled' : ''}">&#9733;</span>`;
    })
    .join('');
}

function getInitials(name) {
  return String(name || 'Meal')
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
