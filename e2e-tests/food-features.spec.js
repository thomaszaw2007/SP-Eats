const { test, expect } = require('@playwright/test');

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 3001}`;

async function unlockModeration(page) {
  await page.goto(`${BASE_URL}/review-admin.html`);
  await page.getByLabel('Moderator key').fill(process.env.ADMIN_ACCESS_TOKEN);
  await page.getByRole('button', { name: 'Unlock dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Review Management' })).toBeVisible();
}

async function waitForFirst(page, selector) {
  await expect(page.locator(selector).first()).toBeVisible();
}

test('opens a homepage dish and keeps a favourite across pages on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL);
  const firstCard = page.locator('.home-meal-card').first();
  await expect(firstCard).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  const name = await firstCard.getByRole('heading').textContent();
  const favourite = firstCard.getByRole('button', { name: `Favourite ${name}` });
  await favourite.click();
  await expect(favourite).toHaveAttribute('aria-pressed', 'true');
  await firstCard.getByRole('link', { name: 'View dish' }).click();
  await expect(page.getByRole('button', { name: 'Close meal details' })).toBeVisible();
  await page.getByRole('button', { name: 'Close meal details' }).click();

  await page.goto(`${BASE_URL}/quiz.html#saved-meals`);
  await expect(page.locator('#favouriteSlider')).toContainText(name);
});

async function finishQuiz(page) {
  for (let index = 0; index < 6; index += 1) {
    await page.locator('#nextQuestionBtn').click();
  }

  const recommendationRequest = page.waitForRequest((request) => {
    return request.url().endsWith('/api/quiz/recommendations') && request.method() === 'POST';
  });
  await page.locator('#nextQuestionBtn').click();
  return recommendationRequest;
}

async function createReviewThroughApi(apiRequest, label) {
  const menuResponse = await apiRequest.get(`${BASE_URL}/api/reviews/menu-options`);
  expect(menuResponse.ok()).toBe(true);
  const menuItems = (await menuResponse.json()).data;
  expect(menuItems.length).toBeGreaterThan(0);

  const reviewText = `${label}: complete CA4 browser review for the admin workflow.`;
  const response = await apiRequest.post(`${BASE_URL}/api/reviews`, {
    data: {
      food_id: menuItems[0].food_id,
      reviewer_name: label,
      rating: 4,
      taste_rating: 4,
      value_rating: 4,
      portion_rating: 4,
      wait_time_rating: 4,
      review_text: reviewText,
      review_tags: ['Worth it'],
      best_time_to_buy: 'Lunch',
    },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();

  return {
    reviewId: body.data.review.review_id,
    reviewText,
  };
}

test.describe('Browse stalls and menus - 3 key journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/stalls.html`);
    await waitForFirst(page, '#stallContainer .sd-stall-card');
  });

  test('loads connected stall cards with status, rating and menu actions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Browse Food Stalls' })).toBeVisible();
    const cards = page.locator('#stallContainer .sd-stall-card');
    expect(await cards.count()).toBeGreaterThan(0);
    await expect(cards.first().locator('.sd-status-badge')).toBeVisible();
    await expect(cards.first().locator('.sd-rating-row')).toContainText(/\d\.\d/);
    await expect(cards.first().getByRole('button', { name: 'View Menu' })).toBeVisible();
  });

  test('searches a menu-item name through the stall API and clears it', async ({ page }) => {
    const searchResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === '/api/stalls' &&
        url.searchParams.get('search') === 'Zinger Burger' &&
        response.request().method() === 'GET'
      );
    });
    await page.locator('#stallSearchInput').fill('Zinger Burger');
    expect((await searchResponse).ok()).toBe(true);
    await expect(page.locator('#stallContainer')).toContainText(/KFC/i);
    await expect(page.locator('#stallResultCount')).toContainText(/stall/);

    await page.locator('#clearStallFiltersBtn').click();
    await expect(page.locator('#stallSearchInput')).toHaveValue('');
    await expect
      .poll(() => page.locator('#stallContainer .sd-stall-card').count())
      .toBeGreaterThan(1);
  });

  test('opens a stall, searches its menu and stores cart quantity', async ({ page }) => {
    await page
      .locator('#stallContainer .sd-stall-card')
      .first()
      .getByRole('button', { name: 'View Menu' })
      .click();
    await expect(page).toHaveURL(/stall-detail\.html\?stall_id=/);
    await waitForFirst(page, '#menuContainer .menu-card');

    const firstName = (
      await page.locator('#menuContainer .menu-card h3').first().textContent()
    ).trim();
    await page.locator('#stallMenuSearch').fill(firstName);
    await expect(page.locator('#menuContainer .menu-card')).toHaveCount(1);

    await page.evaluate(() => localStorage.removeItem('spEatsCartItems'));
    const addButton = page.locator('#menuContainer .menu-add-btn').first();
    await addButton.click();
    await addButton.click();
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('spEatsCartItems')));
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });
});

