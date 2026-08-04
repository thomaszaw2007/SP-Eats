// =========================================================
// SP QuickBite - Browse Stalls Page
// Handles: stall loading, search, filters, recently viewed, navigation
// =========================================================

// ---------- HTML ELEMENTS ----------
const stallContainer = document.getElementById('stallContainer');
const stallResultCount = document.getElementById('stallResultCount');

const stallSearchInput = document.getElementById('stallSearchInput');
const foodCourtFilter = document.getElementById('foodCourtFilter');
const cuisineFilter = document.getElementById('cuisineFilter');
const statusFilter = document.getElementById('statusFilter');
const budgetRange = document.getElementById('budgetRange');
const budgetValue = document.getElementById('budgetValue');
const clearStallFiltersBtn = document.getElementById('clearStallFiltersBtn');

const dietaryChipButtons = document.querySelectorAll('.sd-diet-chip');

const recentlyViewedSection = document.getElementById('recentlyViewedSection');
const recentlyViewedRow = document.getElementById('recentlyViewedRow');
const stallsThemeToggle = document.getElementById('stallsThemeToggle');

// ---------- PAGE STATE ----------
let allStallsData = [];
let selectedDietFilters = [];

const RECENTLY_VIEWED_KEY = 'recentlyViewedStalls';

// =========================================================
// PAGE LOAD
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
  setupStallPageEvents();
  applyFiltersFromUrl();
  loadStalls();
  displayRecentlyViewedStalls();
});

// =========================================================
// SETUP EVENTS
// =========================================================

function setupStallPageEvents() {
  const filterInputs = [
    stallSearchInput,
    foodCourtFilter,
    cuisineFilter,
    statusFilter,
    budgetRange,
  ];

  filterInputs.forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener('input', () => {
      updateBudgetText();
      filterAndDisplayStalls();
      updateFilterUrl();
    });

    input.addEventListener('change', () => {
      updateBudgetText();
      filterAndDisplayStalls();
      updateFilterUrl();
    });
  });

  dietaryChipButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedFilter = button.dataset.filter;

      if (selectedDietFilters.includes(selectedFilter)) {
        selectedDietFilters = selectedDietFilters.filter((filter) => {
          return filter !== selectedFilter;
        });
      } else {
        selectedDietFilters.push(selectedFilter);
      }

      updateDietButtons();
      filterAndDisplayStalls();
      updateFilterUrl();
    });
  });

  if (clearStallFiltersBtn) {
    clearStallFiltersBtn.addEventListener('click', clearStallFilters);
  }

  if (stallsThemeToggle) {
    stallsThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('home-dark-mode');
    });
  }

  updateBudgetText();
}

// =========================================================
// API
// =========================================================

function loadStalls() {
  fetch('/api/stalls')
    .then((response) => response.json())
    .then((result) => {
      allStallsData = normalizeStalls(result.data || []);
      filterAndDisplayStalls();
    })
    .catch((error) => {
      console.error('Error loading stalls:', error);
      showStallLoadError();
    });
}

function normalizeStalls(stalls) {
  return stalls.map((stall) => {
    const stallId = stall.stall_id || stall.raw_stall_id || stall.id;
    const stallName = stall.stall_name || stall.name || 'Unnamed Stall';

    const foodCourt =
      stall.food_court ||
      stall.food_court_name ||
      stall.foodcourt_name ||
      stall.foodcourt ||
      '';

    const cuisine = stall.cuisine_type || stall.cuisine || 'Campus Food';
    const rating = Number(stall.rating || stall.stall_rating || 0);
    const ratingCount = Number(stall.rating_count || stall.review_count || 0);
    const openingStatus = stall.opening_status || stall.status || 'open';

    const normalizedStall = {
      ...stall,
      stall_id: stallId,
      api_stall_id: getApiStallId(stallId),
      stall_name: stallName,
      food_court: foodCourt,
      cuisine_type: cuisine,
      rating,
      rating_count: ratingCount,
      opening_status: openingStatus,
      location_detail: stall.location_detail || stall.food_court_location || foodCourt,
      estimated_wait_time: stall.estimated_wait_time || stall.wait_time || '5-10 min',
      stall_description:
        stall.stall_description ||
        stall.description ||
        'Campus food stall serving student-friendly meals.',
      image_url: stall.image_url || null,
      is_halal: Boolean(stall.is_halal || stall.halal),
      is_vegetarian: Boolean(stall.is_vegetarian || stall.vegetarian),
      is_vegan: Boolean(stall.is_vegan || stall.vegan),
    };

    normalizedStall.estimated_budget = getEstimatedBudget(normalizedStall);

    return normalizedStall;
  });
}

