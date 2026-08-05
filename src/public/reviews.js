const reviewGrid = document.getElementById('reviewGrid');
const reviewCountText = document.getElementById('reviewCountText');

const reviewSearchInput = document.getElementById('reviewSearchInput');
const reviewRatingFilter = document.getElementById('reviewRatingFilter');
const reviewTagFilter = document.getElementById('reviewTagFilter');
const reviewSortFilter = document.getElementById('reviewSortFilter');

const filterChips = document.querySelectorAll('.review-filter-chip');

const openWriteReviewBtn = document.getElementById('openWriteReviewBtn');
const writeReviewModal = document.getElementById('writeReviewModal');
const closeWriteReviewModalBtn = document.getElementById('closeWriteReviewModalBtn');

const chooseFoodBtn = document.getElementById('chooseFoodBtn');
const chooseFoodModal = document.getElementById('chooseFoodModal');
const closeChooseFoodModalBtn = document.getElementById('closeChooseFoodModalBtn');

const foodPickerGrid = document.getElementById('foodPickerGrid');
const foodPickerSearchInput = document.getElementById('foodPickerSearchInput');
const foodPickerCategoryFilter = document.getElementById('foodPickerCategoryFilter');
const foodPickerFoodCourtFilter = document.getElementById('foodPickerFoodCourtFilter');

const selectedFoodIdInput = document.getElementById('selectedFoodId');
const selectedFoodSummary = document.getElementById('selectedFoodSummary');

const writeReviewForm = document.getElementById('writeReviewForm');
const reviewTextInput = document.getElementById('reviewTextInput');
const reviewTextCounter = document.getElementById('reviewTextCounter');
const reviewPhotoUrlInput = document.getElementById('reviewPhotoUrlInput');

const reviewTagPicker = document.getElementById('reviewTagPicker');
const postReviewBtn = writeReviewForm ? writeReviewForm.querySelector('.post-review-btn') : null;

let reviews = [];
let foodItems = [];
let selectedFilterTag = 'all';
let selectedMealPreview = null;
let mealPreviewModal = null;

const REVIEWS_PER_PAGE = 10;
const MIN_REVIEW_TEXT_LENGTH = 20;

let currentReviewPage = 1;
let reviewTextHelper = null;
let reviewPagination = null;
let backToTopBtn = null;

const reviewFormState = {
  overall: 0,
  taste: 0,
  value: 0,
  portion: 0,
  wait_time: 0,
  tags: [],
};

window.addEventListener('DOMContentLoaded', () => {
  initialiseReviewPage();
});

function initialiseReviewPage() {
  setupThemeToggle();
  setupReviewFilters();
  setupReviewGridActions();
  setupModals();
  setupStarRatings();
  setupTagPicker();
  setupReviewTextCounter();
  setupReviewForm();
  setupBackToTopButton();
  updatePostReviewButton();

  loadReviews();
  loadFoodItems();
}

function setupThemeToggle() {
  const reviewsThemeToggle = document.getElementById('reviewsThemeToggle');

  if (!reviewsThemeToggle) {
    return;
  }

  reviewsThemeToggle.addEventListener('click', () => {
    document.body.classList.toggle('home-dark-mode');
  });
}

function setupReviewFilters() {
  if (reviewSearchInput) {
    reviewSearchInput.addEventListener('input', handleReviewFilterChange);
  }

  if (reviewRatingFilter) {
    reviewRatingFilter.addEventListener('change', handleReviewFilterChange);
  }

  if (reviewSortFilter) {
    reviewSortFilter.addEventListener('change', handleReviewFilterChange);
  }

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedFilterTag = chip.dataset.filterTag || 'all';
      updateActiveFilterChip(selectedFilterTag);
      handleReviewFilterChange();
    });
  });

  if (reviewTagFilter) {
    reviewTagFilter.value = 'all';
  }

  if (foodPickerSearchInput) {
    foodPickerSearchInput.addEventListener('input', renderFoodPickerItems);
  }

  if (foodPickerCategoryFilter) {
    foodPickerCategoryFilter.addEventListener('change', renderFoodPickerItems);
  }

  if (foodPickerFoodCourtFilter) {
    foodPickerFoodCourtFilter.addEventListener('change', renderFoodPickerItems);
  }
}

