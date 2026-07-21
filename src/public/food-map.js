// =========================================================
// SP QuickBite - Food Court Map
// Handles: backend FC marker data + popular dishes preview
// =========================================================

const foodCourtMarkersLayer = document.getElementById('foodCourtMarkersLayer');
const selectedFoodCourtPanel = document.getElementById('selectedFoodCourtPanel');
const mapMarkerCount = document.getElementById('mapMarkerCount');
const mapThemeToggle = document.getElementById('mapThemeToggle');

let foodCourts = [];
let selectedFoodCourtId = null;

window.addEventListener('DOMContentLoaded', () => {
  setupFoodMapEvents();
  loadFoodCourtMarkers();
});

function setupFoodMapEvents() {
  if (mapThemeToggle) {
    mapThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('home-dark-mode');
    });
  }
}

function loadFoodCourtMarkers() {
  fetch('/api/food-map')
    .then((response) => response.json())
    .then((result) => {
      foodCourts = result.data || [];

      if (foodCourts.length === 0) {
        showFoodMapError();
        return;
      }

      if (mapMarkerCount) {
        mapMarkerCount.textContent = `${foodCourts.length} food courts`;
      }

      displayFoodCourtMarkers();
    })
    .catch((error) => {
      console.error('Error loading food court map markers:', error);
      showFoodMapError();
    });
}

function displayFoodCourtMarkers() {
  if (!foodCourtMarkersLayer) {
    return;
  }

  foodCourtMarkersLayer.innerHTML = '';

  foodCourts.forEach((foodCourt) => {
    const marker = document.createElement('button');
    marker.className = 'real-food-court-marker';
    marker.type = 'button';

    if (foodCourt.foodcourt_id === selectedFoodCourtId) {
      marker.classList.add('active');
    }

    marker.style.left = `${foodCourt.map_x}%`;
    marker.style.top = `${foodCourt.map_y}%`;

    marker.innerHTML = `
      <span class="real-marker-rating">
        ${formatRating(foodCourt.average_rating)}★
      </span>

      <span class="real-marker-pin">
        <span class="real-marker-number">
          ${foodCourt.marker_number}
        </span>
      </span>
    `;

    marker.addEventListener('click', () => {
      selectedFoodCourtId = foodCourt.foodcourt_id;
      displayFoodCourtMarkers();
      displaySelectedFoodCourt(foodCourt);
    });

    foodCourtMarkersLayer.appendChild(marker);
  });
}

function displaySelectedFoodCourt(foodCourt) {
  if (!selectedFoodCourtPanel) {
    return;
  }

  const popularDishes = createPopularDishCards(foodCourt.popular_dishes || []);

  selectedFoodCourtPanel.innerHTML = `
    <div class="real-selected-food-court">
      <div class="real-selected-top-row">
        <span class="real-selected-label">
          ${foodCourt.marker_label}
        </span>

        <span class="real-selected-rating">
          ★ ${formatRating(foodCourt.average_rating)}
        </span>
      </div>

      <h2>${foodCourt.name}</h2>

      <p class="real-selected-location">
        ${foodCourt.location || 'Singapore Polytechnic Campus'}
      </p>

      <div class="real-map-stat-row">
        <div>
          <span>Stalls</span>
          <strong>${foodCourt.stall_count}</strong>
        </div>

        <div>
          <span>Open</span>
          <strong>${foodCourt.open_stall_count}</strong>
        </div>

        <div>
          <span>Popular</span>
          <strong>${foodCourt.popular_dishes.length}</strong>
        </div>
      </div>

      <section class="real-popular-dishes-section">
        <div class="real-panel-section-title">
          <span>🔥</span>
          <h3>Popular Dishes</h3>
        </div>

        <div class="real-popular-dish-list">
          ${popularDishes}
        </div>
      </section>

      <div class="real-selected-actions">
        <a href="./stalls.html?foodCourt=${encodeURIComponent(foodCourt.name)}" class="real-map-primary-btn">
          Browse This Food Court
        </a>

        <button class="real-map-secondary-btn" type="button" onclick="clearSelectedFoodCourt()">
          Clear
        </button>
      </div>
    </div>
  `;
}

function createPopularDishCards(dishes) {
  if (!dishes || dishes.length === 0) {
    return `
      <div class="real-no-dishes-card">
        No popular dishes available yet.
      </div>
    `;
  }

  return dishes
    .slice(0, 3)
    .map((dish) => {
      return `
        <article class="real-popular-dish-card">
          <div class="real-popular-dish-image-wrap">
            ${
              dish.image_url
                ? `<img
                    src="${dish.image_url}"
                    alt="${dish.item_name}"
                    class="real-popular-dish-image"
                  />`
                : `<div class="real-popular-dish-placeholder">
                    No image
                  </div>`
            }
          </div>

          <div class="real-popular-dish-info">
            <h4>${dish.item_name}</h4>

            <p>${dish.stall_name}</p>

            <div class="real-popular-dish-meta">
              <span>$${formatPrice(dish.price)}</span>
              <span>★ ${formatRating(dish.rating)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function clearSelectedFoodCourt() {
  selectedFoodCourtId = null;
  displayFoodCourtMarkers();

  selectedFoodCourtPanel.innerHTML = `
    <div class="real-map-empty-state">
      <span>📍</span>
      <h3>Select a food court</h3>
      <p>Click any orange marker on the map to view food court details and popular dishes.</p>
    </div>
  `;
}

function showFoodMapError() {
  if (mapMarkerCount) {
    mapMarkerCount.textContent = 'Map unavailable';
  }

  if (selectedFoodCourtPanel) {
    selectedFoodCourtPanel.innerHTML = `
      <div class="real-map-empty-state">
        <span>⚠️</span>
        <h3>Unable to load map</h3>
        <p>Please check the food map API and try again.</p>
      </div>
    `;
  }
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}

function formatPrice(price) {
  return Number(price || 0).toFixed(2);
}