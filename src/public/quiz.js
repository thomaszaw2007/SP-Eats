const mealQuizForm = document.getElementById('mealQuizForm');
const resetQuizBtn = document.getElementById('resetQuizBtn');
const submitQuizBtn = document.getElementById('submitQuizBtn');

const quizFoodCourtSelect = document.getElementById('quizFoodCourtSelect');
const quizCategorySelect = document.getElementById('quizCategorySelect');
const quizDietarySelect = document.getElementById('quizDietarySelect');
const quizTemperatureSelect = document.getElementById('quizTemperatureSelect');
const quizMaxPriceInput = document.getElementById('quizMaxPriceInput');
const quizSortSelect = document.getElementById('quizSortSelect');

const quizResultCount = document.getElementById('quizResultCount');
const quizSelectedSummary = document.getElementById('quizSelectedSummary');
const quizResultsList = document.getElementById('quizResultsList');

const quizState = {
  budget: 'any',
  time: 'any',
  mood: 'any',
  spice: 'any',
};

window.addEventListener('DOMContentLoaded', () => {
  setupQuizEvents();
  loadQuizOptions();
});

function setupQuizEvents() {
  document.querySelectorAll('.quiz-choice').forEach((button) => {
    button.addEventListener('click', handleQuizChoiceClick);
  });

  if (mealQuizForm) {
    mealQuizForm.addEventListener('submit', handleQuizSubmit);
  }

  if (resetQuizBtn) {
    resetQuizBtn.addEventListener('click', resetQuiz);
  }

  if (quizResultsList) {
    quizResultsList.addEventListener('click', handleResultClick);
  }
}

function handleQuizChoiceClick(event) {
  const button = event.target.closest('.quiz-choice');

  if (!button) {
    return;
  }

  const field = button.dataset.field;
  const value = button.dataset.value;

  quizState[field] = value;

  document.querySelectorAll(`.quiz-choice[data-field="${field}"]`).forEach((choice) => {
    choice.classList.toggle('active', choice === button);
  });
}

function loadQuizOptions() {
  fetch('/api/quiz/options')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Quiz options API failed.');
      }

      return response.json();
    })
    .then((result) => {
      const options = result.data || {};

      populateFoodCourtOptions(options.food_courts || []);
      populateCategoryOptions(options.categories || []);
    })
    .catch((error) => {
      console.error('Error loading quiz options:', error);
    });
}

function populateFoodCourtOptions(foodCourts) {
  if (!quizFoodCourtSelect) {
    return;
  }

  quizFoodCourtSelect.innerHTML = `
    <option value="all">All Food Courts</option>
  `;

  foodCourts.forEach((foodCourt) => {
    quizFoodCourtSelect.innerHTML += `
      <option value="FC${foodCourt.foodcourt_id}">
        FC${foodCourt.foodcourt_id} - ${foodCourt.foodcourt_name}
      </option>
    `;
  });
}

function populateCategoryOptions(categories) {
  if (!quizCategorySelect) {
    return;
  }

  quizCategorySelect.innerHTML = `
    <option value="all">All Categories</option>
  `;

  categories.forEach((category) => {
    quizCategorySelect.innerHTML += `
      <option value="${category}">
        ${category}
      </option>
    `;
  });
}

function handleQuizSubmit(event) {
  event.preventDefault();

  const quizBody = buildQuizBody();

  setQuizLoading(true);
  updateSelectedSummary(quizBody);

  fetch('/api/quiz/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quizBody),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Recommendation API failed.');
      }

      return response.json();
    })
    .then((result) => {
      const recommendations = result.data || [];

      displayRecommendations(recommendations);
    })
    .catch((error) => {
      console.error('Error loading quiz recommendations:', error);
      showQuizError();
    })
    .finally(() => {
      setQuizLoading(false);
    });
}

function buildQuizBody() {
  const maxPriceValue = quizMaxPriceInput ? quizMaxPriceInput.value : '';

  const quizBody = {
    budget: quizState.budget,
    time: quizState.time,
    mood: quizState.mood,
    spice: quizState.spice,
    foodCourt: quizFoodCourtSelect ? quizFoodCourtSelect.value : 'all',
    category: quizCategorySelect ? quizCategorySelect.value : 'all',
    dietary: quizDietarySelect ? quizDietarySelect.value : 'any',
    temperature: quizTemperatureSelect ? quizTemperatureSelect.value : 'any',
    sort: quizSortSelect ? quizSortSelect.value : 'best-match',
    limit: 6,
    availableOnly: true,
  };

  if (maxPriceValue) {
    quizBody.maxPrice = Number(maxPriceValue);
  }

  return quizBody;
}

function updateSelectedSummary(quizBody) {
  if (!quizSelectedSummary) {
    return;
  }

  const summaryItems = [
    `Budget: ${formatOptionText(quizBody.budget)}`,
    `Time: ${formatOptionText(quizBody.time)}`,
    `Mood: ${formatOptionText(quizBody.mood)}`,
    `Spice: ${formatOptionText(quizBody.spice)}`,
    `Food Court: ${quizBody.foodCourt === 'all' ? 'All' : quizBody.foodCourt}`,
    `Dietary: ${formatOptionText(quizBody.dietary)}`,
  ];

  if (quizBody.maxPrice) {
    summaryItems.push(`Max Price: $${formatPrice(quizBody.maxPrice)}`);
  }

  quizSelectedSummary.innerHTML = summaryItems
    .map((item) => {
      return `<span>${item}</span>`;
    })
    .join('');
}

