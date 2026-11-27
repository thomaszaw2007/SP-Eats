const grid = document.getElementById('hypeNowGrid');
const status = document.getElementById('hypeStatus');
const template = document.getElementById('popularMealTemplate');
const themeToggle = document.getElementById('homeThemeToggle');
const favouriteKey = 'spEatsFavouriteMeals';
const legacyFavouriteKey = 'quickbiteFavouriteMeals';
const formatPrice = new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' });

themeToggle.addEventListener('click', () => {
  const enabled = document.body.classList.toggle('home-dark-mode');
  themeToggle.setAttribute('aria-pressed', String(enabled));
});

function getFavourites(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isFavourite(meal) {
  return [favouriteKey, legacyFavouriteKey].some((key) =>
    getFavourites(key).some((saved) => String(saved.id) === String(meal.food_id)),
  );
}

function setFavourite(meal, button) {
  const alreadySaved = isFavourite(meal);
  const savedMeal = {
    id: String(meal.food_id),
    foodId: meal.food_id,
    stallId: meal.raw_stall_id,
    foodCourtId: meal.foodcourt_id,
    name: meal.item_name,
    stallName: meal.stall_name,
    foodCourtName: meal.food_court,
    imageUrl: meal.image_url,
    price: Number(meal.price),
    rating: Number(meal.item_rating),
    reviewCount: Number(meal.item_review_count),
    category: meal.category,
  };

  try {
    for (const key of [favouriteKey, legacyFavouriteKey]) {
      const remaining = getFavourites(key).filter((saved) => String(saved.id) !== savedMeal.id);
      const next = alreadySaved ? remaining : [savedMeal, ...remaining];
      localStorage.setItem(key, JSON.stringify(next.slice(0, 24)));
    }
    updateSaveButton(button, !alreadySaved);
  } catch {
    status.textContent = 'This browser could not save the meal.';
  }
}

function updateSaveButton(button, saved) {
  button.textContent = saved ? '♥' : '♡';
  button.setAttribute('aria-pressed', String(saved));
}

function createMealCard(meal) {
  const card = template.content.cloneNode(true);
  const image = card.querySelector('img');
  const placeholder = card.querySelector('.home-meal-placeholder');
  const save = card.querySelector('.home-heart-btn');

  function usePlaceholder() {
    image.hidden = true;
    placeholder.hidden = false;
  }

  if (meal.image_url) {
    image.addEventListener('error', usePlaceholder, { once: true });
    image.src = meal.image_url;
  } else {
    usePlaceholder();
  }

  card.querySelector('h3').textContent = meal.item_name;
  card.querySelector('.home-meal-stall').textContent = meal.stall_name;
  card.querySelector('.home-meal-price').textContent = formatPrice.format(Number(meal.price));
  const reviewCount = Number(meal.item_review_count);
  card.querySelector('.home-meal-rating').textContent = reviewCount
    ? `★ ${Number(meal.item_rating).toFixed(1)} · ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`
    : 'No reviews yet';
  card.querySelector('.home-meal-link').href =
    './stall-detail.html?' +
    new URLSearchParams({ stall_id: meal.raw_stall_id, food_id: meal.food_id });

  save.setAttribute('aria-label', `Favourite ${meal.item_name}`);
  updateSaveButton(save, isFavourite(meal));
  save.addEventListener('click', () => setFavourite(meal, save));
  return card;
}

async function loadPopularMeals() {
  try {
    const response = await fetch('/api/menu-items?popular=true');
    if (!response.ok) throw new Error('Popular meals request failed.');
    const { data } = await response.json();
    const meals = data.filter((meal) => meal.is_available).slice(0, 3);
    status.textContent = meals.length ? '' : 'Popular meals will appear here when available.';
    grid.replaceChildren(...meals.map(createMealCard));
  } catch {
    status.textContent =
      'Popular meals are temporarily unavailable. You can still browse the stalls.';
  }
}

loadPopularMeals();
