// =========================================================
// SP QuickBite - Review Hub Frontend
// Uses backend filters and review analytics API
// =========================================================

const reviewThemeToggle = document.getElementById('reviewThemeToggle');

const totalReviewCount = document.getElementById('totalReviewCount');
const averageReviewRating = document.getElementById('averageReviewRating');
const topReviewTag = document.getElementById('topReviewTag');
const topRatedDish = document.getElementById('topRatedDish');

const reviewSearchInput = document.getElementById('reviewSearchInput');
const reviewTagFilter = document.getElementById('reviewTagFilter');
const reviewFoodCourtFilter = document.getElementById('reviewFoodCourtFilter');
const reviewMinRatingFilter = document.getElementById('reviewMinRatingFilter');
const reviewSortFilter = document.getElementById('reviewSortFilter');
const clearReviewFiltersBtn = document.getElementById('clearReviewFiltersBtn');

const reviewResultCount = document.getElementById('reviewResultCount');
const reviewActiveFilters = document.getElementById('reviewActiveFilters');
const reviewList = document.getElementById('reviewList');

let reviewSearchTimer = null;
let hasLoadedFilterOptions = false;

window.addEventListener('DOMContentLoaded', () => {
  setupReviewHubEvents();
  loadReviewSummary();
  loadReviews();
});

function setupReviewHubEvents() {
  if (reviewThemeToggle) {
    reviewThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('home-dark-mode');
    });
  }

  if (reviewSearchInput) {
    reviewSearchInput.addEventListener('input', () => {
      clearTimeout(reviewSearchTimer);

      reviewSearchTimer = setTimeout(() => {
        loadReviews();
      }, 300);
    });
  }

  if (reviewTagFilter) {
    reviewTagFilter.addEventListener('change', loadReviews);
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

  if (reviewList) {
    reviewList.addEventListener('click', handleReviewCardClick);
  }
}

function loadReviewSummary() {
  fetch('/api/reviews/summary')
    .then((response) => response.json())
    .then((result) => {
      const summary = result.data;

      if (!summary) {
        return;
      }

      displayReviewSummary(summary);
    })
    .catch((error) => {
      console.error('Error loading review summary:', error);
    });
}

function loadReviews() {
  const queryString = buildReviewQueryString();

  fetch(`/api/reviews${queryString}`)
    .then((response) => response.json())
    .then((result) => {
      const reviews = result.data || [];

      if (!hasLoadedFilterOptions) {
        populateFilterOptions(reviews);
        hasLoadedFilterOptions = true;
      }

      updateReviewResultText(result.count || reviews.length);
      displayReviewCards(reviews);
    })
    .catch((error) => {
      console.error('Error loading reviews:', error);
      showReviewError();
    });
}

function buildReviewQueryString() {
  const params = new URLSearchParams();

  const search = reviewSearchInput ? reviewSearchInput.value.trim() : '';
  const tag = reviewTagFilter ? reviewTagFilter.value : 'all';
  const foodCourt = reviewFoodCourtFilter ? reviewFoodCourtFilter.value : 'all';
  const minRating = reviewMinRatingFilter ? reviewMinRatingFilter.value : '';
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

  if (minRating) {
    params.append('minRating', minRating);
  }

  if (sort && sort !== 'newest') {
    params.append('sort', sort);
  }

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}

function displayReviewSummary(summary) {
  if (totalReviewCount) {
    totalReviewCount.textContent = summary.total_reviews || 0;
  }

  if (averageReviewRating) {
    averageReviewRating.textContent = formatRating(summary.average_rating);
  }

  if (topReviewTag) {
    topReviewTag.textContent = summary.top_tag
      ? summary.top_tag.review_tag
      : 'None';
  }

  if (topRatedDish) {
    topRatedDish.textContent = summary.top_dish
      ? `${summary.top_dish.item_name} · ${summary.top_dish.stall_name}`
      : 'None yet';
  }
}

function populateFilterOptions(reviews) {
  populateReviewTagOptions(reviews);
  populateFoodCourtOptions(reviews);
}

