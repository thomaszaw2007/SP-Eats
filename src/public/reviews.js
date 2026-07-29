const reviewSearchInput = document.getElementById('reviewSearchInput');
const reviewTagFilter = document.getElementById('reviewTagFilter');
const reviewFoodCourtFilter = document.getElementById('reviewFoodCourtFilter');
const reviewMinRatingFilter = document.getElementById('reviewMinRatingFilter');
const reviewSortFilter = document.getElementById('reviewSortFilter');
const clearReviewFiltersBtn = document.getElementById('clearReviewFiltersBtn');
const openReviewComposerBtn = document.getElementById('openReviewComposerBtn');
const dynamicReviewTagChips = document.getElementById('dynamicReviewTagChips');

const reviewResultCount = document.getElementById('reviewResultCount');
const reviewList = document.getElementById('reviewList');

const reviewComposerOverlay = document.getElementById('reviewComposerOverlay');
const closeReviewComposerBtn = document.getElementById('closeReviewComposerBtn');
const cancelReviewBtn = document.getElementById('cancelReviewBtn');
const reviewForm = document.getElementById('reviewForm');
const selectedReviewFoodId = document.getElementById('selectedReviewFoodId');
const selectedFoodName = document.getElementById('selectedFoodName');
const selectedFoodMeta = document.getElementById('selectedFoodMeta');
const openFoodPickerBtn = document.getElementById('openFoodPickerBtn');
const reviewComposerTags = document.getElementById('reviewComposerTags');
const reviewTextInput = document.getElementById('reviewTextInput');
const reviewTextCount = document.getElementById('reviewTextCount');
const reviewPhotoUrlInput = document.getElementById('reviewPhotoUrlInput');
const reviewFormMessage = document.getElementById('reviewFormMessage');
const submitReviewBtn = document.getElementById('submitReviewBtn');

const foodPickerOverlay = document.getElementById('foodPickerOverlay');
const closeFoodPickerBtn = document.getElementById('closeFoodPickerBtn');
const foodPickerSearchInput = document.getElementById('foodPickerSearchInput');
const foodPickerFoodCourtFilter = document.getElementById('foodPickerFoodCourtFilter');
const foodPickerCategoryFilter = document.getElementById('foodPickerCategoryFilter');
const foodPickerList = document.getElementById('foodPickerList');

const reviewToast = document.getElementById('reviewToast');

let reviewSearchTimer = null;
let foodPickerSearchTimer = null;
let selectedTagChip = 'all';
let selectedFoodItem = null;
let selectedReviewTags = [];
let latestReviewRequestId = 0;
let reviewAbortController = null;

const ratingState = {
  rating: 0,
  taste_rating: 0,
  value_rating: 0,
  portion_rating: 0,
  wait_time_rating: 0,
};

window.addEventListener('DOMContentLoaded', () => {
  setupReviewEvents();
  loadReviewFilterOptions();
  loadReviews();
});

