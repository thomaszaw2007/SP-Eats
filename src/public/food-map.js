// =========================================================
// SP Eats- Food Court Map
// Handles: backend FC marker data + popular dishes preview
// =========================================================

const foodCourtMarkersLayer = document.getElementById('foodCourtMarkersLayer');
const selectedFoodCourtPanel = document.getElementById('selectedFoodCourtPanel');
const mapMarkerCount = document.getElementById('mapMarkerCount');
const mapThemeToggle = document.getElementById('mapThemeToggle');

const mapFrame = document.getElementById('mapFrame');
const mapZoomCanvas = document.getElementById('mapZoomCanvas');
const mapZoomIn = document.getElementById('mapZoomIn');
const mapZoomOut = document.getElementById('mapZoomOut');
const mapZoomReset = document.getElementById('mapZoomReset');

let foodCourts = [];
let selectedFoodCourtId = null;

let mapScale = 1;
let mapTranslateX = 0;
let mapTranslateY = 0;
let isDraggingMap = false;
let dragStartX = 0;
let dragStartY = 0;

window.addEventListener('DOMContentLoaded', () => {
  setupFoodMapEvents();
  loadFoodCourtMarkers();
  updateMapTransform();
});

function setupFoodMapEvents() {
  if (mapThemeToggle) {
    mapThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('home-dark-mode');
    });
  }

  if (selectedFoodCourtPanel) {
    selectedFoodCourtPanel.addEventListener('click', handleFoodMapPanelClick);
  }

  setupMapZoomControls();
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
      autoSelectFirstFoodCourt();
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

      <span class="real-marker-label">
        ${foodCourt.marker_label}
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

function autoSelectFirstFoodCourt() {
  if (selectedFoodCourtId || foodCourts.length === 0) {
    return;
  }

  const firstFoodCourt = foodCourts[0];

  selectedFoodCourtId = firstFoodCourt.foodcourt_id;
  displayFoodCourtMarkers();
  displaySelectedFoodCourt(firstFoodCourt);
}

function displaySelectedFoodCourt(foodCourt) {
  if (!selectedFoodCourtPanel) {
    return;
  }

  const popularDishes = createPopularDishCards(foodCourt.popular_dishes || []);
  const popularDishCount = (foodCourt.popular_dishes || []).length;

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
          <strong>${popularDishCount}</strong>
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
        <a
          href="./stalls.html?foodCourt=${encodeURIComponent(foodCourt.name)}"
          class="real-map-primary-btn"
        >
          Browse This Food Court
        </a>

        <button
          class="real-map-secondary-btn"
          type="button"
          data-map-action="clear"
        >
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
        <button
          class="real-popular-dish-card clickable-dish-card"
          type="button"
          data-stall-id="${dish.stall_id}"
        >
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
              <span>★ ${formatRating(dish.rating)} (${Number(dish.rating_count || 0)})</span>
              <span>View →</span>
            </div>
          </div>
        </button>
      `;
    })
    .join('');
}

function handleFoodMapPanelClick(event) {
  const clearButton = event.target.closest('[data-map-action="clear"]');

  if (clearButton) {
    clearSelectedFoodCourt();
    return;
  }

  const dishCard = event.target.closest('.clickable-dish-card');

  if (dishCard) {
    const stallId = dishCard.dataset.stallId;

    if (stallId) {
      window.location.href = `./stall-detail.html?stall_id=${stallId}`;
    }
  }
}

function clearSelectedFoodCourt() {
  selectedFoodCourtId = null;
  displayFoodCourtMarkers();

  if (!selectedFoodCourtPanel) {
    return;
  }

  selectedFoodCourtPanel.innerHTML = `
    <div class="real-map-empty-state">
      <span>📍</span>
      <h3>Select a food court</h3>
      <p>Click any orange marker on the map to view food court details and popular dishes.</p>
    </div>
  `;
}

function setupMapZoomControls() {
  if (!mapFrame || !mapZoomCanvas) {
    return;
  }

  if (mapZoomIn) {
    mapZoomIn.addEventListener('click', () => {
      zoomMap(0.2);
    });
  }

  if (mapZoomOut) {
    mapZoomOut.addEventListener('click', () => {
      zoomMap(-0.2);
    });
  }

  if (mapZoomReset) {
    mapZoomReset.addEventListener('click', resetMapZoom);
  }

  mapFrame.addEventListener('wheel', handleMapWheelZoom, {
    passive: false,
  });

  mapFrame.addEventListener('pointerdown', startMapDrag);
  window.addEventListener('pointermove', dragMap);
  window.addEventListener('pointerup', stopMapDrag);
}

function zoomMap(change) {
  const nextScale = Math.min(2.5, Math.max(1, mapScale + change));

  mapScale = Number(nextScale.toFixed(2));

  if (mapScale === 1) {
    mapTranslateX = 0;
    mapTranslateY = 0;
  }

  limitMapDrag();
  updateMapTransform();
}

function resetMapZoom() {
  mapScale = 1;
  mapTranslateX = 0;
  mapTranslateY = 0;

  updateMapTransform();
}

function handleMapWheelZoom(event) {
  event.preventDefault();

  if (event.deltaY < 0) {
    zoomMap(0.1);
  } else {
    zoomMap(-0.1);
  }
}

function startMapDrag(event) {
  if (mapScale <= 1) {
    return;
  }

  if (event.target.closest('.real-food-court-marker')) {
    return;
  }

  isDraggingMap = true;
  dragStartX = event.clientX - mapTranslateX;
  dragStartY = event.clientY - mapTranslateY;

  mapFrame.classList.add('dragging');
}

function dragMap(event) {
  if (!isDraggingMap) {
    return;
  }

  mapTranslateX = event.clientX - dragStartX;
  mapTranslateY = event.clientY - dragStartY;

  limitMapDrag();
  updateMapTransform();
}

function stopMapDrag() {
  isDraggingMap = false;

  if (mapFrame) {
    mapFrame.classList.remove('dragging');
  }
}

function limitMapDrag() {
  if (!mapFrame) {
    return;
  }

  const frameWidth = mapFrame.clientWidth;
  const frameHeight = mapFrame.clientHeight;

  const maxMoveX = (frameWidth * (mapScale - 1)) / 2;
  const maxMoveY = (frameHeight * (mapScale - 1)) / 2;

  mapTranslateX = Math.max(-maxMoveX, Math.min(maxMoveX, mapTranslateX));
  mapTranslateY = Math.max(-maxMoveY, Math.min(maxMoveY, mapTranslateY));
}

function updateMapTransform() {
  if (!mapZoomCanvas) {
    return;
  }

  mapZoomCanvas.style.transform = `
    translate(${mapTranslateX}px, ${mapTranslateY}px)
    scale(${mapScale})
  `;

  if (mapZoomIn) {
    mapZoomIn.disabled = mapScale >= 2.5;
  }

  if (mapZoomOut) {
    mapZoomOut.disabled = mapScale <= 1;
  }
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
