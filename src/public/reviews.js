// =========================================================
// SP QuickBite - Review Wall Frontend
// Smooth UX: cached reviews, request cancelling, loading states
// =========================================================

const reviewSearchInput = document.getElementById('reviewSearchInput');
const reviewTagFilter = document.getElementById('reviewTagFilter');
const reviewFoodCourtFilter = document.getElementById('reviewFoodCourtFilter');
const reviewSortFilter = document.getElementById('reviewSortFilter');
const reviewResultCount = document.getElementById('reviewResultCount');
const reviewList = document.getElementById('reviewList');

const reviewCacheKey = 'spQuickBiteReviewHubCache';

let reviewSearchTimer = null;
let hasLoadedFilterOptions = false;
let selectedMinRating = '';
let selectedTagChip = 'all';
let latestRequestId = 0;
let reviewAbortController = null;

window.addEventListener('DOMContentLoaded', () => {
  setupReviewWallEvents();
  showCachedReviews();
  loadReviews({ isInitialLoad: true });
});

function setupReviewWallEvents() {
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
      updateTagChips();
      loadReviews();
    });
  }

  if (reviewFoodCourtFilter) {
    reviewFoodCourtFilter.addEventListener('change', loadReviews);
  }

  if (reviewSortFilter) {
    reviewSortFilter.addEventListener('change', loadReviews);
  }

  document.querySelectorAll('.review-rating-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedMinRating = chip.dataset.rating || '';
      updateRatingChips();
      loadReviews();
    });
  });

  document.querySelectorAll('.review-tag-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      selectedTagChip = chip.dataset.tag || 'all';

      if (reviewTagFilter) {
        reviewTagFilter.value = selectedTagChip;
      }

      updateTagChips();
      loadReviews();
    });
  });

  if (reviewList) {
    reviewList.addEventListener('click', handleReviewCardClick);
    reviewList.addEventListener('error', handleReviewImageError, true);
  }
}

function showCachedReviews() {
  const cachedReviews = getCachedReviews();

  if (!cachedReviews || cachedReviews.length === 0) {
    return;
  }

  if (reviewResultCount) {
    reviewResultCount.textContent = `${cachedReviews.length} reviews`;
  }

  populateFilterOptions(cachedReviews);
  hasLoadedFilterOptions = true;
  displayReviewCards(cachedReviews, false);
}