function setupReviewEvents() {
  if (reviewSearchInput) {
    reviewSearchInput.addEventListener('input', () => {
      clearTimeout(reviewSearchTimer);

      reviewSearchTimer = setTimeout(() => {
        loadReviews();
      }, 250);
    });
  }

  if (reviewTagFilter) {
    reviewTagFilter.addEventListener('change', () => {
      selectedTagChip = reviewTagFilter.value;
      updateDynamicTagChips();
      loadReviews();
    });
  }

  if (reviewFoodCourtFilter) {
    reviewFoodCourtFilter.addEventListener('change', loadReviews);
  }

  if (reviewMinRatingFilter) {
    reviewMinRatingFilter.addEventListener('change', loadReviews);
  }

  if (reviewSortFilter) {
    reviewSortFilter.addEventListener('change', loadReviews);
  }

  if (clearReviewFiltersBtn) {
    clearReviewFiltersBtn.addEventListener('click', clearReviewFilters);
  }

  if (dynamicReviewTagChips) {
    dynamicReviewTagChips.addEventListener('click', handleDynamicTagClick);
  }

  if (reviewList) {
    reviewList.addEventListener('click', handleReviewListClick);
    reviewList.addEventListener('error', handleReviewImageError, true);
  }

  if (openReviewComposerBtn) {
    openReviewComposerBtn.addEventListener('click', openReviewComposer);
  }

  if (closeReviewComposerBtn) {
    closeReviewComposerBtn.addEventListener('click', closeReviewComposer);
  }

  if (cancelReviewBtn) {
    cancelReviewBtn.addEventListener('click', closeReviewComposer);
  }

  if (reviewComposerOverlay) {
    reviewComposerOverlay.addEventListener('click', (event) => {
      if (event.target === reviewComposerOverlay) {
        closeReviewComposer();
      }
    });
  }

  document.querySelectorAll('.review-star-row').forEach((row) => {
    row.addEventListener('click', handleStarRatingClick);
  });

  if (reviewComposerTags) {
    reviewComposerTags.addEventListener('click', handleComposerTagClick);
  }

  if (reviewTextInput) {
    reviewTextInput.addEventListener('input', updateReviewTextCount);
  }

  if (reviewForm) {
    reviewForm.addEventListener('submit', submitReviewForm);
  }

  if (openFoodPickerBtn) {
    openFoodPickerBtn.addEventListener('click', openFoodPicker);
  }

  if (closeFoodPickerBtn) {
    closeFoodPickerBtn.addEventListener('click', closeFoodPicker);
  }

  if (foodPickerOverlay) {
    foodPickerOverlay.addEventListener('click', (event) => {
      if (event.target === foodPickerOverlay) {
        closeFoodPicker();
      }
    });
  }

  if (foodPickerSearchInput) {
    foodPickerSearchInput.addEventListener('input', () => {
      clearTimeout(foodPickerSearchTimer);

      foodPickerSearchTimer = setTimeout(() => {
        loadFoodPickerItems();
      }, 250);
    });
  }

  if (foodPickerFoodCourtFilter) {
    foodPickerFoodCourtFilter.addEventListener('change', loadFoodPickerItems);
  }

  if (foodPickerCategoryFilter) {
    foodPickerCategoryFilter.addEventListener('change', loadFoodPickerItems);
  }

  if (foodPickerList) {
    foodPickerList.addEventListener('click', handleFoodPickerClick);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeFoodPicker();
      closeReviewComposer();
    }
  });
}

function loadReviews() {
  const queryString = buildReviewQueryString();
  const requestId = latestReviewRequestId + 1;

  latestReviewRequestId = requestId;

  if (reviewAbortController) {
    reviewAbortController.abort();
  }

  reviewAbortController = new AbortController();

  setReviewUpdatingState(true);

  fetch(`/api/reviews${queryString}`, {
    signal: reviewAbortController.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Review API request failed.');
      }

      return response.json();
    })
    .then((result) => {
      if (requestId !== latestReviewRequestId) {
        return;
      }

      const reviews = result.data || [];

      updateReviewResultText(reviews.length);
      displayReviewCards(reviews);
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Error loading reviews:', error);
      showReviewError();
    })
    .finally(() => {
      if (requestId === latestReviewRequestId) {
        setReviewUpdatingState(false);
      }
    });
}

