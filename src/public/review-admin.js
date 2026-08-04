const adminRefreshBtn = document.getElementById('adminRefreshBtn');
const toggleInsightsBtn = document.getElementById('toggleInsightsBtn');
const adminInsightsPanel = document.getElementById('adminInsightsPanel');

const adminTotalReviews = document.getElementById('adminTotalReviews');
const adminAverageRating = document.getElementById('adminAverageRating');
const adminHelpfulCount = document.getElementById('adminHelpfulCount');
const adminPhotoCount = document.getElementById('adminPhotoCount');

const adminRatingPie = document.getElementById('adminRatingPie');
const adminStallBars = document.getElementById('adminStallBars');

const adminSearchInput = document.getElementById('adminSearchInput');
const adminRatingFilter = document.getElementById('adminRatingFilter');
const adminStatusText = document.getElementById('adminStatusText');
const adminReviewList = document.getElementById('adminReviewList');

const selectedReviewEmpty = document.getElementById('selectedReviewEmpty');
const selectedReviewEditor = document.getElementById('selectedReviewEditor');
const selectedReviewImage = document.getElementById('selectedReviewImage');
const selectedReviewFoodName = document.getElementById('selectedReviewFoodName');
const selectedReviewMeta = document.getElementById('selectedReviewMeta');

const adminHelpfulSelectedBtn = document.getElementById('adminHelpfulSelectedBtn');
const adminDeleteSelectedBtn = document.getElementById('adminDeleteSelectedBtn');

const editReviewForm = document.getElementById('editReviewForm');
const editReviewId = document.getElementById('editReviewId');

const editRating = document.getElementById('editRating');
const editTasteRating = document.getElementById('editTasteRating');
const editValueRating = document.getElementById('editValueRating');
const editPortionRating = document.getElementById('editPortionRating');
const editWaitTimeRating = document.getElementById('editWaitTimeRating');
const editBestTime = document.getElementById('editBestTime');
const editReviewTags = document.getElementById('editReviewTags');
const editPhotoUrl = document.getElementById('editPhotoUrl');
const editReviewText = document.getElementById('editReviewText');
const editReviewMessage = document.getElementById('editReviewMessage');
const resetEditReviewBtn = document.getElementById('resetEditReviewBtn');

const overallRatingPreview = document.getElementById('overallRatingPreview');
const overallRatingStars = document.getElementById('overallRatingStars');

const tasteRatingText = document.getElementById('tasteRatingText');
const valueRatingText = document.getElementById('valueRatingText');
const portionRatingText = document.getElementById('portionRatingText');
const waitRatingText = document.getElementById('waitRatingText');

const editTagChoices = document.getElementById('editTagChoices');

const deleteReviewModal = document.getElementById('deleteReviewModal');
const deleteReviewImage = document.getElementById('deleteReviewImage');
const deleteReviewTitle = document.getElementById('deleteReviewTitle');
const deleteReviewMeta = document.getElementById('deleteReviewMeta');
const cancelDeleteReviewBtn = document.getElementById('cancelDeleteReviewBtn');
const confirmDeleteReviewBtn = document.getElementById('confirmDeleteReviewBtn');

const REVIEW_TAG_OPTIONS = [
  'Worth it',
  'Large portion',
  'Spicy',
  'Cheap',
  'Long queue',
  'Good for lunch',
  'Comfort food',
  'Healthy choice',
  'Can improve',
];

let adminReviews = [];
let selectedReviewId = null;
let searchTimer = null;
let insightsOpen = false;
let selectedAdminTags = [];
let reviewPendingDelete = null;

window.addEventListener('DOMContentLoaded', () => {
  setupAdminEvents();
  loadAdminDashboard();
});