function loadReviews(options = {}) {
  const queryString = buildReviewQueryString();
  const requestId = latestRequestId + 1;

  latestRequestId = requestId;

  if (reviewAbortController) {
    reviewAbortController.abort();
  }

  reviewAbortController = new AbortController();

  const hasCardsAlready =
    reviewList && reviewList.querySelector('.review-wall-card');

  if (options.isInitialLoad && !hasCardsAlready) {
    showReviewSkeleton();
  } else {
    setReviewUpdatingState(true);
  }

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
      if (requestId !== latestRequestId) {
        return;
      }

      const reviews = result.data || [];

      if (!hasLoadedFilterOptions) {
        populateFilterOptions(reviews);
        hasLoadedFilterOptions = true;
      }

      saveCachedReviews(reviews);

      if (reviewResultCount) {
        reviewResultCount.textContent = `${reviews.length} reviews`;
      }

      displayReviewCards(reviews, true);
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Error loading reviews:', error);
      showReviewError();
    })
    .finally(() => {
      if (requestId === latestRequestId) {
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

  if (search) {
    params.append('search', search);
  }

  if (tag && tag !== 'all') {
    params.append('tag', tag);
  }

  if (foodCourt && foodCourt !== 'all') {
    params.append('foodCourt', foodCourt);
  }

  if (selectedMinRating) {
    params.append('minRating', selectedMinRating);
  }

  if (sort && sort !== 'newest') {
    params.append('sort', sort);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}

function populateFilterOptions(reviews) {
  populateTagSelect(reviews);
  populateFoodCourtSelect(reviews);
}

function populateTagSelect(reviews) {
  if (!reviewTagFilter) {
    return;
  }

  const currentValue = reviewTagFilter.value || 'all';

  const tags = [...new Set(reviews.map((review) => {
    return review.review_tag || 'General';
  }))].sort();

  reviewTagFilter.innerHTML = `
    <option value="all">All</option>
  `;

  tags.forEach((tag) => {
    reviewTagFilter.innerHTML += `
      <option value="${tag}">
        ${tag}
      </option>
    `;
  });

  reviewTagFilter.value = currentValue;
}

function populateFoodCourtSelect(reviews) {
  if (!reviewFoodCourtFilter) {
    return;
  }

  const currentValue = reviewFoodCourtFilter.value || 'all';
  const foodCourts = [];
  const addedFoodCourtIds = new Set();

  reviews.forEach((review) => {
    if (!addedFoodCourtIds.has(review.foodcourt_id)) {
      foodCourts.push({
        foodcourt_id: review.foodcourt_id,
        foodcourt_name: review.foodcourt_name,
      });

      addedFoodCourtIds.add(review.foodcourt_id);
    }
  });

  foodCourts.sort((a, b) => {
    return Number(a.foodcourt_id) - Number(b.foodcourt_id);
  });

  reviewFoodCourtFilter.innerHTML = `
    <option value="all">All</option>
  `;

  foodCourts.forEach((foodCourt) => {
    reviewFoodCourtFilter.innerHTML += `
      <option value="FC${foodCourt.foodcourt_id}">
        FC${foodCourt.foodcourt_id}
      </option>
    `;
  });

  reviewFoodCourtFilter.value = currentValue;
}

function displayReviewCards(reviews, shouldAnimate) {
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

  reviewList.classList.add('review-wall-switching');

  window.requestAnimationFrame(() => {
    reviewList.innerHTML = reviews
      .map((review, index) => {
        const animationClass = shouldAnimate ? 'animated-review-card' : '';
        const animationDelay = shouldAnimate ? `style="animation-delay: ${index * 0.035}s"` : '';

        return `
          <article class="review-wall-card ${animationClass}" ${animationDelay}>
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

            <div class="review-wall-metrics">
              <span>Taste ${getMetricValue(review.rating)}</span>
              <span>Value ${getValueMetric(review.rating)}</span>
              <span>Portion ${getPortionMetric(review.rating)}</span>
              <span>Wait ${getWaitMetric(review.best_time_to_buy)}</span>
            </div>

            <div class="review-wall-tags">
              <span>${review.review_tag || 'General'}</span>
              <span>${getPriceTag(review.price)}</span>
              <span>${getBestTimeTag(review.best_time_to_buy)}</span>
            </div>

            <div class="review-wall-actions">
              <button
                class="review-wall-helpful"
                type="button"
                data-helpful-count="${getHelpfulCount(review.review_id)}"
              >
                ♡ Helpful · ${getHelpfulCount(review.review_id)}
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

    reviewList.classList.remove('review-wall-switching');
  });
}

function createReviewImage(review) {
  if (!review.image_url) {
    return `<div class="review-wall-image-space"></div>`;
  }

  return `
    <div class="review-wall-image-wrap">
      <img
        src="${review.image_url}"
        alt="${review.item_name}"
        class="review-wall-food-image"
        loading="lazy"
        decoding="async"
      />
    </div>
  `;
}

function handleReviewCardClick(event) {
  const helpfulButton = event.target.closest('.review-wall-helpful');

  if (helpfulButton) {
    toggleHelpfulButton(helpfulButton);
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

function showReviewSkeleton() {
  if (!reviewList) {
    return;
  }

  if (reviewResultCount) {
    reviewResultCount.textContent = 'Loading reviews...';
  }

  reviewList.innerHTML = Array.from({ length: 9 })
    .map((_, index) => {
      const tallClass = index % 3 === 0 ? 'tall' : '';
      const shortClass = index % 4 === 0 ? 'short-card' : '';

      return `
        <article class="review-wall-card review-skeleton-card ${tallClass} ${shortClass}">
          <div class="review-skeleton-top">
            <div class="review-skeleton-avatar"></div>

            <div>
              <div class="review-skeleton-line short"></div>
              <div class="review-skeleton-line tiny"></div>
            </div>
          </div>

          <div class="review-skeleton-line title"></div>
          <div class="review-skeleton-line"></div>
          <div class="review-skeleton-line"></div>
          <div class="review-skeleton-image"></div>

          <div class="review-skeleton-chip-row">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </article>
      `;
    })
    .join('');
}

function setReviewUpdatingState(isUpdating) {
  document.body.classList.toggle('review-wall-loading', isUpdating);

  if (reviewList) {
    reviewList.classList.toggle('is-updating', isUpdating);
  }

  if (reviewResultCount && isUpdating) {
    reviewResultCount.textContent = 'Updating reviews...';
  }
}

function toggleHelpfulButton(button) {
  const isLiked = button.classList.contains('liked');
  const originalCount = Number(button.dataset.helpfulCount || 0);
  const nextCount = isLiked ? originalCount : originalCount + 1;

  button.classList.toggle('liked');
  button.classList.remove('pop');

  window.requestAnimationFrame(() => {
    button.classList.add('pop');
  });

  button.textContent = isLiked
    ? `♡ Helpful · ${originalCount}`
    : `♥ Helpful · ${nextCount}`;
}

function updateRatingChips() {
  document.querySelectorAll('.review-rating-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.rating === selectedMinRating);
  });
}

function updateTagChips() {
  document.querySelectorAll('.review-tag-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.tag === selectedTagChip);
  });
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

function saveCachedReviews(reviews) {
  try {
    sessionStorage.setItem(reviewCacheKey, JSON.stringify(reviews));
  } catch (error) {
    console.warn('Review cache was not saved:', error);
  }
}

function getCachedReviews() {
  try {
    const cachedText = sessionStorage.getItem(reviewCacheKey);

    if (!cachedText) {
      return [];
    }

    return JSON.parse(cachedText);
  } catch (error) {
    console.warn('Review cache could not be loaded:', error);
    return [];
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

function formatDate(dateValue) {
  if (!dateValue) {
    return '2026-07';
  }

  return String(dateValue).slice(0, 10);
}

function getMetricValue(rating) {
  return Math.max(3, Math.round(Number(rating || 4)));
}

function getValueMetric(rating) {
  return Math.max(3, Math.round(Number(rating || 4) - 0.2));
}

function getPortionMetric(rating) {
  return Math.max(3, Math.round(Number(rating || 4)));
}

function getWaitMetric(bestTime) {
  const text = String(bestTime || '').toLowerCase();

  if (text.includes('before') || text.includes('break')) {
    return 5;
  }

  if (text.includes('lunch')) {
    return 3;
  }

  return 4;
}

function getPriceTag(price) {
  if (Number(price || 0) <= 4) {
    return 'Cheap';
  }

  return 'Worth it';
}

function getBestTimeTag(bestTime) {
  if (!bestTime) {
    return 'Good for lunch';
  }

  return bestTime;
}

function getHelpfulCount(reviewId) {
  return Number(reviewId || 1) + 6;
}