function displayRecommendations(recommendations) {
  if (!quizResultsList) {
    return;
  }

  if (quizResultCount) {
    quizResultCount.textContent = `${recommendations.length} matches`;
  }

  if (recommendations.length === 0) {
    quizResultsList.innerHTML = `
      <div class="quiz-empty-state">
        <h3>No matching meals found</h3>
        <p>Try using fewer filters or increasing your max price.</p>
      </div>
    `;
    return;
  }

  quizResultsList.innerHTML = recommendations
    .map((item, index) => {
      return `
        <article class="quiz-result-card" style="animation-delay: ${index * 0.04}s">
          <div class="quiz-result-rank">
            #${index + 1}
          </div>

          ${createResultImage(item)}

          <div class="quiz-result-content">
            <div class="quiz-result-top">
              <div>
                <h3>${item.item_name}</h3>
                <p>${item.stall_name} · FC${item.foodcourt_id}</p>
              </div>

              <div class="quiz-match-score">
                ${item.match_score}
                <span>match</span>
              </div>
            </div>

            <div class="quiz-result-meta">
              <span>$${formatPrice(item.price)}</span>
              <span>★ ${formatRating(item.item_rating)}</span>
              <span>${item.prep_time_minutes || 10} min</span>
              <span>${item.category}</span>
            </div>

            <p class="quiz-result-description">
              ${item.description || 'Campus meal option.'}
            </p>

            <div class="quiz-match-reasons">
              ${createMatchReasons(item.match_reasons)}
            </div>

            <div class="quiz-result-actions">
              <button
                class="quiz-view-menu-btn"
                type="button"
                data-stall-id="${item.stall_id}"
              >
                View Stall Menu →
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function createResultImage(item) {
  if (!item.image_url) {
    return `
      <div class="quiz-result-image quiz-result-image-placeholder">
        No image
      </div>
    `;
  }

  return `
    <img
      src="${item.image_url}"
      alt="${item.item_name}"
      class="quiz-result-image"
    />
  `;
}

function createMatchReasons(reasons) {
  const safeReasons = Array.isArray(reasons) && reasons.length > 0
    ? reasons
    : ['Recommended based on your quiz answers.'];

  return safeReasons
    .slice(0, 4)
    .map((reason) => {
      return `<span>${reason}</span>`;
    })
    .join('');
}

function handleResultClick(event) {
  const button = event.target.closest('.quiz-view-menu-btn');

  if (!button) {
    return;
  }

  const stallId = button.dataset.stallId;

  if (stallId) {
    window.location.href = `./stall-detail.html?stall_id=${stallId}`;
  }
}

function resetQuiz() {
  quizState.budget = 'any';
  quizState.time = 'any';
  quizState.mood = 'any';
  quizState.spice = 'any';

  document.querySelectorAll('.quiz-choice').forEach((button) => {
    const isDefault = button.dataset.value === 'any';

    button.classList.toggle('active', isDefault);
  });

  if (quizFoodCourtSelect) {
    quizFoodCourtSelect.value = 'all';
  }

  if (quizCategorySelect) {
    quizCategorySelect.value = 'all';
  }

  if (quizDietarySelect) {
    quizDietarySelect.value = 'any';
  }

  if (quizTemperatureSelect) {
    quizTemperatureSelect.value = 'any';
  }

  if (quizMaxPriceInput) {
    quizMaxPriceInput.value = '';
  }

  if (quizSortSelect) {
    quizSortSelect.value = 'best-match';
  }

  if (quizResultCount) {
    quizResultCount.textContent = 'Waiting for quiz...';
  }

  if (quizSelectedSummary) {
    quizSelectedSummary.textContent = 'Choose your preferences, then click Find My Meal.';
  }

  if (quizResultsList) {
    quizResultsList.innerHTML = `
      <div class="quiz-empty-state">
        <h3>No recommendations yet</h3>
        <p>Your matched meals will appear here.</p>
      </div>
    `;
  }
}

function setQuizLoading(isLoading) {
  if (!submitQuizBtn) {
    return;
  }

  submitQuizBtn.disabled = isLoading;
  submitQuizBtn.textContent = isLoading ? 'Finding...' : 'Find My Meal';

  if (quizResultsList && isLoading) {
    quizResultsList.innerHTML = `
      <div class="quiz-loading-state">
        Finding your best meal matches...
      </div>
    `;
  }
}

function showQuizError() {
  if (quizResultCount) {
    quizResultCount.textContent = 'Unable to load recommendations';
  }

  if (quizResultsList) {
    quizResultsList.innerHTML = `
      <div class="quiz-empty-state">
        <h3>Quiz backend unavailable</h3>
        <p>Please check that /api/quiz/recommendations is working.</p>
      </div>
    `;
  }
}

function formatOptionText(value) {
  return String(value || 'any')
    .replace('-', ' ')
    .replace(/\b\w/g, (letter) => {
      return letter.toUpperCase();
    });
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}

function formatPrice(price) {
  return Number(price || 0).toFixed(2);
}