function buildReviewQueryString() {
  const params = new URLSearchParams();

  const search = reviewSearchInput ? reviewSearchInput.value.trim() : '';
  const tag = reviewTagFilter ? reviewTagFilter.value : 'all';
  const foodCourt = reviewFoodCourtFilter ? reviewFoodCourtFilter.value : 'all';
  const sort = reviewSortFilter ? reviewSortFilter.value : 'newest';
  const ratingFilter = reviewMinRatingFilter
    ? reviewMinRatingFilter.value
    : '';

  if (search) {
    params.append('search', search);
  }

  if (tag && tag !== 'all') {
    params.append('tag', tag);
  }

  if (foodCourt && foodCourt !== 'all') {
    params.append('foodCourt', foodCourt);
  }

  if (ratingFilter === 'below3') {
    params.append('ratingRange', 'below3');
  } else if (ratingFilter) {
    params.append('minRating', ratingFilter);
  }

  if (sort && sort !== 'newest') {
    params.append('sort', sort);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}

function loadReviewFilterOptions() {
  fetch('/api/reviews/filter-options')
    .then((response) => response.json())
    .then((result) => {
      const options = result.data || {};

      populateReviewTagOptions(options.tags || []);
      populateFoodCourtOptions(options.food_courts || []);
      populateFoodPickerFoodCourtOptions(options.food_courts || []);
      populateFoodPickerCategoryOptions(options.categories || []);
    })
    .catch((error) => {
      console.error('Error loading review filter options:', error);
    });
}

function populateReviewTagOptions(tags) {
  if (!reviewTagFilter) {
    return;
  }

  reviewTagFilter.innerHTML = `
    <option value="all">All Tags</option>
  `;

  tags.forEach((tag) => {
    reviewTagFilter.innerHTML += `
      <option value="${tag}">
        ${tag}
      </option>
    `;
  });

  displayDynamicTagChips(tags);
}

function displayDynamicTagChips(tags) {
  if (!dynamicReviewTagChips) {
    return;
  }

  dynamicReviewTagChips.innerHTML = `
    <button class="review-tag-chip active" data-tag="all" type="button">
      All
    </button>
  `;

  tags.forEach((tag) => {
    dynamicReviewTagChips.innerHTML += `
      <button class="review-tag-chip" data-tag="${tag}" type="button">
        ${tag}
      </button>
    `;
  });

  updateDynamicTagChips();
}

function populateFoodCourtOptions(foodCourts) {
  if (!reviewFoodCourtFilter) {
    return;
  }

  reviewFoodCourtFilter.innerHTML = `
    <option value="all">All Food Courts</option>
  `;

  foodCourts.forEach((foodCourt) => {
    reviewFoodCourtFilter.innerHTML += `
      <option value="FC${foodCourt.foodcourt_id}">
        FC${foodCourt.foodcourt_id} - ${foodCourt.foodcourt_name}
      </option>
    `;
  });
}

function populateFoodPickerFoodCourtOptions(foodCourts) {
  if (!foodPickerFoodCourtFilter) {
    return;
  }

  foodPickerFoodCourtFilter.innerHTML = `
    <option value="all">All Food Courts</option>
  `;

  foodCourts.forEach((foodCourt) => {
    foodPickerFoodCourtFilter.innerHTML += `
      <option value="FC${foodCourt.foodcourt_id}">
        FC${foodCourt.foodcourt_id}
      </option>
    `;
  });
}

function populateFoodPickerCategoryOptions(categories) {
  if (!foodPickerCategoryFilter) {
    return;
  }

  foodPickerCategoryFilter.innerHTML = `
    <option value="all">All Categories</option>
  `;

  categories.forEach((category) => {
    foodPickerCategoryFilter.innerHTML += `
      <option value="${category}">
        ${category}
      </option>
    `;
  });
}

function handleDynamicTagClick(event) {
  const chip = event.target.closest('.review-tag-chip');

  if (!chip) {
    return;
  }

  selectedTagChip = chip.dataset.tag || 'all';

  if (reviewTagFilter) {
    reviewTagFilter.value = selectedTagChip;
  }

  updateDynamicTagChips();
  loadReviews();
}

function updateDynamicTagChips() {
  document.querySelectorAll('.dynamic-review-tags .review-tag-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.tag === selectedTagChip);
  });
}

function clearReviewFilters() {
  if (reviewSearchInput) {
    reviewSearchInput.value = '';
  }

  if (reviewTagFilter) {
    reviewTagFilter.value = 'all';
  }

  if (reviewFoodCourtFilter) {
    reviewFoodCourtFilter.value = 'all';
  }

  if (reviewMinRatingFilter) {
    reviewMinRatingFilter.value = '';
  }

  if (reviewSortFilter) {
    reviewSortFilter.value = 'newest';
  }

  selectedTagChip = 'all';
  updateDynamicTagChips();
  loadReviews();
}