test.describe('Campus food map - 3 key journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/food-map.html`);
    await waitForFirst(page, '.real-food-court-marker');
  });

  test('loads six map markers and selects the first food court', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Find Food Courts Faster' })).toBeVisible();
    await expect(page.locator('#mapMarkerCount')).toHaveText('6 food courts');
    await expect(page.locator('.real-food-court-marker')).toHaveCount(6);
    await expect(page.locator('.real-food-court-marker.active')).toHaveCount(1);
    await expect(page.locator('#selectedFoodCourtPanel h2')).toContainText('Food Court');
  });

  test('selects another marker and shows database-connected dishes', async ({ page }) => {
    const secondMarker = page.locator('.real-food-court-marker').nth(1);
    const markerLabel = (await secondMarker.locator('.real-marker-label').textContent()).trim();
    await secondMarker.click();
    await expect(secondMarker).toHaveClass(/active/);
    await expect(page.locator('#selectedFoodCourtPanel .real-selected-label')).toHaveText(
      markerLabel,
    );
    await expect(page.locator('#selectedFoodCourtPanel .real-popular-dish-list')).toBeVisible();
  });

  test('zooms the campus map and resets it to the initial scale', async ({ page }) => {
    await page.locator('#mapZoomIn').click();
    await expect(page.locator('#mapZoomCanvas')).toHaveCSS('transform', /matrix\(1\.2/);
    await expect(page.locator('#mapZoomOut')).toBeEnabled();

    await page.locator('#mapZoomReset').click();
    await expect(page.locator('#mapZoomOut')).toBeDisabled();
    await expect(page.locator('#mapZoomCanvas')).toHaveCSS('transform', /matrix\(1, 0, 0, 1/);
  });
});

test.describe('Food preference quiz - 3 key journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/quiz.html`);
    await expect(page.locator('#questionTitle')).toHaveText('What is your budget?');
  });

  test('shows seven steps, records a choice and supports back navigation', async ({ page }) => {
    await expect(page.locator('#progressDots span')).toHaveCount(7);
    await page.locator('[data-option-value="standard"]').click();
    await page.locator('#nextQuestionBtn').click();
    await expect(page.locator('#questionTitle')).toHaveText('What are you craving?');

    await page.locator('#backQuestionBtn').click();
    await expect(page.locator('#questionTitle')).toHaveText('What is your budget?');
    await expect(page.locator('[data-option-value="standard"]')).toHaveClass(/active/);
  });

  test('submits mapped answers to the recommendation API and renders matches', async ({ page }) => {
    await page.locator('[data-option-value="standard"]').click();
    const request = await finishQuiz(page);
    expect(request.postDataJSON()).toMatchObject({
      budget: 'medium',
      craving: 'rice',
      time: 'quick',
      mood: 'filling',
      spice: 'not-spicy',
      sort: 'best-match',
      limit: 8,
    });
    await expect(page.locator('#resultSection')).not.toHaveClass(/hidden/);
    await expect(page.locator('#mainRecommendation h2')).toBeVisible();
    await expect(page.locator('#mainRecommendation .qclean-match')).toContainText('%');
  });

  test('saves a recommended meal and restarts with clean quiz defaults', async ({ page }) => {
    await finishQuiz(page);
    const favouriteButton = page
      .locator('#mainRecommendation [data-save-action="favourite"]')
      .first();
    await favouriteButton.click();
    await expect(page.locator('#favouriteCount')).toHaveText('1 saved');
    const favourites = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('spEatsFavouriteMeals')),
    );
    expect(favourites).toHaveLength(1);

    await page.locator('#tryAgainBtn').click();
    await expect(page.locator('#quizSection')).not.toHaveClass(/hidden/);
    await expect(page.locator('#questionTitle')).toHaveText('What is your budget?');
    await expect(page.locator('[data-option-value="budget"]')).toHaveClass(/active/);
  });
});

