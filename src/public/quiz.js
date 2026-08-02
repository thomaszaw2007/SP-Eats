const quizProgressDots = document.getElementById('quizProgressDots');
const quizStepText = document.getElementById('quizStepText');
const quizQuestionTitle = document.getElementById('quizQuestionTitle');
const quizAnswerList = document.getElementById('quizAnswerList');
const quizBackBtn = document.getElementById('quizBackBtn');
const quizRestartBtn = document.getElementById('quizRestartBtn');

const quizPatternCards = document.getElementById('quizPatternCards');
const quizRecommendationsGrid = document.getElementById('quizRecommendationsGrid');
const quizResultCount = document.getElementById('quizResultCount');

let currentQuestionIndex = 0;
let quizCompleted = false;
let foodCourtOptions = [
  {
    label: 'Any Food Court',
    value: 'all',
  },
];

const quizState = {
  budget: 'any',
  time: 'any',
  mood: 'any',
  spice: 'any',
  dietary: 'any',
  foodCourt: 'all',
  temperature: 'any',
  maxPrice: null,
};

const selectedLabels = {
  budget: 'Any Budget',
  time: 'Any Time',
  mood: 'Anything',
  spice: 'Any Spice',
  dietary: 'Any Dietary',
  foodCourt: 'All Food Courts',
  temperature: 'Any Temperature',
};

window.addEventListener('DOMContentLoaded', () => {
  setupQuizEvents();
  renderQuestion();
  renderPatternCards();
  loadQuizOptions();
  loadRecommendations();
});

function setupQuizEvents() {
  if (quizAnswerList) {
    quizAnswerList.addEventListener('click', handleAnswerClick);
  }

  if (quizBackBtn) {
    quizBackBtn.addEventListener('click', goBackQuestion);
  }

  if (quizRestartBtn) {
    quizRestartBtn.addEventListener('click', restartQuiz);
  }

  if (quizRecommendationsGrid) {
    quizRecommendationsGrid.addEventListener('click', handleRecommendationClick);
    quizRecommendationsGrid.addEventListener('error', handleRecommendationImageError, true);
  }
}

function getQuestions() {
  return [
    {
      field: 'budget',
      title: 'What is your budget?',
      options: [
        {
          label: 'Under $5',
          value: 'low',
          maxPrice: 5,
        },
        {
          label: '$5–$7',
          value: 'medium',
          maxPrice: 7,
        },
        {
          label: 'Above $7',
          value: 'high',
          maxPrice: null,
        },
      ],
    },
    {
      field: 'time',
      title: 'How fast do you need your food?',
      options: [
        {
          label: 'Quick bite',
          value: 'quick',
        },
        {
          label: 'Normal wait',
          value: 'normal',
        },
        {
          label: 'No rush',
          value: 'any',
        },
      ],
    },
    {
      field: 'mood',
      title: 'What are you craving?',
      options: [
        {
          label: 'Comfort food',
          value: 'comfort',
        },
        {
          label: 'Healthy choice',
          value: 'healthy',
        },
        {
          label: 'Filling meal',
          value: 'filling',
        },
        {
          label: 'Spicy craving',
          value: 'spicy',
        },
        {
          label: 'Study break',
          value: 'study',
        },
        {
          label: 'Safe choice',
          value: 'safe',
        },
      ],
    },
    {
      field: 'spice',
      title: 'How spicy do you want it?',
      options: [
        {
          label: 'Not spicy',
          value: 'not-spicy',
        },
        {
          label: 'Mild / medium',
          value: 'mild',
        },
        {
          label: 'Spicy',
          value: 'spicy',
        },
        {
          label: 'Anything',
          value: 'any',
        },
      ],
    },
    {
      field: 'dietary',
      title: 'Any dietary preference?',
      options: [
        {
          label: 'Any dietary',
          value: 'any',
        },
        {
          label: 'Halal-friendly',
          value: 'halal',
        },
        {
          label: 'Vegetarian',
          value: 'vegetarian',
        },
        {
          label: 'Vegan',
          value: 'vegan',
        },
      ],
    },
    {
      field: 'foodCourt',
      title: 'Which food court are you near?',
      options: foodCourtOptions,
    },
    {
      field: 'temperature',
      title: 'Hot meal or cold option?',
      options: [
        {
          label: 'Hot meal',
          value: 'hot',
        },
        {
          label: 'Cold drink / cold option',
          value: 'cold',
        },
        {
          label: 'Anything',
          value: 'any',
        },
      ],
    },
  ];
}