function updateReviewResultText(count) {
  if (reviewResultCount) {
    reviewResultCount.textContent = `${count} reviews`;
  }
}

function displayReviewCards(reviews) {
  if (!reviewList) {
    return;
  }

  if (reviews.length === 0) {
    reviewList.innerHTML = `
      <div class="review-wall-empty">
        <h3>No reviews found</h3>
        <p>Try another search or filter.</p>
      </div>
    `;
    return;
  }

  reviewList.innerHTML = reviews
    .map((review, index) => {
      const animationDelay = `style="animation-delay: ${index * 0.035}s"`;

      return `
        <article class="review-wall-card animated-review-card" ${animationDelay}>
          <div class="review-wall-card-top">
            <div class="review-wall-person">
              <div class="review-wall-avatar">
                ${getInitials(review.reviewer_name)}
              </div>

              <div>
                <h3>${review.reviewer_name}</h3>
                <p>${formatDate(review.created_at)}</p>
              </div>
            </div>

            <div class="review-wall-stars">
              ${createStars(review.rating)}
              <strong>${formatRating(review.rating)}</strong>
            </div>
          </div>

          <h4>${review.item_name}</h4>

          <p class="review-wall-location">
            ${review.stall_name} · FC${review.foodcourt_id} — ${review.foodcourt_name}
          </p>

          <p class="review-wall-text">
            ${review.review_text}
          </p>

          ${createReviewImage(review)}

          <div class="review-score-panel">
            ${createScoreLine('Taste', review.taste_rating)}
            ${createScoreLine('Value', review.value_rating)}
            ${createScoreLine('Portion', review.portion_rating)}
            ${createScoreLine('Wait', review.wait_time_rating)}
          </div>

          <div class="review-wall-tags">
            ${createReviewTagBadges(review)}
          </div>

          <div class="review-wall-actions">
            <button
              class="review-wall-helpful"
              type="button"
              data-review-id="${review.review_id}"
            >
              ♡ Helpful · ${review.helpful_count || 0}
            </button>

            <button
              class="review-wall-view-menu"
              type="button"
              data-stall-id="${review.stall_id}"
            >
              View Menu →
            </button>
          </div>
        </article>
      `;
    })
    .join('');
}

function createReviewImage(review) {
  if (!review.review_photo_url && !review.image_url) {
    return `<div class="review-wall-image-space"></div>`;
  }

  const imageUrl = review.review_photo_url || review.image_url;

  return `
    <div class="review-wall-image-wrap">
      <img
        src="${imageUrl}"
        alt="${review.item_name}"
        class="review-wall-food-image"
        loading="lazy"
        decoding="async"
      />
    </div>
  `;
}

function createScoreLine(label, value) {
  const rating = Number(value || 0);
  const percent = Math.min(100, Math.max(0, rating * 20));

  return `
    <div class="review-score-line">
      <span>${label}</span>
      <div class="review-score-track">
        <div class="review-score-fill" style="width: ${percent}%"></div>
      </div>
      <strong>${formatRating(rating)}</strong>
    </div>
  `;
}

function createReviewTagBadges(review) {
  const tags = Array.isArray(review.review_tags) && review.review_tags.length > 0
    ? review.review_tags
    : [review.review_tag || 'General'];

  return tags
    .slice(0, 5)
    .map((tag) => {
      return `<span>${tag}</span>`;
    })
    .join('');
}

function handleReviewListClick(event) {
  const helpfulButton = event.target.closest('.review-wall-helpful');

  if (helpfulButton) {
    markReviewHelpful(helpfulButton);
    return;
  }

  const viewMenuButton = event.target.closest('.review-wall-view-menu');

  if (!viewMenuButton) {
    return;
  }

  const stallId = viewMenuButton.dataset.stallId;

  if (stallId) {
    window.location.href = `./stall-detail.html?stall_id=${stallId}`;
  }
}