function handleReviewFilterChange() {
  currentReviewPage = 1;
  renderReviews();
}

function updateActiveFilterChip(activeTag) {
  filterChips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.filterTag === activeTag);
  });
}

function setupReviewGridActions() {
  if (!reviewGrid) {
    return;
  }

  reviewGrid.addEventListener('click', (event) => {
    const helpfulButton = event.target.closest('.review-helpful-btn');

    if (helpfulButton) {
      updateHelpfulCount(helpfulButton);
      return;
    }

    const viewMealButton = event.target.closest('.view-meal-btn');

    if (viewMealButton) {
      const reviewId = Number(viewMealButton.dataset.reviewId);

      const selectedReview = reviews.find((review) => {
        return Number(review.review_id) === reviewId;
      });

      if (selectedReview) {
        openMealPreview(selectedReview);
      }
    }
  });
}

function setupModals() {
  if (openWriteReviewBtn && writeReviewModal) {
    openWriteReviewBtn.addEventListener('click', () => {
      writeReviewModal.classList.remove('hidden');
      updatePostReviewButton();
    });
  }

  if (closeWriteReviewModalBtn && writeReviewModal) {
    closeWriteReviewModalBtn.addEventListener('click', () => {
      writeReviewModal.classList.add('hidden');
    });
  }

  if (chooseFoodBtn && chooseFoodModal) {
    chooseFoodBtn.addEventListener('click', () => {
      chooseFoodModal.classList.remove('hidden');
      renderFoodPickerItems();
    });
  }

  if (closeChooseFoodModalBtn && chooseFoodModal) {
    closeChooseFoodModalBtn.addEventListener('click', () => {
      chooseFoodModal.classList.add('hidden');
    });
  }

  [writeReviewModal, chooseFoodModal].forEach((modal) => {
    if (!modal) {
      return;
    }

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  document.addEventListener('click', (event) => {
    const saveButton = event.target.closest('[data-review-save]');

    if (!saveButton) {
      return;
    }

    if (!selectedMealPreview) {
      return;
    }

    const saveType = saveButton.dataset.reviewSave;

    saveMealForSpEats(saveType, selectedMealPreview);

    saveButton.textContent = 'Saved';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (writeReviewModal) {
      writeReviewModal.classList.add('hidden');
    }

    if (chooseFoodModal) {
      chooseFoodModal.classList.add('hidden');
    }

    closeMealPreview();
  });
}

function setupStarRatings() {
  document.querySelectorAll('.star-rating').forEach((ratingContainer) => {
    const ratingName = ratingContainer.dataset.ratingName;

    ratingContainer.innerHTML = '';

    for (let index = 1; index <= 5; index += 1) {
      const starBtn = document.createElement('button');

      starBtn.type = 'button';
      starBtn.className = 'star-btn';
      starBtn.innerHTML = '&#9734;';
      starBtn.setAttribute('aria-label', `${index} star`);

      starBtn.addEventListener('click', () => {
        reviewFormState[ratingName] = index;
        updateStarRow(ratingContainer, index);
        updatePostReviewButton();
      });

      ratingContainer.appendChild(starBtn);
    }
  });
}

function updateStarRow(container, value) {
  [...container.children].forEach((star, index) => {
    const isActive = index < value;

    star.classList.toggle('active', isActive);
    star.innerHTML = isActive ? '&#9733;' : '&#9734;';
  });
}

function setupTagPicker() {
  if (!reviewTagPicker) {
    return;
  }

  reviewTagPicker.addEventListener('click', (event) => {
    const tagBtn = event.target.closest('.review-tag-option');

    if (!tagBtn) {
      return;
    }

    const tag = tagBtn.dataset.tag;
    const existingIndex = reviewFormState.tags.indexOf(tag);

    if (existingIndex >= 0) {
      reviewFormState.tags.splice(existingIndex, 1);
      tagBtn.classList.remove('active');
    } else {
      reviewFormState.tags.push(tag);
      tagBtn.classList.add('active');
    }

    updatePostReviewButton();
  });
}

function setupReviewTextCounter() {
  if (!reviewTextInput || !reviewTextCounter) {
    return;
  }

  ensureReviewTextHelper();
  updateReviewTextFeedback();

  reviewTextInput.addEventListener('input', () => {
    reviewTextCounter.textContent = `${reviewTextInput.value.length}/500`;
    updateReviewTextFeedback();
    updatePostReviewButton();
  });
}

function setupReviewForm() {
  if (!writeReviewForm) {
    return;
  }

  writeReviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!isReviewFormComplete()) {
      updateReviewTextFeedback(true);
      return;
    }

    const payload = {
      food_id: Number(selectedFoodIdInput.value),
      reviewer_name: 'Anonymous Student',
      rating: reviewFormState.overall,
      taste_rating: reviewFormState.taste,
      value_rating: reviewFormState.value,
      portion_rating: reviewFormState.portion,
      wait_time_rating: reviewFormState.wait_time,
      review_tags: reviewFormState.tags,
      review_text: reviewTextInput.value.trim(),
      best_time_to_buy: getBestTimeFromTags(),
      review_photo_url: reviewPhotoUrlInput.value.trim(),
    };

    try {
      setPostReviewLoading(true);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit review.');
      }

      if (writeReviewModal) {
        writeReviewModal.classList.add('hidden');
      }

      resetReviewFilters();
      resetWriteReviewForm();
      await loadReviews();
      await loadFoodItems();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Unable to submit review.');
    } finally {
      setPostReviewLoading(false);
      updatePostReviewButton();
    }
  });
}