function populateReviewTagOptions(reviews) {
  if (!reviewTagFilter) {
    return;
  }

  const tags = [...new Set(reviews.map((review) => {
    return review.review_tag || 'General';
  }))].sort();

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
}

function populateFoodCourtOptions(reviews) {
  if (!reviewFoodCourtFilter) {
    return;
  }

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

function updateReviewResultText(count) {
  if (reviewResultCount) {
    reviewResultCount.textContent = `${count} student reviews found`;
  }

  if (reviewActiveFilters) {
    reviewActiveFilters.textContent = getActiveFilterText();
  }
}

function getActiveFilterText() {
  const activeFilters = [];

  if (reviewSearchInput && reviewSearchInput.value.trim()) {
    activeFilters.push(`Search: ${reviewSearchInput.value.trim()}`);
  }

  if (reviewTagFilter && reviewTagFilter.value !== 'all') {
    activeFilters.push(`Tag: ${reviewTagFilter.value}`);
  }

  if (reviewFoodCourtFilter && reviewFoodCourtFilter.value !== 'all') {
    activeFilters.push(`Food court: ${reviewFoodCourtFilter.value}`);
  }

  if (reviewMinRatingFilter && reviewMinRatingFilter.value) {
    activeFilters.push(`Rating: ${reviewMinRatingFilter.value}+`);
  }

  if (reviewSortFilter && reviewSortFilter.value !== 'newest') {
    activeFilters.push(`Sort: ${reviewSortFilter.value}`);
  }

  if (activeFilters.length === 0) {
    return 'Showing latest reviews from the backend';
  }

  return activeFilters.join(' · ');
}

function displayReviewCards(reviews) {
  if (!reviewList) {
    return;
  }

  if (reviews.length === 0) {
    reviewList.innerHTML = `
      <div class="review-empty-state">
        <span>🔎</span>
        <h3>No reviews found</h3>
        <p>Try changing the backend filters or clearing your search.</p>
      </div>
    `;
    return;
  }

  reviewList.innerHTML = reviews
    .map((review) => {
      return `
        <article class="student-review-card">
          <div class="student-review-image-wrap">
            ${
              review.image_url
                ? `<img
                    src="${review.image_url}"
                    alt="${review.item_name}"
                    class="student-review-image"
                  />`
                : `<div class="student-review-placeholder">
                    No image
                  </div>`
            }
          </div>

          <div class="student-review-content">
            <div class="student-review-top-row">
              <span class="student-review-tag">
                ${review.review_tag || 'General'}
              </span>

              <span class="student-review-rating">
                ★ ${formatRating(review.rating)}
              </span>
            </div>

            <h3>${review.item_name}</h3>

            <p class="student-review-stall">
              ${review.stall_name} · ${review.foodcourt_name}
            </p>

            <p class="student-review-text">
              “${review.review_text}”
            </p>

            <div class="student-review-footer">
              <div>
                <strong>${review.reviewer_name}</strong>
                <span>Best time: ${review.best_time_to_buy}</span>
              </div>

              <button
                class="student-review-view-btn"
                type="button"
                data-stall-id="${review.stall_id}"
              >
                View Menu
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function handleReviewCardClick(event) {
  const viewButton = event.target.closest('.student-review-view-btn');

  if (!viewButton) {
    return;
  }

  const stallId = viewButton.dataset.stallId;

  if (stallId) {
    window.location.href = `./stall-detail.html?stall_id=${stallId}`;
  }
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

  loadReviews();
}

function showReviewError() {
  if (reviewResultCount) {
    reviewResultCount.textContent = 'Unable to load reviews.';
  }

  if (reviewActiveFilters) {
    reviewActiveFilters.textContent = 'Please check the Review Hub backend API.';
  }

  if (reviewList) {
    reviewList.innerHTML = `
      <div class="review-empty-state">
        <span>⚠️</span>
        <h3>Review Hub unavailable</h3>
        <p>Please check the review API and try again.</p>
      </div>
    `;
  }
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}