function markReviewHelpful(button) {
  const reviewId = button.dataset.reviewId;

  if (!reviewId || button.classList.contains('liked')) {
    return;
  }

  fetch(`/api/reviews/${reviewId}/helpful`, {
    method: 'POST',
  })
    .then((response) => response.json())
    .then((result) => {
      const updatedReview = result.data;

      if (!updatedReview) {
        return;
      }

      button.classList.add('liked');
      button.textContent = `♥ Helpful · ${updatedReview.helpful_count}`;
    })
    .catch((error) => {
      console.error('Error marking review as helpful:', error);
    });
}

function handleReviewImageError(event) {
  const image = event.target;

  if (!image.classList.contains('review-wall-food-image')) {
    return;
  }

  const imageWrap = image.closest('.review-wall-image-wrap');

  if (!imageWrap) {
    return;
  }

  imageWrap.innerHTML = `
    <div class="review-wall-image-fallback">
      No image
    </div>
  `;
}

function setReviewUpdatingState(isUpdating) {
  if (reviewList) {
    reviewList.classList.toggle('is-updating', isUpdating);
  }
}

function openReviewComposer() {
  resetReviewForm();

  if (reviewComposerOverlay) {
    reviewComposerOverlay.classList.add('active');
  }
}

function closeReviewComposer() {
  if (reviewComposerOverlay) {
    reviewComposerOverlay.classList.remove('active');
  }
}

function openFoodPicker() {
  if (foodPickerOverlay) {
    foodPickerOverlay.classList.add('active');
  }

  loadFoodPickerItems();
}

function closeFoodPicker() {
  if (foodPickerOverlay) {
    foodPickerOverlay.classList.remove('active');
  }
}

function loadFoodPickerItems() {
  const queryString = buildFoodPickerQueryString();

  if (foodPickerList) {
    foodPickerList.innerHTML = `
      <div class="food-picker-loading">
        Loading food items...
      </div>
    `;
  }

  fetch(`/api/reviews/menu-options${queryString}`)
    .then((response) => response.json())
    .then((result) => {
      displayFoodPickerItems(result.data || []);
    })
    .catch((error) => {
      console.error('Error loading food picker items:', error);

      if (foodPickerList) {
        foodPickerList.innerHTML = `
          <div class="food-picker-empty">
            Unable to load food items.
          </div>
        `;
      }
    });
}

function buildFoodPickerQueryString() {
  const params = new URLSearchParams();

  const search = foodPickerSearchInput
    ? foodPickerSearchInput.value.trim()
    : '';
  const foodCourt = foodPickerFoodCourtFilter
    ? foodPickerFoodCourtFilter.value
    : 'all';
  const category = foodPickerCategoryFilter
    ? foodPickerCategoryFilter.value
    : 'all';

  if (search) {
    params.append('search', search);
  }

  if (foodCourt && foodCourt !== 'all') {
    params.append('foodCourt', foodCourt);
  }

  if (category && category !== 'all') {
    params.append('category', category);
  }

  params.append('sort', 'popular');

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}

function displayFoodPickerItems(items) {
  if (!foodPickerList) {
    return;
  }

  if (items.length === 0) {
    foodPickerList.innerHTML = `
      <div class="food-picker-empty">
        No food items found.
      </div>
    `;
    return;
  }

  foodPickerList.innerHTML = items
    .map((item) => {
      const selectedClass =
        selectedFoodItem && selectedFoodItem.food_id === item.food_id
          ? 'selected'
          : '';

      return `
        <button
          class="food-picker-card ${selectedClass}"
          type="button"
          data-food-id="${item.food_id}"
        >
          ${createFoodPickerImage(item)}

          <div class="food-picker-info">
            <div class="food-picker-title-row">
              <h3>${item.item_name}</h3>
              <span>✓</span>
            </div>

            <p>${item.stall_name}</p>

            <div class="food-picker-price-row">
              <strong>$${formatPrice(item.price)}</strong>
              <span>${item.category}</span>
            </div>

            <div class="food-picker-chip-row">
              ${createFoodPickerChips(item)}
            </div>
          </div>
        </button>
      `;
    })
    .join('');
}