function setupAdminEvents() {
  if (adminRefreshBtn) {
    adminRefreshBtn.addEventListener('click', loadAdminDashboard);
  }

  if (toggleInsightsBtn) {
    toggleInsightsBtn.addEventListener('click', toggleInsightsPanel);
  }

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        selectedReviewId = null;
        loadAdminReviews();
      }, 250);
    });
  }

  if (adminRatingFilter) {
    adminRatingFilter.addEventListener('change', () => {
      selectedReviewId = null;
      loadAdminReviews();
    });
  }

  if (adminReviewList) {
    adminReviewList.addEventListener('click', handleReviewListClick);
  }

  if (adminHelpfulSelectedBtn) {
    adminHelpfulSelectedBtn.addEventListener('click', () => {
      if (selectedReviewId) {
        markReviewHelpful(selectedReviewId);
      }
    });
  }

  if (adminDeleteSelectedBtn) {
    adminDeleteSelectedBtn.addEventListener('click', () => {
      if (selectedReviewId) {
        openDeleteModal(selectedReviewId);
      }
    });
  }

  if (editReviewForm) {
    editReviewForm.addEventListener('submit', handleEditReviewSubmit);
  }

  if (resetEditReviewBtn) {
    resetEditReviewBtn.addEventListener('click', () => {
      if (selectedReviewId) {
        renderSelectedReview(selectedReviewId);
      }
    });
  }

  if (cancelDeleteReviewBtn) {
    cancelDeleteReviewBtn.addEventListener('click', closeDeleteModal);
  }

  if (confirmDeleteReviewBtn) {
    confirmDeleteReviewBtn.addEventListener('click', confirmDeleteReview);
  }

  if (deleteReviewModal) {
    deleteReviewModal.addEventListener('click', (event) => {
      if (
        event.target === deleteReviewModal ||
        event.target.classList.contains('admin-delete-backdrop')
      ) {
        closeDeleteModal();
      }
    });
  }

  document.addEventListener('click', handleAdminEditorChoiceClick);
}

function toggleInsightsPanel() {
  insightsOpen = !insightsOpen;

  if (adminInsightsPanel) {
    adminInsightsPanel.classList.toggle('hidden', !insightsOpen);
  }

  if (toggleInsightsBtn) {
    toggleInsightsBtn.textContent = insightsOpen ? 'Hide Diagrams' : 'Show Diagrams';
  }
}

async function loadAdminDashboard() {
  await loadAdminSummary();
  await loadAdminReviews();
}

async function loadAdminSummary() {
  try {
    const response = await fetch('/api/admin/reviews/summary');
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to load summary.');
    }

    const summary = result.data;

    if (adminTotalReviews) {
      adminTotalReviews.textContent = summary.total_reviews;
    }

    if (adminAverageRating) {
      adminAverageRating.textContent = formatRating(summary.average_rating);
    }

    if (adminHelpfulCount) {
      adminHelpfulCount.textContent = summary.total_helpful_count;
    }

    if (adminPhotoCount) {
      adminPhotoCount.textContent = summary.photo_review_count;
    }

    renderRatingPie(summary.rating_breakdown || []);
    renderStallBars(summary.reviews_by_stall || []);
  } catch (error) {
    console.error('Error loading admin summary:', error);

    if (adminRatingPie) {
      adminRatingPie.textContent = 'Unable to load rating chart.';
    }

    if (adminStallBars) {
      adminStallBars.textContent = 'Unable to load stall chart.';
    }
  }
}

async function loadAdminReviews() {
  const params = new URLSearchParams();

  const searchValue = adminSearchInput ? adminSearchInput.value.trim() : '';
  const ratingValue = adminRatingFilter ? adminRatingFilter.value : 'all';

  if (searchValue) {
    params.set('search', searchValue);
  }

  if (ratingValue && ratingValue !== 'all') {
    params.set('rating', ratingValue);
  }

  const url = params.toString()
    ? `/api/admin/reviews?${params.toString()}`
    : '/api/admin/reviews';

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to load admin reviews.');
    }

    adminReviews = result.data || [];

    if (
      selectedReviewId &&
      !adminReviews.some((review) => Number(review.review_id) === Number(selectedReviewId))
    ) {
      selectedReviewId = null;
    }

    if (!selectedReviewId && adminReviews.length > 0) {
      selectedReviewId = Number(adminReviews[0].review_id);
    }

    renderAdminReviews(adminReviews);
    renderSelectedReview(selectedReviewId);
  } catch (error) {
    console.error('Error loading admin reviews:', error);

    if (adminStatusText) {
      adminStatusText.textContent = 'Unable to load reviews.';
    }

    if (adminReviewList) {
      adminReviewList.innerHTML = `
        <div class="review-admin-empty">
          Unable to load reviews. Please check the admin API.
        </div>
      `;
    }

    renderSelectedReview(null);
  }
}