function loadQuizOptions() {
  fetch('/api/quiz/options')
    .then((response) => response.json())
    .then((result) => {
      const options = result.data || {};
      const foodCourts = options.food_courts || [];

      foodCourtOptions = [
        {
          label: 'Any Food Court',
          value: 'all',
        },
        ...foodCourts.map((foodCourt) => {
          return {
            label: `FC${foodCourt.foodcourt_id} - ${foodCourt.foodcourt_name}`,
            value: `FC${foodCourt.foodcourt_id}`,
          };
        }),
      ];

      renderQuestion();
    })
    .catch((error) => {
      console.error('Error loading quiz options:', error);
    });
}

function renderQuestion() {
  const questions = getQuestions();
  const question = questions[currentQuestionIndex];

  renderProgressDots();

  if (quizCompleted) {
    quizStepText.textContent = 'Done';
    quizQuestionTitle.textContent = 'Your food matches are ready';

    quizAnswerList.innerHTML = `
      <button class="decision-answer-option" type="button" data-action="restart">
        Retake Quiz
      </button>
    `;

    quizBackBtn.style.display = 'inline-flex';
    return;
  }

  quizStepText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  quizQuestionTitle.textContent = question.title;

  quizAnswerList.innerHTML = question.options
    .map((option, index) => {
      return `
        <button
          class="decision-answer-option"
          type="button"
          data-option-index="${index}"
        >
          ${escapeHtml(option.label)}
        </button>
      `;
    })
    .join('');

  quizBackBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-flex';
}

function renderProgressDots() {
  const questions = getQuestions();

  quizProgressDots.innerHTML = questions
    .map((question, index) => {
      let dotClass = '';

      if (index === currentQuestionIndex && !quizCompleted) {
        dotClass = 'active';
      }

      if (index < currentQuestionIndex || quizCompleted) {
        dotClass = 'done';
      }

      return `<span class="${dotClass}"></span>`;
    })
    .join('');
}

function handleAnswerClick(event) {
  const restartButton = event.target.closest('[data-action="restart"]');

  if (restartButton) {
    restartQuiz();
    return;
  }

  const button = event.target.closest('.decision-answer-option');

  if (!button) {
    return;
  }

  const questions = getQuestions();
  const question = questions[currentQuestionIndex];
  const optionIndex = Number(button.dataset.optionIndex);
  const selectedOption = question.options[optionIndex];

  if (!selectedOption) {
    return;
  }

  quizState[question.field] = selectedOption.value;
  selectedLabels[question.field] = selectedOption.label;

  if (question.field === 'budget') {
    quizState.maxPrice = selectedOption.maxPrice;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
  } else {
    quizCompleted = true;
  }

  renderQuestion();
  renderPatternCards();
  loadRecommendations();
}

function goBackQuestion() {
  if (quizCompleted) {
    quizCompleted = false;
    currentQuestionIndex = getQuestions().length - 1;
    renderQuestion();
    return;
  }

  if (currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    renderQuestion();
  }
}

function restartQuiz() {
  currentQuestionIndex = 0;
  quizCompleted = false;

  quizState.budget = 'any';
  quizState.time = 'any';
  quizState.mood = 'any';
  quizState.spice = 'any';
  quizState.dietary = 'any';
  quizState.foodCourt = 'all';
  quizState.temperature = 'any';
  quizState.maxPrice = null;

  selectedLabels.budget = 'Any Budget';
  selectedLabels.time = 'Any Time';
  selectedLabels.mood = 'Anything';
  selectedLabels.spice = 'Any Spice';
  selectedLabels.dietary = 'Any Dietary';
  selectedLabels.foodCourt = 'All Food Courts';
  selectedLabels.temperature = 'Any Temperature';

  renderQuestion();
  renderPatternCards();
  loadRecommendations();
}