test.describe('Student review hub - 3 key journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/reviews.html`);
    await waitForFirst(page, '#reviewGrid .review-card');
  });

  test('loads review cards and filters them using a real meal title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Review Hub' })).toBeVisible();
    const firstTitle = (
      await page.locator('#reviewGrid .review-food-title').first().textContent()
    ).trim();
    await page.locator('#reviewSearchInput').fill(firstTitle);
    await expect(page.locator('#reviewGrid .review-card').first()).toBeVisible();
    await expect(page.locator('#reviewGrid')).toContainText(firstTitle);
  });

  test('persists a helpful vote through the review API', async ({ page }) => {
    const button = page.locator('#reviewGrid .review-helpful-btn').first();
    const before = (await button.textContent()).trim();
    const helpfulResponse = page.waitForResponse((response) => {
      return response.url().includes('/helpful') && response.request().method() === 'PATCH';
    });
    await button.click();
    expect((await helpfulResponse).ok()).toBe(true);
    await expect(button).not.toHaveText(before);
  });

  test('creates a complete review through the modal workflow', async ({ page }) => {
    const uniqueText = `CA4 browser review ${Date.now()} with enough detail for persistence.`;
    await page.locator('#openWriteReviewBtn').click();
    await expect(page.locator('#writeReviewModal')).not.toHaveClass(/hidden/);
    await page.locator('#chooseFoodBtn').click();
    await waitForFirst(page, '#foodPickerGrid .food-picker-card');
    await page.locator('#foodPickerGrid .food-picker-card').first().click();

    for (const field of ['overall', 'taste', 'value', 'portion', 'wait_time']) {
      await page.locator(`.star-rating[data-rating-name="${field}"] .star-btn`).nth(3).click();
    }
    await page.locator('.review-tag-option[data-tag="Worth it"]').click();
    await page.locator('#reviewTextInput').fill(uniqueText);
    await expect(page.getByRole('button', { name: 'Post Review' })).toBeEnabled();

    const createResponse = page.waitForResponse((response) => {
      return response.url().endsWith('/api/reviews') && response.request().method() === 'POST';
    });
    await page.getByRole('button', { name: 'Post Review' }).click();
    expect((await createResponse).status()).toBe(201);
    await expect(page.locator('#reviewGrid')).toContainText(uniqueText);
  });
});

test.describe('Admin review management - 3 key journeys', () => {
  test('loads metrics, selectable reviews and visual insights', async ({ page }) => {
    await unlockModeration(page);
    await waitForFirst(page, '#adminReviewList .review-admin-mini-card');
    await expect(page.getByRole('heading', { name: 'Review Management' })).toBeVisible();
    await expect(page.locator('#adminTotalReviews')).not.toHaveText('0');
    await expect(page.locator('#selectedReviewEditor')).not.toHaveClass(/hidden/);

    await page.locator('#toggleInsightsBtn').click();
    await expect(page.locator('#adminInsightsPanel')).not.toHaveClass(/hidden/);
    await expect(page.locator('#adminRatingPie')).toBeVisible();
    await expect(page.locator('#adminStallBars')).toBeVisible();
  });

  test('finds an owned review and saves a valid edit', async ({ page, request }) => {
    const label = `CA4 Admin Edit ${Date.now()}`;
    const { reviewId } = await createReviewThroughApi(request, label);

    try {
      await unlockModeration(page);
      await page.locator('#adminSearchInput').fill(label);
      await expect(page.locator('#adminReviewList .review-admin-mini-card')).toHaveCount(1);

      const updatedText = `${label} was edited through the complete admin browser workflow.`;
      await page.locator('#editReviewText').fill(updatedText);
      const updateResponse = page.waitForResponse((response) => {
        return (
          response.url().endsWith(`/api/admin/reviews/${reviewId}`) &&
          response.request().method() === 'PUT'
        );
      });
      await page.getByRole('button', { name: 'Save Changes' }).click();
      expect((await updateResponse).ok()).toBe(true);
      await expect(page.locator('#editReviewText')).toHaveValue(updatedText);
    } finally {
      await request.delete(`${BASE_URL}/api/admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${process.env.ADMIN_ACCESS_TOKEN}` },
      });
    }
  });

  test('increments helpful count and deletes an owned review with confirmation', async ({
    page,
    request,
  }) => {
    const label = `CA4 Admin Delete ${Date.now()}`;
    const { reviewId } = await createReviewThroughApi(request, label);
    await unlockModeration(page);
    await page.locator('#adminSearchInput').fill(label);
    await expect(page.locator('#adminReviewList .review-admin-mini-card')).toHaveCount(1);

    const helpfulResponse = page.waitForResponse((response) => {
      return response.url().includes('/helpful') && response.request().method() === 'PATCH';
    });
    await page.locator('#adminHelpfulSelectedBtn').click();
    expect((await helpfulResponse).ok()).toBe(true);

    await page.locator('#adminDeleteSelectedBtn').click();
    await expect(page.locator('#deleteReviewModal')).not.toHaveClass(/hidden/);
    const deleteResponse = page.waitForResponse((response) => {
      return (
        response.url().endsWith(`/api/admin/reviews/${reviewId}`) &&
        response.request().method() === 'DELETE'
      );
    });
    await page.locator('#confirmDeleteReviewBtn').click();
    expect((await deleteResponse).ok()).toBe(true);
    await expect(page.locator('#adminReviewList')).toContainText('No reviews match');
  });
});