// =========================================================
// FILTERING
// =========================================================

function filterAndDisplayStalls() {
  let filteredStalls = [...allStallsData];

  const searchValue = getInputValue(stallSearchInput).toLowerCase();
  const selectedFoodCourt = getInputValue(foodCourtFilter);
  const selectedCuisine = getInputValue(cuisineFilter);
  const selectedStatus = getInputValue(statusFilter);
  const selectedBudget = Number(getInputValue(budgetRange) || 10);

  if (searchValue) {
    const searchWords = searchValue
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    filteredStalls = filteredStalls.filter((stall) => {
      const searchableText = [
        stall.stall_name,
        stall.cuisine_type,
        stall.food_court,
        stall.location_detail,
        stall.stall_description,
        stall.is_halal ? 'halal' : '',
        stall.is_vegetarian ? 'vegetarian' : '',
        stall.is_vegan ? 'vegan' : '',
        stall.opening_status,
      ]
        .join(' ')
        .toLowerCase();

      return searchWords.every((word) => searchableText.includes(word));
    });
  }

  if (selectedFoodCourt !== 'all') {
    filteredStalls = filteredStalls.filter((stall) => {
      return stall.food_court === selectedFoodCourt;
    });
  }

  if (selectedCuisine !== 'all') {
    filteredStalls = filteredStalls.filter((stall) => {
      return stall.cuisine_type.toLowerCase().includes(selectedCuisine.toLowerCase());
    });
  }

  if (selectedStatus !== 'all') {
    filteredStalls = filteredStalls.filter((stall) => {
      return stall.opening_status === selectedStatus;
    });
  }

  if (selectedDietFilters.length > 0) {
    filteredStalls = filteredStalls.filter((stall) => {
      return selectedDietFilters.every((filter) => {
        return stallMatchesDietFilter(stall, filter);
      });
    });
  }

  filteredStalls = filteredStalls.filter((stall) => {
    return Number(stall.estimated_budget) <= selectedBudget;
  });

  displayStalls(filteredStalls);
}

function stallMatchesDietFilter(stall, filter) {
  const text = [
    stall.stall_name,
    stall.cuisine_type,
    stall.stall_description,
  ]
    .join(' ')
    .toLowerCase();

  if (filter === 'spicy') {
    return (
      text.includes('korean') ||
      text.includes('curry') ||
      text.includes('spicy') ||
      text.includes('mala') ||
      text.includes('laksa')
    );
  }

  if (filter === 'healthy') {
    return (
      stall.is_vegetarian ||
      stall.is_vegan ||
      text.includes('green') ||
      text.includes('soup') ||
      text.includes('subway')
    );
  }

  if (filter === 'high-protein') {
    return (
      text.includes('chicken') ||
      text.includes('beef') ||
      text.includes('fish') ||
      text.includes('salmon') ||
      text.includes('kfc')
    );
  }

  if (filter === 'light') {
    return (
      text.includes('soup') ||
      text.includes('salad') ||
      text.includes('vegetarian') ||
      text.includes('subway')
    );
  }

  if (filter === 'budget') {
    return Number(stall.estimated_budget) <= 5;
  }

  return true;
}

function getInputValue(input) {
  if (!input) {
    return 'all';
  }

  return input.value.trim();
}

function clearStallFilters() {
  if (stallSearchInput) {
    stallSearchInput.value = '';
  }

  if (foodCourtFilter) {
    foodCourtFilter.value = 'all';
  }

  if (cuisineFilter) {
    cuisineFilter.value = 'all';
  }

  if (statusFilter) {
    statusFilter.value = 'all';
  }

  if (budgetRange) {
    budgetRange.value = '10';
  }

  selectedDietFilters = [];

  updateBudgetText();
  updateDietButtons();
  filterAndDisplayStalls();
  updateFilterUrl();
}