function createFoodPickerImage(item) {
  if (!item.image_url) {
    return `
      <div class="food-picker-image food-picker-image-placeholder">
        No image
      </div>
    `;
  }

  return `
    <img
      src="${item.image_url}"
      alt="${item.item_name}"
      class="food-picker-image"
    />
  `;
}

function createFoodPickerChips(item) {
  const chips = [
    item.spice_level,
    item.protein_level,
    item.sugar_level,
  ].filter(Boolean);

  return chips
    .slice(0, 3)
    .map((chip) => {
      return `<span>${chip}</span>`;
    })
    .join('');
}

function handleFoodPickerClick(event) {
  const card = event.target.closest('.food-picker-card');

  if (!card) {
    return;
  }

  const foodId = Number(card.dataset.foodId);

  fetch(`/api/reviews/menu-options?search=${foodId}`)
    .then(() => {
      const allCards = document.querySelectorAll('.food-picker-card');

      allCards.forEach((foodCard) => {
        foodCard.classList.remove('selected');
      });

      card.classList.add('selected');
    });

  const itemName = card.querySelector('h3').textContent;
  const stallName = card.querySelector('p').textContent;
  const priceText = card.querySelector('.food-picker-price-row strong').textContent;

  selectedFoodItem = {
    food_id: foodId,
    item_name: itemName,
    stall_name: stallName,
    price: priceText,
  };

  updateSelectedFoodBox();
  closeFoodPicker();
}

function updateSelectedFoodBox() {
  if (!selectedFoodItem) {
    return;
  }

  if (selectedReviewFoodId) {
    selectedReviewFoodId.value = selectedFoodItem.food_id;
  }

  if (selectedFoodName) {
    selectedFoodName.textContent = selectedFoodItem.item_name;
  }

  if (selectedFoodMeta) {
    selectedFoodMeta.textContent =
      `${selectedFoodItem.stall_name} · ${selectedFoodItem.price}`;
  }
}

function handleStarRatingClick(event) {
  const starButton = event.target.closest('button');

  if (!starButton) {
    return;
  }

  const row = starButton.closest('.review-star-row');
  const ratingName = row.dataset.ratingName;
  const ratingValue = Number(starButton.dataset.value);

  ratingState[ratingName] = ratingValue;
  updateStarRow(row, ratingValue);
}

function updateStarRow(row, ratingValue) {
  row.querySelectorAll('button').forEach((button) => {
    const buttonValue = Number(button.dataset.value);
    const isActive = buttonValue <= ratingValue;

    button.classList.toggle('active', isActive);
    button.textContent = isActive ? '★' : '☆';
  });
}

function handleComposerTagClick(event) {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  const tag = button.dataset.tag;

  if (selectedReviewTags.includes(tag)) {
    selectedReviewTags = selectedReviewTags.filter((item) => item !== tag);
    button.classList.remove('active');
    return;
  }

  selectedReviewTags.push(tag);
  button.classList.add('active');
}

function updateReviewTextCount() {
  if (!reviewTextInput || !reviewTextCount) {
    return;
  }

  reviewTextCount.textContent = `${reviewTextInput.value.length}/500`;
}

function submitReviewForm(event) {
  event.preventDefault();

  const validationMessage = validateReviewForm();

  if (validationMessage) {
    showReviewFormMessage(validationMessage, 'error');
    return;
  }

  const reviewBody = {
    food_id: Number(selectedReviewFoodId.value),
    reviewer_name: 'Anonymous Student',
    rating: ratingState.rating,
    taste_rating: ratingState.taste_rating,
    value_rating: ratingState.value_rating,
    portion_rating: ratingState.portion_rating,
    wait_time_rating: ratingState.wait_time_rating,
    review_tags: selectedReviewTags.length > 0
      ? selectedReviewTags
      : ['General'],
    review_text: reviewTextInput.value.trim(),
    best_time_to_buy: getBestTimeFromTags(),
    review_photo_url: reviewPhotoUrlInput.value.trim(),
  };

  setSubmitState(true);

  fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewBody),
  })
    .then((response) => response.json().then((result) => {
      return {
        ok: response.ok,
        result,
      };
    }))
    .then(({ ok, result }) => {
      if (!ok) {
        throw new Error(result.message || 'Review could not be created.');
      }

      showToast('Review posted successfully.');
      closeReviewComposer();
      resetReviewForm();
      loadReviews();
    })
    .catch((error) => {
      showReviewFormMessage(error.message, 'error');
    })
    .finally(() => {
      setSubmitState(false);
    });
}