function renderPatternCards() {
  const patterns = [
    {
      icon: '↗',
      text: `Budget choice: ${selectedLabels.budget}`,
    },
    {
      icon: '$',
      text: `Waiting time: ${selectedLabels.time}`,
    },
    {
      icon: '◎',
      text: `Mood: ${selectedLabels.mood}`,
    },
    {
      icon: '♨',
      text: `Spice level: ${selectedLabels.spice}`,
    },
    {
      icon: '⌂',
      text: `Location: ${selectedLabels.foodCourt}`,
    },
  ];

  quizPatternCards.innerHTML = patterns
    .map((pattern) => {
      return `
        <article class="decision-pattern-card">
          <span>${pattern.icon}</span>
          <p>${escapeHtml(pattern.text)}</p>
        </article>
      `;
    })
    .join('');
}

function loadRecommendations() {
  const requestBody = buildRecommendationBody();

  quizResultCount.textContent = 'Loading...';

  quizRecommendationsGrid.innerHTML = `
    <div class="decision-empty-card">
      Finding food matches...
    </div>
  `;

  fetch('/api/quiz/recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
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
      console.error('Error loading recommendations:', error);

      quizResultCount.textContent = 'Unavailable';

      quizRecommendationsGrid.innerHTML = `
        <div class="decision-empty-card">
          Unable to load recommendations. Check the quiz backend.
        </div>
      `;
    });
}

function buildRecommendationBody() {
  const requestBody = {
    budget: quizState.budget,
    time: quizState.time,
    mood: quizState.mood,
    spice: quizState.spice,
    dietary: quizState.dietary,
    foodCourt: quizState.foodCourt,
    temperature: quizState.temperature,
    category: 'all',
    sort: 'best-match',
    availableOnly: true,
    limit: 3,
  };

  if (quizState.maxPrice) {
    requestBody.maxPrice = quizState.maxPrice;
  }

  return requestBody;
}

function displayRecommendations(recommendations) {
  quizResultCount.textContent = `${recommendations.length} matches`;

  if (recommendations.length === 0) {
    quizRecommendationsGrid.innerHTML = `
      <div class="decision-empty-card">
        No meals found. Try restarting the quiz with fewer limits.
      </div>
    `;
    return;
  }

  quizRecommendationsGrid.innerHTML = recommendations
    .map((item) => {
      return `
        <article class="decision-food-card">
          ${createFoodImage(item)}

          <div class="decision-food-info">
            <h3>${escapeHtml(item.item_name)}</h3>
            <p>${escapeHtml(item.stall_name)}</p>

            <div class="decision-food-rating">
              <span>${createStars(item.item_rating)}</span>
              <strong>${formatRating(item.item_rating)}</strong>
            </div>

            <div class="decision-food-bottom">
              <span>${escapeHtml(item.category)}</span>
              <strong>$${formatPrice(item.price)}</strong>
            </div>

            <p class="decision-food-reason">
              ${escapeHtml(getMainReason(item))}
            </p>

            <button
              class="decision-view-menu-btn"
              type="button"
              data-stall-id="${item.stall_id}"
            >
              View Menu
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function createFoodImage(item) {
  if (!item.image_url) {
    return `
      <div class="decision-food-image decision-food-placeholder">
        No image
      </div>
    `;
  }

  return `
    <div class="decision-food-image-wrap">
      <img
        src="${item.image_url}"
        alt="${escapeHtml(item.item_name)}"
        class="decision-food-image"
      />
    </div>
  `;
}

function handleRecommendationClick(event) {
  const button = event.target.closest('.decision-view-menu-btn');

  if (!button) {
    return;
  }

  const stallId = button.dataset.stallId;

  if (stallId) {
    window.location.href = `./stall-detail.html?stall_id=${stallId}`;
  }
}

function handleRecommendationImageError(event) {
  const image = event.target;

  if (!image.classList.contains('decision-food-image')) {
    return;
  }

  const imageWrap = image.closest('.decision-food-image-wrap');

  if (!imageWrap) {
    return;
  }

  imageWrap.innerHTML = `
    <div class="decision-food-image decision-food-placeholder">
      No image
    </div>
  `;
}

function getMainReason(item) {
  if (Array.isArray(item.match_reasons) && item.match_reasons.length > 0) {
    return item.match_reasons[0];
  }

  return 'Matches your quiz preferences.';
}

function createStars(rating) {
  const roundedRating = Math.round(Number(rating || 0));
  let stars = '';

  for (let index = 1; index <= 5; index += 1) {
    stars += index <= roundedRating ? '★' : '☆';
  }

  return stars;
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}

function formatPrice(price) {
  return Number(price || 0).toFixed(2);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}