function updateFilterUrl() {
  const queryParams = new URLSearchParams();

  const searchValue = getInputValue(stallSearchInput);
  const selectedFoodCourt = getInputValue(foodCourtFilter);
  const selectedCuisine = getInputValue(cuisineFilter);
  const selectedStatus = getInputValue(statusFilter);
  const selectedBudget = getInputValue(budgetRange);

  if (searchValue) {
    queryParams.set('search', searchValue);
  }

  if (selectedFoodCourt !== 'all') {
    queryParams.set('foodCourt', selectedFoodCourt);
  }

  if (selectedCuisine !== 'all') {
    queryParams.set('cuisine', selectedCuisine);
  }

  if (selectedStatus !== 'all') {
    queryParams.set('status', selectedStatus);
  }

  if (selectedDietFilters.length > 0) {
    queryParams.set('diet', selectedDietFilters.join(','));
  }

  if (selectedBudget !== '10') {
    queryParams.set('budget', selectedBudget);
  }

  const newUrl = queryParams.toString()
    ? `${window.location.pathname}?${queryParams.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}

function applyFiltersFromUrl() {
  const queryParams = new URLSearchParams(window.location.search);

  if (stallSearchInput && queryParams.get('search')) {
    stallSearchInput.value = queryParams.get('search');
  }

  if (foodCourtFilter && queryParams.get('foodCourt')) {
    foodCourtFilter.value = queryParams.get('foodCourt');
  }

  if (cuisineFilter && queryParams.get('cuisine')) {
    cuisineFilter.value = queryParams.get('cuisine');
  }

  if (statusFilter && queryParams.get('status')) {
    statusFilter.value = queryParams.get('status');
  }

  if (budgetRange && queryParams.get('budget')) {
    budgetRange.value = queryParams.get('budget');
  }

  if (queryParams.get('diet')) {
    selectedDietFilters = queryParams
      .get('diet')
      .split(',')
      .filter((filter) => filter.length > 0);
  }

  updateBudgetText();
  updateDietButtons();
}

function updateDietButtons() {
  dietaryChipButtons.forEach((button) => {
    const filter = button.dataset.filter;

    if (selectedDietFilters.includes(filter)) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

function updateBudgetText() {
  if (!budgetRange || !budgetValue) {
    return;
  }

  budgetValue.textContent = `$${Number(budgetRange.value).toFixed(2)}`;
}

// =========================================================
// DISPLAY STALLS
// =========================================================

function displayStalls(stalls) {
  if (!stallContainer) {
    return;
  }

  stallContainer.innerHTML = '';

  if (!stalls || stalls.length === 0) {
    if (stallResultCount) {
      stallResultCount.textContent = '0 stalls found';
    }

    stallContainer.innerHTML = `
      <div class="stalls-empty-state">
        <h3>No stalls found</h3>
        <p>Try changing your search keyword or filters.</p>
      </div>
    `;
    return;
  }

  if (stallResultCount) {
    stallResultCount.textContent = `${stalls.length} stall${stalls.length === 1 ? '' : 's'} found`;
  }

  stalls.forEach((stall) => {
    const stallCard = createStallCard(stall);
    stallContainer.appendChild(stallCard);
  });
}

function createStallCard(stall) {
  const card = document.createElement('article');
  card.className = 'sd-stall-card';

  if (stall.opening_status === 'closed') {
    card.classList.add('closed');
  }

  const isClosed = stall.opening_status === 'closed';

  card.innerHTML = `
    <div class="sd-stall-image-wrap">
      ${
        stall.image_url
          ? `<img
              src="${stall.image_url}"
              alt="${stall.stall_name}"
              class="sd-stall-image"
            />`
          : `<div class="sd-stall-image sd-stall-image-placeholder">
              <span>No image yet</span>
            </div>`
      }

      <span class="${isClosed ? 'sd-status-badge closed' : 'sd-status-badge open'}">
        ${isClosed ? 'Closed' : 'Open'}
      </span>
    </div>

    <div class="sd-stall-body">
      <h3>${stall.stall_name}</h3>

      <p class="sd-cuisine-text">${stall.cuisine_type}</p>

      <div class="sd-rating-row">
        <span class="sd-stars">★★★★★</span>
        <strong>${formatRating(stall.rating)}</strong>
        <span>(${stall.rating_count})</span>
      </div>

      <p class="sd-location-text">
        ${formatFoodCourtLabel(stall)}
      </p>

      <div class="sd-card-meta-row">
        <span class="${getWaitClass(stall.estimated_wait_time)}">
          ● ${stall.estimated_wait_time || '5-10 min'}
        </span>
      </div>

      <button class="sd-view-menu-btn" type="button">
        View Menu
      </button>
    </div>
  `;

  card.addEventListener('click', () => {
    goToMenu(stall.stall_id);
  });

  const viewMenuButton = card.querySelector('.sd-view-menu-btn');
  viewMenuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    goToMenu(stall.stall_id);
  });

  return card;
}

function showStallLoadError() {
  if (stallResultCount) {
    stallResultCount.textContent = 'Unable to load stalls.';
  }

  if (stallContainer) {
    stallContainer.innerHTML = `
      <div class="stalls-empty-state">
        <h3>Unable to load stalls</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

// =========================================================
// RECENTLY VIEWED STALLS
// =========================================================

function displayRecentlyViewedStalls() {
  if (!recentlyViewedSection || !recentlyViewedRow) {
    return;
  }

  const savedData = localStorage.getItem(RECENTLY_VIEWED_KEY);

  if (!savedData) {
    recentlyViewedSection.classList.add('hidden');
    return;
  }

  let recentlyViewed = [];

  try {
    recentlyViewed = JSON.parse(savedData);
  } catch (error) {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    recentlyViewedSection.classList.add('hidden');
    return;
  }

  if (!recentlyViewed || recentlyViewed.length === 0) {
    recentlyViewedSection.classList.add('hidden');
    return;
  }

  recentlyViewedSection.classList.remove('hidden');
  recentlyViewedRow.innerHTML = '';

  recentlyViewed.slice(0, 4).forEach((stall) => {
    const normalizedStall = normalizeStalls([stall])[0];
    const recentCard = createRecentStallCard(normalizedStall);

    recentlyViewedRow.appendChild(recentCard);
  });
}

function createRecentStallCard(stall) {
  const card = document.createElement('article');
  card.className = 'sd-recent-stall-card';

  card.innerHTML = `
    <h3>${stall.stall_name}</h3>
    <p>${stall.cuisine_type}</p>
  `;

  card.addEventListener('click', () => {
    goToMenu(stall.stall_id);
  });

  return card;
}

// =========================================================
// NAVIGATION + HELPERS
// =========================================================

function goToMenu(stallId) {
  window.location.href = './stall-detail.html?stall_id=' + encodeURIComponent(stallId);
}

function getApiStallId(id) {
  if (!id) {
    return '';
  }

  const textId = String(id);

  if (textId.startsWith('stall_')) {
    return String(Number(textId.replace('stall_', '')));
  }

  return textId;
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}

function formatFoodCourtLabel(stall) {
  const foodCourt = stall.food_court || 'Food Court';
  const shortName = foodCourt.replace('Food Court ', 'FC');

  if (!stall.location_detail || stall.location_detail === foodCourt) {
    return shortName;
  }

  return `${shortName} — ${stall.location_detail}`;
}

function getEstimatedBudget(stall) {
  const text = [stall.stall_name, stall.cuisine_type]
    .join(' ')
    .toLowerCase();

  if (text.includes('chicken rice')) {
    return 4.5;
  }

  if (text.includes('noodle') || text.includes('soup')) {
    return 5;
  }

  if (text.includes('vegetarian') || text.includes('green')) {
    return 5.5;
  }

  if (text.includes('korean') || text.includes('japanese')) {
    return 6.5;
  }

  if (text.includes('subway') || text.includes('kfc') || text.includes('western')) {
    return 7.5;
  }

  return 6;
}

function getWaitClass(waitTime) {
  const numberMatch = String(waitTime || '').match(/\d+/);
  const waitNumber = numberMatch ? Number(numberMatch[0]) : 10;

  if (waitNumber <= 5) {
    return 'sd-wait-fast';
  }

  if (waitNumber <= 8) {
    return 'sd-wait-medium';
  }

  return 'sd-wait-long';
}