function getReviewTextLength() {
  if (!reviewTextInput) {
    return 0;
  }

  return reviewTextInput.value.trim().length;
}

function ensureReviewTextHelper() {
  if (reviewTextHelper || !reviewTextInput) {
    return reviewTextHelper;
  }

  reviewTextHelper = document.getElementById('reviewTextHelper');

  if (!reviewTextHelper) {
    reviewTextHelper = document.createElement('p');
    reviewTextHelper.id = 'reviewTextHelper';
    reviewTextHelper.className = 'review-text-helper';
    reviewTextHelper.style.margin = '6px 0 0';
    reviewTextHelper.style.color = '#ef4444';
    reviewTextHelper.style.fontSize = '12px';
    reviewTextHelper.style.fontWeight = '800';

    reviewTextInput.insertAdjacentElement('afterend', reviewTextHelper);
  }

  return reviewTextHelper;
}

function updateReviewTextFeedback(forceShow = false) {
  const helper = ensureReviewTextHelper();

  if (!helper) {
    return;
  }

  const length = getReviewTextLength();
  const remainingCharacters = MIN_REVIEW_TEXT_LENGTH - length;

  helper.style.color = '#ef4444';

  if (length === 0) {
    helper.textContent = `Please type at least ${MIN_REVIEW_TEXT_LENGTH} characters.`;
    helper.style.opacity = forceShow ? '1' : '0.75';
    return;
  }

  if (remainingCharacters > 0) {
    helper.textContent = `Please type ${remainingCharacters} more character${
      remainingCharacters === 1 ? '' : 's'
    } before posting.`;
    helper.style.opacity = '1';
    return;
  }

  helper.textContent = 'Review length looks good.';
  helper.style.color = '#16a34a';
}

function isReviewFormComplete() {
  const hasFood = Boolean(selectedFoodIdInput && selectedFoodIdInput.value);

  const hasAllRatings =
    reviewFormState.overall > 0 &&
    reviewFormState.taste > 0 &&
    reviewFormState.value > 0 &&
    reviewFormState.portion > 0 &&
    reviewFormState.wait_time > 0;

  const hasTag = reviewFormState.tags.length > 0;
  const hasText = getReviewTextLength() >= MIN_REVIEW_TEXT_LENGTH;

  return hasFood && hasAllRatings && hasTag && hasText;
}

function updatePostReviewButton() {
  if (!postReviewBtn) {
    return;
  }

  const isComplete = isReviewFormComplete();

  postReviewBtn.disabled = !isComplete;
  postReviewBtn.classList.toggle('ready', isComplete);
}

function setPostReviewLoading(isLoading) {
  if (!postReviewBtn) {
    return;
  }

  postReviewBtn.disabled = isLoading;
  postReviewBtn.textContent = isLoading ? 'Posting Review...' : 'Post Review';
}