function renderRatingPie(breakdown) {
  if (!adminRatingPie) {
    return;
  }

  const total = breakdown.reduce((sum, row) => {
    return sum + Number(row.review_count || 0);
  }, 0);

  if (total === 0) {
    adminRatingPie.innerHTML = `
      <div class="review-admin-empty">
        No rating data yet.
      </div>
    `;
    return;
  }

  let currentPercent = 0;

  const colors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#94a3b8',
  ];

  const gradientParts = breakdown.map((row, index) => {
    const value = Number(row.review_count || 0);
    const percent = (value / total) * 100;
    const start = currentPercent;
    const end = currentPercent + percent;

    currentPercent = end;

    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  const legendHtml = breakdown
    .map((row, index) => {
      const value = Number(row.review_count || 0);
      const percent = total === 0 ? 0 : Math.round((value / total) * 100);

      return `
        <div class="review-admin-pie-legend-item">
          <span style="background: ${colors[index % colors.length]}"></span>
          <p>${escapeHtml(row.label)}</p>
          <strong>${value}</strong>
          <em>${percent}%</em>
        </div>
      `;
    })
    .join('');

  adminRatingPie.innerHTML = `
    <div
      class="review-admin-pie-circle"
      style="background: conic-gradient(${gradientParts.join(', ')})"
      aria-label="Rating breakdown pie chart"
    >
      <div>
        <strong>${total}</strong>
        <span>reviews</span>
      </div>
    </div>

    <div class="review-admin-pie-legend">
      ${legendHtml}
    </div>
  `;
}

function renderStallBars(stalls) {
  if (!adminStallBars) {
    return;
  }

  if (!stalls || stalls.length === 0) {
    adminStallBars.innerHTML = `
      <div class="review-admin-empty">
        No stall review data yet.
      </div>
    `;
    return;
  }

  const maxCount = Math.max(
    ...stalls.map((stall) => Number(stall.review_count || 0)),
    1
  );

  adminStallBars.innerHTML = stalls
    .map((stall) => {
      const reviewCount = Number(stall.review_count || 0);
      const width = Math.max(6, Math.round((reviewCount / maxCount) * 100));

      return `
        <div class="review-admin-bar-row">
          <div class="review-admin-bar-label">
            <strong>${escapeHtml(stall.stall_name)}</strong>
            <span>${formatRating(stall.average_rating)} average</span>
          </div>

          <div class="review-admin-bar-track">
            <div class="review-admin-bar-fill" style="width: ${width}%"></div>
          </div>

          <span class="review-admin-bar-value">
            ${reviewCount}
          </span>
        </div>
      `;
    })
    .join('');
}

function renderAdminReviews(reviews) {
  if (!adminReviewList) {
    return;
  }

  if (adminStatusText) {
    adminStatusText.textContent = `${reviews.length} review${reviews.length === 1 ? '' : 's'} found`;
  }

  if (!reviews || reviews.length === 0) {
    adminReviewList.innerHTML = `
      <div class="review-admin-empty">
        No reviews match the current search or filter.
      </div>
    `;

    return;
  }

  adminReviewList.innerHTML = reviews
    .map((review) => {
      const isActive = Number(review.review_id) === Number(selectedReviewId);
      const imageUrl = getReviewImageUrl(review);

      return `
        <article class="review-admin-mini-card ${isActive ? 'active' : ''}" data-review-id="${review.review_id}">
          <div class="review-mini-thumb">
            ${
              imageUrl
                ? `<img src="${imageUrl}" alt="${escapeHtml(review.item_name)}" />`
                : `<span>No image</span>`
            }
          </div>

          <div class="review-admin-mini-main">
            <div class="review-admin-mini-top">
              <strong>${escapeHtml(review.item_name)}</strong>
              <span>${formatRating(review.rating)}</span>
            </div>

            <p>${escapeHtml(review.stall_name)} - ${escapeHtml(review.foodcourt_name)}</p>

            <small>
              ${escapeHtml(truncateText(review.review_text, 60))}
            </small>
          </div>

          <button
            class="review-admin-mini-delete"
            type="button"
            data-action="delete"
            data-review-id="${review.review_id}"
          >
            Delete
          </button>
        </article>
      `;
    })
    .join('');
}

function renderSelectedReview(reviewId) {
  const review = adminReviews.find((item) => {
    return Number(item.review_id) === Number(reviewId);
  });

  if (!review) {
    selectedAdminTags = [];

    if (selectedReviewEmpty) {
      selectedReviewEmpty.classList.remove('hidden');
    }

    if (selectedReviewEditor) {
      selectedReviewEditor.classList.add('hidden');
    }

    return;
  }

  selectedReviewId = Number(review.review_id);

  if (selectedReviewEmpty) {
    selectedReviewEmpty.classList.add('hidden');
  }

  if (selectedReviewEditor) {
    selectedReviewEditor.classList.remove('hidden');
  }

  const imageUrl = getReviewImageUrl(review);

  if (selectedReviewImage) {
    if (imageUrl) {
      selectedReviewImage.innerHTML = `
        <img src="${imageUrl}" alt="${escapeHtml(review.item_name)}" />
      `;
    } else {
      selectedReviewImage.innerHTML = 'No image';
    }
  }

  if (selectedReviewFoodName) {
    selectedReviewFoodName.textContent = review.item_name || 'Food item';
  }

  if (selectedReviewMeta) {
    selectedReviewMeta.textContent = `${review.stall_name || 'Stall'} - ${review.foodcourt_name || 'Food court'}`;
  }

  editReviewId.value = review.review_id;
  editBestTime.value = review.best_time_to_buy || 'Anytime';
  editPhotoUrl.value = review.review_photo_url || '';
  editReviewText.value = review.review_text || '';

  setAdminRatingsFromReview(review);

  selectedAdminTags = getReviewTagsFromReview(review);
  renderAdminTagChoices();

  if (editReviewMessage) {
    editReviewMessage.textContent = '';
  }

  renderAdminReviews(adminReviews);
}

function handleReviewListClick(event) {
  const deleteButton = event.target.closest('[data-action="delete"]');

  if (deleteButton) {
    event.stopPropagation();
    openDeleteModal(Number(deleteButton.dataset.reviewId));
    return;
  }

  const selectedCard = event.target.closest('.review-admin-mini-card');

  if (!selectedCard) {
    return;
  }

  selectedReviewId = Number(selectedCard.dataset.reviewId);
  renderSelectedReview(selectedReviewId);
}

function handleAdminEditorChoiceClick(event) {
  const starButton = event.target.closest('[data-star-field][data-star-value]');

  if (starButton) {
    const field = starButton.dataset.starField;
    const value = Number(starButton.dataset.starValue);

    setAdminStarRating(field, value);
    updateAdminOverallRating();
    return;
  }

  const tagButton = event.target.closest('[data-admin-review-tag]');

  if (tagButton) {
    const tag = tagButton.dataset.adminReviewTag;

    if (selectedAdminTags.includes(tag)) {
      selectedAdminTags = selectedAdminTags.filter((item) => {
        return item !== tag;
      });
    } else {
      selectedAdminTags.push(tag);
    }

    renderAdminTagChoices();
  }
}

function getAdminRatingInput(field) {
  if (field === 'taste') {
    return editTasteRating;
  }

  if (field === 'value') {
    return editValueRating;
  }

  if (field === 'portion') {
    return editPortionRating;
  }

  if (field === 'wait') {
    return editWaitTimeRating;
  }

  return null;
}

function getAdminRatingText(field) {
  if (field === 'taste') {
    return tasteRatingText;
  }

  if (field === 'value') {
    return valueRatingText;
  }

  if (field === 'portion') {
    return portionRatingText;
  }

  if (field === 'wait') {
    return waitRatingText;
  }

  return null;
}

function setAdminStarRating(field, rating) {
  const input = getAdminRatingInput(field);
  const text = getAdminRatingText(field);

  if (!input || !text) {
    return;
  }

  const cleanRating = Math.max(1, Math.min(5, Number(rating || 1)));

  input.value = cleanRating.toFixed(1);
  text.textContent = cleanRating.toFixed(1);

  document.querySelectorAll(`[data-star-field="${field}"]`).forEach((button) => {
    const starValue = Number(button.dataset.starValue);
    button.classList.toggle('active', starValue <= cleanRating);
  });
}

function updateAdminOverallRating() {
  const taste = Number(editTasteRating.value || 0);
  const value = Number(editValueRating.value || 0);
  const portion = Number(editPortionRating.value || 0);
  const wait = Number(editWaitTimeRating.value || 0);

  const overall = (taste + value + portion + wait) / 4;
  const cleanOverall = Number(overall || 0).toFixed(1);

  editRating.value = cleanOverall;

  if (overallRatingPreview) {
    overallRatingPreview.textContent = cleanOverall;
  }

  renderOverallStars(Number(cleanOverall));
}

function renderOverallStars(rating) {
  if (!overallRatingStars) {
    return;
  }

  const roundedRating = Math.round(Number(rating || 0));

  overallRatingStars.innerHTML = [1, 2, 3, 4, 5]
    .map((starValue) => {
      return `<span class="${starValue <= roundedRating ? 'active' : ''}">&#9733;</span>`;
    })
    .join('');
}

function getReviewTagsFromReview(review) {
  if (Array.isArray(review.review_tags)) {
    return review.review_tags.filter((tag) => {
      return String(tag || '').trim().length > 0;
    });
  }

  if (review.review_tag) {
    return [review.review_tag];
  }

  return [];
}

function renderAdminTagChoices() {
  if (!editTagChoices || !editReviewTags) {
    return;
  }

  const allTags = [...new Set([...REVIEW_TAG_OPTIONS, ...selectedAdminTags])];

  editTagChoices.innerHTML = allTags
    .map((tag) => {
      const isActive = selectedAdminTags.includes(tag);

      return `
        <button
          class="admin-tag-choice ${isActive ? 'active' : ''}"
          type="button"
          data-admin-review-tag="${escapeHtml(tag)}"
        >
          ${escapeHtml(tag)}
        </button>
      `;
    })
    .join('');

  editReviewTags.value = selectedAdminTags.join(', ');
}

function setAdminRatingsFromReview(review) {
  setAdminStarRating('taste', Number(review.taste_rating || 1));
  setAdminStarRating('value', Number(review.value_rating || 1));
  setAdminStarRating('portion', Number(review.portion_rating || 1));
  setAdminStarRating('wait', Number(review.wait_time_rating || 1));

  updateAdminOverallRating();
}

async function handleEditReviewSubmit(event) {
  event.preventDefault();

  const reviewId = Number(editReviewId.value);
  const reviewText = editReviewText.value.trim();

  updateAdminOverallRating();
  renderAdminTagChoices();

  if (reviewText.length < 8) {
    setEditorMessage('Review text must be at least 8 characters.');
    return;
  }

  const payload = {
    rating: Number(editRating.value),
    taste_rating: Number(editTasteRating.value),
    value_rating: Number(editValueRating.value),
    portion_rating: Number(editPortionRating.value),
    wait_time_rating: Number(editWaitTimeRating.value),
    review_text: reviewText,
    review_tags: editReviewTags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
    best_time_to_buy: editBestTime.value.trim() || 'Anytime',
    review_photo_url: editPhotoUrl.value.trim(),
  };

  try {
    setEditorMessage('Saving review...');

    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to update review.');
    }

    setEditorMessage('Review updated. Connected ratings recalculated.');
    await loadAdminDashboard();
  } catch (error) {
    console.error('Error updating review:', error);
    setEditorMessage(error.message || 'Unable to update review.');
  }
}

