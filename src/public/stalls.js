const stallContainer = document.getElementById("stallContainer");
const resultCount = document.getElementById("resultCount");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const foodCourtFilter = document.getElementById("foodCourtFilter");
const foodTypeFilter = document.getElementById("foodTypeFilter");
const dietaryFilter = document.getElementById("dietaryFilter");
const statusFilter = document.getElementById("statusFilter");
const clearFilterButton = document.getElementById("clearFilterButton");

// =========================================================
// LOAD PAGE
// =========================================================

window.addEventListener("DOMContentLoaded", () => {
  displayRecentlyViewedStalls();
  getStalls();
});

// =========================================================
// SEARCH AND FILTER EVENTS
// =========================================================

searchButton.addEventListener("click", () => {
  getStalls();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getStalls();
  }
});

foodCourtFilter.addEventListener("change", getStalls);
foodTypeFilter.addEventListener("change", getStalls);
dietaryFilter.addEventListener("change", getStalls);
statusFilter.addEventListener("change", getStalls);

clearFilterButton.addEventListener("click", () => {
  searchInput.value = "";
  foodCourtFilter.value = "";
  foodTypeFilter.value = "";
  dietaryFilter.value = "";
  statusFilter.value = "";

  getStalls();
});

// =========================================================
// BUILD API URL
// =========================================================

function buildStallUrl() {
  let url = "/api/stalls?";
  const params = [];

  const searchText = searchInput.value.trim();
  const foodCourt = foodCourtFilter.value;
  const foodType = foodTypeFilter.value;
  const dietary = dietaryFilter.value;
  const status = statusFilter.value;

  if (searchText !== "") {
    params.push("search=" + encodeURIComponent(searchText));
  }

  if (foodCourt !== "") {
    params.push("foodCourt=" + encodeURIComponent(foodCourt));
  }

  if (foodType !== "") {
    params.push("foodType=" + encodeURIComponent(foodType));
  }

  if (dietary !== "") {
    params.push("dietary=" + encodeURIComponent(dietary));
  }

  if (status !== "") {
    params.push("status=" + encodeURIComponent(status));
  }

  if (params.length === 0) {
    return "/api/stalls";
  }

  return url + params.join("&");
}

// =========================================================
// FETCH STALLS
// =========================================================

function getStalls() {
  const url = buildStallUrl();

  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      displayStalls(result.data || []);
    })
    .catch((error) => {
      console.error("Error loading stalls:", error);

      resultCount.textContent = "Unable to load stalls.";

      stallContainer.innerHTML = `
        <div class="empty-message">
          Unable to load stalls. Please try again later.
        </div>
      `;
    });
}

// =========================================================
// DISPLAY STALL CARDS
// =========================================================

function displayStalls(stalls) {
  stallContainer.innerHTML = "";

  if (stalls.length === 0) {
    resultCount.textContent = "Showing 0 stalls";

    stallContainer.innerHTML = `
      <div class="empty-message">
        No stalls found. Try changing your search or filters.
      </div>
    `;
    return;
  }

  resultCount.textContent = "Showing " + stalls.length + " stalls";

  stalls.forEach((stall) => {
    const isClosed = stall.opening_status === "closed";

    const card = document.createElement("div");
    card.className = "stall-card";

    if (isClosed) {
      card.classList.add("closed");
    }

    card.innerHTML = `
      <div class="stall-image-wrap">
        <img
          src="${stall.image_url}"
          alt="${stall.stall_name}"
          class="stall-image"
          onerror="this.src='/images/default-food.jpg'"
        />

        <span class="food-court-badge">${stall.food_court}</span>
      </div>

      <div class="stall-content">
        <div class="stall-top-row">
          <span class="status-badge ${isClosed ? "status-closed" : "status-open"}">
            ${isClosed ? "Closed" : "Open"}
          </span>

          <span class="rating-pill">★ ${stall.rating}</span>
        </div>

        <h3>${stall.stall_name}</h3>

        <p class="stall-cuisine">${stall.cuisine_type}</p>

        <p class="stall-description">
          ${stall.stall_description}
        </p>

        <div class="dietary-row">
          ${stall.is_halal ? `<span class="dietary-badge">Halal</span>` : ""}
          ${stall.is_vegetarian ? `<span class="dietary-badge">Vegetarian</span>` : ""}
          ${stall.is_vegan ? `<span class="dietary-badge">Vegan</span>` : ""}
        </div>

        <p class="stall-info">Location: ${stall.location_detail}</p>
        <p class="stall-info">Wait: ${stall.estimated_wait_time}</p>

        ${
          isClosed
            ? `<p class="opening-time">Opens: ${stall.opening_time}</p>`
            : `<p class="opening-time">Open until: ${stall.closing_time}</p>`
        }

        <button 
          class="view-menu-btn ${isClosed ? "closed-view-btn" : ""}" 
          onclick="goToMenu('${stall.stall_id}')"
        >
          ${isClosed ? "View Menu - Closed" : "View Menu"}
        </button>
      </div>
    `;

    stallContainer.appendChild(card);
  });
}

// =========================================================
// RECENTLY VIEWED STALLS
// Feature: Shows stalls that the user recently opened
// =========================================================

function displayRecentlyViewedStalls() {
  const STORAGE_KEY = "recentlyViewedStalls";
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  let recentlyViewed = [];

  try {
    recentlyViewed = JSON.parse(savedData);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  if (recentlyViewed.length === 0) {
    return;
  }

  let recentSection = document.getElementById("recentlyViewedSection");

  if (!recentSection) {
    recentSection = document.createElement("section");
    recentSection.id = "recentlyViewedSection";
    recentSection.className = "recently-viewed-section";

    resultCount.parentNode.insertBefore(recentSection, resultCount);
  }

  let recentHTML = `
    <div class="recently-viewed-header">
      <div>
        <p class="small-title red-text">Recently Viewed</p>
        <h2>Continue browsing</h2>
      </div>

      <button class="clear-recent-btn" onclick="clearRecentlyViewedStalls()">
        Clear
      </button>
    </div>

    <div class="recently-viewed-row">
  `;

  for (let i = 0; i < recentlyViewed.length; i++) {
    const stall = recentlyViewed[i];
    const isClosed = stall.opening_status === "closed";

    recentHTML += `
      <div class="recent-stall-card" onclick="goToMenu('${stall.stall_id}')">
        <img
          src="${stall.image_url}"
          alt="${stall.stall_name}"
          class="recent-stall-image"
          onerror="this.src='/images/default-food.jpg'"
        />

        <div class="recent-stall-content">
          <div class="recent-stall-top">
            <span class="status-badge ${isClosed ? "status-closed" : "status-open"}">
              ${isClosed ? "Closed" : "Open"}
            </span>

            <span class="rating-pill">★ ${stall.rating}</span>
          </div>

          <h3>${stall.stall_name}</h3>
          <p>${stall.cuisine_type}</p>
          <span class="recent-food-court">${stall.food_court}</span>
        </div>
      </div>
    `;
  }

  recentHTML += `
    </div>
  `;

  recentSection.innerHTML = recentHTML;
}

function clearRecentlyViewedStalls() {
  localStorage.removeItem("recentlyViewedStalls");

  const recentSection = document.getElementById("recentlyViewedSection");

  if (recentSection) {
    recentSection.remove();
  }
}

// =========================================================
// GO TO SELECTED STALL MENU PAGE
// =========================================================

function goToMenu(stallId) {
  window.location.href = "./stall-detail.html?stall_id=" + stallId;
}