function validateReviewForm() {
  if (!selectedReviewFoodId || !selectedReviewFoodId.value) {
    return 'Please choose a food item first.';
  }

  if (ratingState.rating === 0) {
    return 'Please rate the overall experience.';
  }

  if (ratingState.taste_rating === 0) {
    return 'Please rate the taste.';
  }

  if (ratingState.value_rating === 0) {
    return 'Please rate the value.';
  }

  if (ratingState.portion_rating === 0) {
    return 'Please rate the portion.';
  }

  if (ratingState.wait_time_rating === 0) {
    return 'Please rate the wait time.';
  }

  if (!reviewTextInput || reviewTextInput.value.trim().length < 8) {
    return 'Please write at least 8 characters for the review.';
  }

  return '';
}

function getBestTimeFromTags() {
  if (selectedReviewTags.includes('Good for lunch')) {
    return 'Lunch';
  }

  if (selectedReviewTags.includes('Long queue')) {
    return 'Before peak lunch';
  }

  return 'Anytime';
}

function setSubmitState(isSubmitting) {
  if (!submitReviewBtn) {
    return;
  }

  submitReviewBtn.disabled = isSubmitting;
  submitReviewBtn.textContent = isSubmitting ? 'Posting...' : 'Post Review';
}

function showReviewFormMessage(message, type) {
  if (!reviewFormMessage) {
    return;
  }

  reviewFormMessage.textContent = message;
  reviewFormMessage.className = `review-form-message ${type}`;
}

function resetReviewForm() {
  selectedFoodItem = null;
  selectedReviewTags = [];

  Object.keys(ratingState).forEach((key) => {
    ratingState[key] = 0;
  });

  if (selectedReviewFoodId) {
    selectedReviewFoodId.value = '';
  }

  if (selectedFoodName) {
    selectedFoodName.textContent = 'No food item selected';
  }

  if (selectedFoodMeta) {
    selectedFoodMeta.textContent = 'Choose the dish you want to review.';
  }

  if (reviewTextInput) {
    reviewTextInput.value = '';
  }

  if (reviewPhotoUrlInput) {
    reviewPhotoUrlInput.value = '';
  }

  if (reviewFormMessage) {
    reviewFormMessage.textContent = '';
  }

  document.querySelectorAll('.review-star-row').forEach((row) => {
    updateStarRow(row, 0);
  });

  document.querySelectorAll('.review-composer-tags button').forEach((button) => {
    button.classList.remove('active');
  });

  updateReviewTextCount();
}

function showToast(message) {
  if (!reviewToast) {
    return;
  }

  reviewToast.textContent = message;
  reviewToast.classList.add('active');

  setTimeout(() => {
    reviewToast.classList.remove('active');
  }, 2400);
}

function showReviewError() {
  if (reviewResultCount) {
    reviewResultCount.textContent = 'Unable to load reviews.';
  }

  if (reviewList) {
    reviewList.innerHTML = `
      <div class="review-wall-empty">
        <h3>Review Hub unavailable</h3>
        <p>Please check the review backend API.</p>
      </div>
    `;
  }
}

function getInitials(name) {
  return String(name || 'SP')
    .split(' ')
    .map((part) => {
      return part[0];
    })
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

function formatDate(dateValue) {
  if (!dateValue) {
    return '2026-07';
  }

  return String(dateValue).slice(0, 10);
}