function getBestTimeFromTags() {
  if (reviewFormState.tags.includes('Good for lunch')) {
    return 'Lunch';
  }

  if (reviewFormState.tags.includes('Long queue')) {
    return 'Before peak lunch';
  }

  return 'Anytime';
}

async function loadReviews() {
  try {
    const response = await fetch('/api/reviews');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load reviews.');
    }

    reviews = result.data || [];
    renderReviews();
  } catch (error) {
    console.error('Error loading reviews:', error);

    if (reviewCountText) {
      reviewCountText.textContent = 'Unable to load reviews.';
    }

    if (reviewGrid) {
      reviewGrid.innerHTML = '<p>Unable to load reviews.</p>';
    }
  }
}

async function loadFoodItems() {
  try {
    const response = await fetch('/api/reviews/menu-options');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to load food items.');
    }

    foodItems = result.data || [];
    renderFoodPickerItems();
  } catch (error) {
    console.error('Error loading food items:', error);

    if (foodPickerGrid) {
      foodPickerGrid.innerHTML = '<p>Unable to load food items.</p>';
    }
  }
}

function renderReviews() {
  if (!reviewGrid) {
    return;
  }

  let filtered = [...reviews];

  const searchValue = reviewSearchInput ? reviewSearchInput.value.trim().toLowerCase() : '';

  const ratingValue = reviewRatingFilter ? reviewRatingFilter.value : 'all';
  const sortValue = reviewSortFilter ? reviewSortFilter.value : 'newest';

  if (searchValue) {
    filtered = filtered.filter((review) => {
      return (
        getReviewFoodName(review).toLowerCase().includes(searchValue) ||
        String(review.reviewer_name || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(review.review_text || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(review.stall_name || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(review.foodcourt_name || '')
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }

  if (ratingValue === '4plus') {
    filtered = filtered.filter((review) => Number(review.rating || 0) >= 4);
  } else if (ratingValue === '3plus') {
    filtered = filtered.filter((review) => Number(review.rating || 0) >= 3);
  } else if (ratingValue === 'under3') {
    filtered = filtered.filter((review) => Number(review.rating || 0) < 3);
  }

  if (selectedFilterTag !== 'all') {
    filtered = filtered.filter((review) => {
      return getReviewTags(review).includes(selectedFilterTag);
    });
  }

  if (sortValue === 'highest') {
    filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else if (sortValue === 'lowest') {
    filtered.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
  } else if (sortValue === 'helpful') {
    filtered.sort((a, b) => {
      return Number(b.helpful_count || 0) - Number(a.helpful_count || 0);
    });
  } else {
    filtered.sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }

  const totalReviews = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEWS_PER_PAGE));

  if (currentReviewPage > totalPages) {
    currentReviewPage = totalPages;
  }

  const startIndex = (currentReviewPage - 1) * REVIEWS_PER_PAGE;
  const endIndex = startIndex + REVIEWS_PER_PAGE;
  const visibleReviews = filtered.slice(startIndex, endIndex);

  if (reviewCountText) {
    if (totalReviews === 0) {
      reviewCountText.textContent = 'Showing 0 reviews';
    } else {
      reviewCountText.textContent = `Showing ${startIndex + 1}-${Math.min(
        endIndex,
        totalReviews,
      )} of ${totalReviews} reviews`;
    }
  }

  if (totalReviews === 0) {
    reviewGrid.innerHTML = '<p>No reviews found.</p>';
    renderReviewPagination(0);
    return;
  }

  reviewGrid.innerHTML = visibleReviews.map(createReviewCardHTML).join('');
  renderReviewPagination(totalPages);
}

async function updateHelpfulCount(button) {
  const reviewId = button.dataset.reviewId;

  if (!reviewId || button.disabled) {
    return;
  }

  button.disabled = true;

  try {
    const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
      method: 'PATCH',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update helpful count.');
    }

    await loadReviews();
  } catch (error) {
    console.error('Error updating helpful count:', error);
    button.disabled = false;
  }
}

function createReviewCardHTML(review) {
  const tags = getReviewTags(review)
    .map((tag) => `<span class="review-tag-pill">${escapeHtml(tag)}</span>`)
    .join('');

  const initials = getInitials(review.reviewer_name || 'User');
  const imageUrl = review.review_photo_url || review.image_url;
  const foodName = getReviewFoodName(review);
  const imageClass = imageUrl ? '' : 'review-card-no-image';

  return `
    <article class="review-card ${imageClass}">
      <div class="review-card-top">
        <div class="review-user-meta">
          <div class="review-avatar">${escapeHtml(initials)}</div>
          <div>
            <h3>${escapeHtml(review.reviewer_name || 'Anonymous')}</h3>
            <p>${escapeHtml(formatDate(review.created_at))}</p>
          </div>
        </div>

        <div class="review-score">
          <div class="stars">${renderStars(review.rating)}</div>
          <div>${Number(review.rating || 0).toFixed(1)}</div>
        </div>
      </div>

      <div>
        <h3 class="review-food-title">${escapeHtml(foodName)}</h3>
        <p class="review-food-subtitle">
          ${escapeHtml(review.stall_name || 'Unknown Stall')} &middot; FC${escapeHtml(
            review.foodcourt_id || '',
          )} - ${escapeHtml(review.foodcourt_name || '')}
        </p>
      </div>

      <p class="review-text">${escapeHtml(review.review_text || '')}</p>

      ${createReviewImageHTML(imageUrl, foodName)}

      <div class="review-tag-pills">${tags}</div>

      <div class="review-card-actions">
        <button class="review-helpful-btn" type="button" data-review-id="${review.review_id}">
          ${createHelpfulIcon()}
          <span>Helpful &middot; ${review.helpful_count || 0}</span>
        </button>

        <button
          class="view-meal-btn"
          type="button"
          data-review-id="${review.review_id}"
        >
          View Meal
        </button>
      </div>
    </article>
  `;
}

function createReviewImageHTML(imageUrl, foodName) {
  if (!imageUrl) {
    return '';
  }

  return `
    <img
      class="review-image"
      src="${escapeHtml(imageUrl)}"
      alt="${escapeHtml(foodName)}"
    />
  `;
}

function createHelpfulIcon() {
  return `
    <svg
      class="helpful-svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.5 10.5v9h-3v-9h3Zm2.4 9h7.35c.78 0 1.45-.53 1.64-1.29l1.05-4.24c.27-1.07-.54-2.11-1.64-2.11h-4.4l.67-3.22c.13-.62-.08-1.26-.54-1.7l-.52-.5-4.1 4.45v8.61Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function renderFoodPickerItems() {
  if (!foodPickerGrid) {
    return;
  }

  let filtered = [...foodItems];

  const searchValue = foodPickerSearchInput ? foodPickerSearchInput.value.trim().toLowerCase() : '';

  const categoryValue = foodPickerCategoryFilter ? foodPickerCategoryFilter.value : 'all';

  const foodCourtValue = foodPickerFoodCourtFilter ? foodPickerFoodCourtFilter.value : 'all';

  if (searchValue) {
    filtered = filtered.filter((item) => {
      return (
        getFoodPickerName(item).toLowerCase().includes(searchValue) ||
        String(item.stall_name || '')
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }

  if (categoryValue !== 'all') {
    filtered = filtered.filter((item) => item.category === categoryValue);
  }

  if (foodCourtValue !== 'all') {
    filtered = filtered.filter((item) => {
      return foodCourtMatches(item, foodCourtValue);
    });
  }

  if (filtered.length === 0) {
    foodPickerGrid.innerHTML = '<p>No food items found.</p>';
    return;
  }

  foodPickerGrid.innerHTML = filtered.map(createFoodPickerCardHTML).join('');

  foodPickerGrid.querySelectorAll('.food-picker-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectFoodItem(card);
    });
  });
}

function selectFoodItem(card) {
  const foodId = Number(card.dataset.foodId);

  const selected = foodItems.find((item) => {
    return Number(item.food_id) === foodId;
  });

  if (!selected) {
    return;
  }

  selectedFoodIdInput.value = selected.food_id;

  selectedFoodSummary.innerHTML = `
    <strong>${escapeHtml(getFoodPickerName(selected))}</strong>
    <span>${escapeHtml(selected.stall_name)} &middot; FC${escapeHtml(
      selected.foodcourt_id,
    )} - ${escapeHtml(selected.foodcourt_name)}</span>
  `;

  if (chooseFoodModal) {
    chooseFoodModal.classList.add('hidden');
  }

  updatePostReviewButton();
}

function createFoodPickerCardHTML(item) {
  const itemName = getFoodPickerName(item);
  const hasImage = Boolean(item.image_url);

  return `
    <button
      class="food-picker-card ${hasImage ? '' : 'food-picker-card-no-image'}"
      type="button"
      data-food-id="${item.food_id}"
    >
      ${createFoodPickerImage(item)}

      <div class="food-picker-info">
        <h4>${escapeHtml(itemName)}</h4>
        <p>${escapeHtml(item.stall_name || 'Unknown Stall')}</p>

        <div class="food-picker-meta">
          <span>$${Number(item.price || 0).toFixed(2)}</span>
          <span>${escapeHtml(item.category || 'Food')}</span>
        </div>

        <div class="food-picker-nutrition">
          <span class="food-nutrition-pill pill-spice">
            ${escapeHtml(item.spice_level || 'No spice')}
          </span>
          <span class="food-nutrition-pill pill-protein">
            ${escapeHtml(item.protein_level || 'Protein')}
          </span>
          <span class="food-nutrition-pill pill-sugar">
            ${escapeHtml(item.sugar_level || 'Sugar')}
          </span>
        </div>
      </div>

      <div class="food-picker-check">Check</div>
    </button>
  `;
}

function createFoodPickerImage(item) {
  const itemName = getFoodPickerName(item);

  if (!item.image_url) {
    return '';
  }

  return `
    <img
      class="food-picker-image"
      src="${escapeHtml(item.image_url)}"
      alt="${escapeHtml(itemName)}"
    />
  `;
}

function getFoodPickerName(item) {
  return item.item_name || item.name || 'Untitled Food';
}

function foodCourtMatches(item, selectedFoodCourt) {
  const selected = String(selectedFoodCourt || '').toLowerCase();
  const itemFoodCourtId = `fc${item.foodcourt_id}`.toLowerCase();
  const itemFoodCourtName = String(item.foodcourt_name || '').toLowerCase();
  const combined = `${itemFoodCourtId} ${itemFoodCourtName}`;

  return combined.includes(selected) || selected.includes(itemFoodCourtId);
}

function resetReviewFilters() {
  selectedFilterTag = 'all';

  if (reviewSearchInput) {
    reviewSearchInput.value = '';
  }

  if (reviewRatingFilter) {
    reviewRatingFilter.value = 'all';
  }

  if (reviewSortFilter) {
    reviewSortFilter.value = 'newest';
  }

  if (reviewTagFilter) {
    reviewTagFilter.value = 'all';
  }

  updateActiveFilterChip('all');
}

function resetWriteReviewForm() {
  selectedFoodIdInput.value = '';
  selectedFoodSummary.innerHTML = '<strong>Choose Food Item</strong>';

  reviewFormState.overall = 0;
  reviewFormState.taste = 0;
  reviewFormState.value = 0;
  reviewFormState.portion = 0;
  reviewFormState.wait_time = 0;
  reviewFormState.tags = [];

  document.querySelectorAll('.star-rating').forEach((row) => {
    updateStarRow(row, 0);
  });

  document.querySelectorAll('.review-tag-option').forEach((button) => {
    button.classList.remove('active');
  });

  if (reviewTextInput) {
    reviewTextInput.value = '';
  }

  if (reviewPhotoUrlInput) {
    reviewPhotoUrlInput.value = '';
  }

  if (reviewTextCounter) {
    reviewTextCounter.textContent = '0/500';
  }

  if (reviewTextHelper) {
    reviewTextHelper.style.color = '#ef4444';
  }

  updateReviewTextFeedback();
  updatePostReviewButton();
}

function openMealPreview(review) {
  selectedMealPreview = review;
  ensureMealPreviewModal();

  const foodName = getReviewFoodName(review);
  const imageUrl = review.review_photo_url || review.image_url;
  const priceText = review.price ? `$${Number(review.price || 0).toFixed(2)}` : 'Price unavailable';

  mealPreviewModal.innerHTML = `
    <div class="meal-preview-backdrop" data-meal-preview-action="close"></div>

    <article class="meal-preview-card ${imageUrl ? '' : 'meal-preview-card-no-image'}">
      ${createMealPreviewImageHTML(imageUrl, foodName)}

      <div class="meal-preview-content">
        <div class="meal-preview-top">
          <div>
            <p class="meal-preview-label">Selected Meal</p>
            <h2>${escapeHtml(foodName)}</h2>
            <p>${escapeHtml(review.stall_name || 'Unknown Stall')} &middot; FC${escapeHtml(
              review.foodcourt_id || '',
            )} - ${escapeHtml(review.foodcourt_name || '')}</p>
          </div>

          <button
            class="meal-preview-close"
            type="button"
            data-meal-preview-action="close"
          >
            Close
          </button>
        </div>

        <div class="meal-preview-rating-row">
          <span class="meal-preview-stars">${renderStars(review.rating)}</span>
          <strong>${Number(review.rating || 0).toFixed(1)}</strong>
          <span>${priceText}</span>
        </div>

        <p class="meal-preview-review-text">
          ${escapeHtml(review.review_text || 'No review text available.')}
        </p>

        <div class="meal-preview-tags">
          ${getReviewTags(review)
            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
            .join('')}
        </div>

        <div class="meal-preview-actions">
          <button type="button" data-review-save="favourite">
            Add to Favourite
          </button>

          <button type="button" data-review-save="tryLater">
            Try Later
          </button>

          <button
            class="meal-preview-store"
            type="button"
            data-meal-preview-action="store"
          >
            Go to Store
          </button>
        </div>
      </div>
    </article>
  `;

  mealPreviewModal.classList.add('active');
}

function createMealPreviewImageHTML(imageUrl, foodName) {
  if (!imageUrl) {
    return '';
  }

  return `
    <div class="meal-preview-image-area">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(foodName)}" />
    </div>
  `;
}

function ensureMealPreviewModal() {
  if (mealPreviewModal) {
    return;
  }

  mealPreviewModal = document.createElement('div');
  mealPreviewModal.className = 'meal-preview-modal';

  mealPreviewModal.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-meal-preview-action]');

    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.mealPreviewAction;

    if (action === 'close') {
      closeMealPreview();
    }

    if (action === 'store') {
      goToSelectedMealStore();
    }
  });

  document.body.appendChild(mealPreviewModal);
}

function closeMealPreview() {
  if (mealPreviewModal) {
    mealPreviewModal.classList.remove('active');
  }
}

function goToSelectedMealStore() {
  if (!selectedMealPreview || !selectedMealPreview.stall_id) {
    return;
  }

  window.location.href = `./stall-detail.html?stall_id=${selectedMealPreview.stall_id}`;
}

function renderReviewPagination(totalPages) {
  ensureReviewPagination();

  if (!reviewPagination) {
    return;
  }

  if (totalPages <= 1) {
    reviewPagination.innerHTML = '';
    reviewPagination.classList.remove('show');
    return;
  }

  reviewPagination.dataset.totalPages = String(totalPages);
  reviewPagination.classList.add('show');

  const pageButtons = [];

  for (let page = 1; page <= totalPages; page += 1) {
    pageButtons.push(`
      <button
        class="review-page-number ${page === currentReviewPage ? 'active' : ''}"
        type="button"
        data-review-page="${page}"
      >
        ${page}
      </button>
    `);
  }

  reviewPagination.innerHTML = `
    <button
      class="review-page-btn"
      type="button"
      data-review-page="prev"
      ${currentReviewPage === 1 ? 'disabled' : ''}
    >
      Previous
    </button>

    <div class="review-page-numbers">
      ${pageButtons.join('')}
    </div>

    <button
      class="review-page-btn"
      type="button"
      data-review-page="next"
      ${currentReviewPage === totalPages ? 'disabled' : ''}
    >
      Next
    </button>
  `;
}

function ensureReviewPagination() {
  if (reviewPagination || !reviewGrid) {
    return;
  }

  reviewPagination = document.createElement('div');
  reviewPagination.className = 'review-pagination';

  reviewPagination.addEventListener('click', (event) => {
    const button = event.target.closest('[data-review-page]');

    if (!button || button.disabled) {
      return;
    }

    const pageAction = button.dataset.reviewPage;
    const totalPages = Number(reviewPagination.dataset.totalPages || 1);

    if (pageAction === 'prev') {
      currentReviewPage = Math.max(1, currentReviewPage - 1);
    } else if (pageAction === 'next') {
      currentReviewPage = Math.min(totalPages, currentReviewPage + 1);
    } else {
      currentReviewPage = Number(pageAction);
    }

    renderReviews();
    scrollToReviewStart();
  });

  reviewGrid.insertAdjacentElement('afterend', reviewPagination);
}

function scrollToReviewStart() {
  const reviewSection = document.querySelector('.review-main') || reviewGrid;

  reviewSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function setupBackToTopButton() {
  if (backToTopBtn) {
    return;
  }

  backToTopBtn = document.createElement('button');
  backToTopBtn.type = 'button';
  backToTopBtn.className = 'review-back-top-btn';
  backToTopBtn.textContent = 'Back to Top';

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('show', window.scrollY > 420);
  });
}

function getReviewFoodName(review) {
  return review.item_name || review.food_name || 'Untitled Dish';
}

function getReviewTags(review) {
  if (Array.isArray(review.review_tags) && review.review_tags.length > 0) {
    return review.review_tags;
  }

  if (review.review_tag) {
    return [review.review_tag];
  }

  return [];
}

function renderStars(rating) {
  const numericRating = Math.max(0, Math.min(5, Number(rating || 0)));
  let stars = '';

  for (let index = 1; index <= 5; index += 1) {
    const starFill = Math.max(0, Math.min(1, numericRating - (index - 1)));
    const fillPercent = Math.round(starFill * 100);

    stars += `
      <span class="review-star">
        <span class="review-star-empty">&#9734;</span>
        <span class="review-star-fill" style="width: ${fillPercent}%;">
          &#9733;
        </span>
      </span>
    `;
  }

  return stars;
}

function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  return new Date(dateString).toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name) {
  return String(name || 'User')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const SP_EATS_FAVOURITE_MEALS_KEY = 'spEatsFavouriteMeals';
const SP_EATS_TRY_LATER_MEALS_KEY = 'spEatsTryLaterMeals';
const QUICKBITE_FAVOURITE_MEALS_KEY = 'quickbiteFavouriteMeals';
const QUICKBITE_TRY_LATER_MEALS_KEY = 'quickbiteTryLaterMeals';

function saveMealForSpEats(type, meal) {
  const savedMeal = normaliseSavedMeal(meal);
  const storageKeys = getSaveStorageKeys(type);

  storageKeys.forEach((key) => {
    const currentList = getSavedMealList(key);

    const exists = currentList.some((item) => {
      const normalisedItem = normaliseSavedMeal(item);
      return String(normalisedItem.id) === String(savedMeal.id);
    });

    if (!exists) {
      currentList.unshift(savedMeal);
    }

    localStorage.setItem(key, JSON.stringify(currentList.slice(0, 24)));
  });

  window.dispatchEvent(new Event('spEatsSavedMealsUpdated'));
  window.dispatchEvent(new Event('quickbiteSavedMealsUpdated'));
}

function getSaveStorageKeys(type) {
  if (type === 'tryLater') {
    return [SP_EATS_TRY_LATER_MEALS_KEY, QUICKBITE_TRY_LATER_MEALS_KEY];
  }

  return [SP_EATS_FAVOURITE_MEALS_KEY, QUICKBITE_FAVOURITE_MEALS_KEY];
}

function getSavedMealList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normaliseSavedMeal(meal) {
  return {
    id: String(
      meal.food_id || meal.foodId || meal.item_id || meal.id || meal.item_name || meal.name,
    ),
    foodId: meal.food_id || meal.foodId || meal.item_id || meal.id || '',
    stallId: meal.stall_id || meal.stallId || '',
    foodCourtId: meal.foodcourt_id || meal.foodCourtId || '',
    name: meal.item_name || meal.name || meal.food_name || 'Saved Meal',
    stallName: meal.stall_name || meal.stallName || meal.stall || 'Campus Stall',
    foodCourtName: meal.foodcourt_name || meal.foodCourtName || meal.food_court || 'SP Food Court',
    imageUrl: meal.image_url || meal.imageUrl || meal.review_photo_url || '',
    price: Number(meal.price || 0),
    rating: Number(meal.item_rating || meal.rating || 0),
    reviewCount: Number(meal.item_review_count || meal.review_count || meal.rating_count || 0),
    category: meal.category || 'Meal',
  };
}
