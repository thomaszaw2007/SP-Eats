// =========================================================
// SP QuickBite - Welcome Page
// Handles: Hype Now popular meals, theme button placeholder
// =========================================================

const hypeNowGrid = document.getElementById('hypeNowGrid');
const hypeStatus = document.getElementById('hypeStatus');
const homeThemeToggle = document.getElementById('homeThemeToggle');

window.addEventListener('DOMContentLoaded', () => {
  setupHomeEvents();
  loadHypeNowMeals();
});

function setupHomeEvents() {
  if (homeThemeToggle) {
    homeThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('home-dark-mode');
    });
  }
}

function loadHypeNowMeals() {
  if (!hypeNowGrid) {
    return;
  }

  fetch('/api/stalls')
    .then((response) => response.json())
    .then((result) => {
      const stalls = result.data || [];

      if (stalls.length === 0) {
        showHypeFallbackMeals();
        return;
      }

      return Promise.all(
        stalls.map((stall) => {
          const stallId = stall.stall_id || stall.id || stall.raw_stall_id;
          const apiStallId = getApiStallId(stallId);

          return fetch('/api/stalls/' + apiStallId + '/menu')
            .then((response) => response.json())
            .then((menuResult) => {
              const menuItems = menuResult.data || [];

              return menuItems.map((item) => {
                return {
                  ...item,
                  stall_name: stall.stall_name || stall.name || item.stall_name,
                  home_stall_id: stallId,
                };
              });
            })
            .catch(() => []);
        })
      );
    })
    .then((menuGroups) => {
      if (!menuGroups) {
        return;
      }

      const allMenuItems = menuGroups.flat();

      const popularMeals = allMenuItems
        .filter((item) => item.is_popular)
        .sort((firstItem, secondItem) => {
          const firstScore =
            Number(firstItem.order_count || 0) +
            Number(firstItem.item_review_count || 0) +
            Number(firstItem.item_rating || 0) * 10;

          const secondScore =
            Number(secondItem.order_count || 0) +
            Number(secondItem.item_review_count || 0) +
            Number(secondItem.item_rating || 0) * 10;

          return secondScore - firstScore;
        })
        .slice(0, 3);

      if (popularMeals.length === 0) {
        showHypeFallbackMeals();
        return;
      }

      displayHypeMeals(popularMeals);
    })
    .catch((error) => {
      console.error('Error loading hype meals:', error);
      showHypeFallbackMeals();
    });
}

function displayHypeMeals(meals) {
  hypeNowGrid.innerHTML = '';

  if (hypeStatus) {
    hypeStatus.textContent = '';
  }

  meals.forEach((meal) => {
    const mealCard = createHypeMealCard(meal);
    hypeNowGrid.appendChild(mealCard);
  });
}

function createHypeMealCard(meal) {
  const card = document.createElement('article');
  card.className = 'home-meal-card';

  const rating = meal.item_rating || meal.rating || 4.5;
  const reviewCount = meal.item_review_count || meal.review_count || 0;
  const category = meal.category || 'Meal';
  const price = meal.price || 0;
  const mealId = meal.item_id || meal.food_id;
  const stallId = meal.home_stall_id || meal.stall_id;

  card.innerHTML = `
    <div class="home-meal-image-wrap">
      ${
        meal.image_url
          ? `<img
              src="${meal.image_url}"
              alt="${meal.item_name}"
              class="home-meal-image"
            />`
          : `<div class="home-meal-image home-meal-placeholder">
              <span>No image yet</span>
            </div>`
      }

      <span class="home-popular-badge">🔥 Popular</span>

      <button class="home-heart-btn" type="button" aria-label="Favourite meal">
        ♡
      </button>
    </div>

    <div class="home-meal-body">
      <div class="home-meal-title-row">
        <h3>${meal.item_name}</h3>
        <span>${category}</span>
      </div>

      <div class="home-meal-rating-row">
        <span class="home-stars">★★★★★</span>
        <strong>${formatRating(rating)}</strong>
        <span>(${reviewCount})</span>
      </div>

      <div class="home-meal-bottom-row">
        <strong class="home-meal-price">$${formatPrice(price)}</strong>

        <button class="home-add-btn" type="button" aria-label="Add meal">
          +
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = './stall-detail.html?stall_id=' + encodeURIComponent(stallId);
  });

  const heartButton = card.querySelector('.home-heart-btn');
  heartButton.addEventListener('click', (event) => {
    event.stopPropagation();
    heartButton.classList.toggle('active');
    heartButton.textContent = heartButton.classList.contains('active') ? '♥' : '♡';
  });

  const addButton = card.querySelector('.home-add-btn');
  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    alert(`${meal.item_name} selected. Cart feature coming soon.`);
  });

  return card;
}

function showHypeFallbackMeals() {
  const fallbackMeals = [
    {
      item_id: 1,
      item_name: 'Chicken Rice',
      category: 'Rice',
      price: 4.0,
      item_rating: 4.4,
      item_review_count: 67,
      image_url: null,
      is_popular: true,
      stall_id: 3,
    },
    {
      item_id: 2,
      item_name: 'Bibimbap',
      category: 'Rice',
      price: 6.5,
      item_rating: 4.7,
      item_review_count: 45,
      image_url: null,
      is_popular: true,
      stall_id: 1,
    },
    {
      item_id: 3,
      item_name: 'Korean Fried Chicken',
      category: 'Snacks',
      price: 7.5,
      item_rating: 4.6,
      item_review_count: 52,
      image_url: null,
      is_popular: true,
      stall_id: 12,
    },
  ];

  displayHypeMeals(fallbackMeals);
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

function formatPrice(price) {
  return Number(price || 0).toFixed(2);
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}