async function markReviewHelpful(reviewId) {
  try {
    const response = await fetch(`/api/admin/reviews/${reviewId}/helpful`, {
      method: 'PATCH',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to update helpful count.');
    }

    await loadAdminDashboard();
  } catch (error) {
    console.error('Error marking review helpful:', error);
    alert(error.message || 'Unable to update helpful count.');
  }
}

function openDeleteModal(reviewId) {
  const review = adminReviews.find((item) => {
    return Number(item.review_id) === Number(reviewId);
  });

  if (!review || !deleteReviewModal) {
    return;
  }

  reviewPendingDelete = review;

  const imageUrl = getReviewImageUrl(review);

  if (deleteReviewImage) {
    deleteReviewImage.innerHTML = imageUrl
      ? `<img src="${imageUrl}" alt="${escapeHtml(review.item_name)}" />`
      : 'No image';
  }

  if (deleteReviewTitle) {
    deleteReviewTitle.textContent = review.item_name || 'Selected review';
  }

  if (deleteReviewMeta) {
    deleteReviewMeta.textContent = `${review.stall_name || 'Stall'} - ${review.foodcourt_name || 'Food court'}`;
  }

  deleteReviewModal.classList.remove('hidden');
}

function closeDeleteModal() {
  reviewPendingDelete = null;

  if (deleteReviewModal) {
    deleteReviewModal.classList.add('hidden');
  }
}

async function confirmDeleteReview() {
  if (!reviewPendingDelete) {
    return;
  }

  const reviewId = Number(reviewPendingDelete.review_id);

  try {
    if (confirmDeleteReviewBtn) {
      confirmDeleteReviewBtn.textContent = 'Deleting...';
      confirmDeleteReviewBtn.disabled = true;
    }

    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to delete review.');
    }

    if (Number(selectedReviewId) === reviewId) {
      selectedReviewId = null;
    }

    closeDeleteModal();
    await loadAdminDashboard();
  } catch (error) {
    console.error('Error deleting review:', error);
    alert(error.message || 'Unable to delete review.');
  } finally {
    if (confirmDeleteReviewBtn) {
      confirmDeleteReviewBtn.textContent = 'Delete Review';
      confirmDeleteReviewBtn.disabled = false;
    }
  }
}

function getReviewImageUrl(review) {
  return review.review_photo_url || review.image_url || '';
}

function setEditorMessage(message) {
  if (editReviewMessage) {
    editReviewMessage.textContent = message;
  }
}

function formatRating(value) {
  return Number(value || 0).toFixed(1);
}

function truncateText(value, maxLength) {
  const text = String(value || '');

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}