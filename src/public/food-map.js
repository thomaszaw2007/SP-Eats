// =========================================================
// SP QuickBite - Food Court Map Foundation
// Handles: backend FC marker data + markers on real SP map image
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

      <span class="real-marker-number">
        ${foodCourt.marker_number}
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

  selectedFoodCourtPanel.innerHTML = `
    <div class="real-selected-food-court">
      <span class="real-selected-label">
        ${foodCourt.marker_label}
      </span>

      <h2>${foodCourt.name}</h2>

      <p class="real-selected-location">
        ${foodCourt.location || 'Singapore Polytechnic Campus'}
      </p>

      <p class="real-selected-description">
        ${
          foodCourt.description ||
          'This food court is marked on the SP campus map.'
        }
      </p>

      <div class="real-map-stat-row">
        <div>
          <span>Rating</span>
          <strong>${formatRating(foodCourt.average_rating)}</strong>
        </div>

        <div>
          <span>Stalls</span>
          <strong>${foodCourt.stall_count}</strong>
        </div>

        <div>
          <span>Open</span>
          <strong>${foodCourt.open_stall_count}</strong>
        </div>
      </div>

      <div class="real-selected-actions">
        <a href="./stalls.html?foodCourt=${encodeURIComponent(foodCourt.name)}" class="real-map-primary-btn">
          Browse This Food Court
        </a>

        <button class="real-map-secondary-btn" type="button" onclick="clearSelectedFoodCourt()">
          Clear
        </button>
      </div>

      <p class="real-map-note">
        This version focuses on accurate map markers. Stall list display will be added in a later commit.
      </p>
    </div>
  `;
}

function clearSelectedFoodCourt() {
  selectedFoodCourtId = null;
  displayFoodCourtMarkers();

  selectedFoodCourtPanel.innerHTML = `
    <div class="real-map-empty-state">
      <span>📍</span>
      <h3>Select a food court</h3>
      <p>Click any orange marker on the map to view the food court details.</p>
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