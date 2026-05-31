// =========================================================
// SP QuickBite - Browse Stalls Page
// Uses API response names like stall_name, item_name, etc.
// =========================================================

// ---------- HTML ELEMENTS ----------
const stallContainer = document.getElementById("stallContainer");
const resultCount = document.getElementById("resultCount");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const foodCourtFilter = document.getElementById("foodCourtFilter");
const foodTypeFilter = document.getElementById("foodTypeFilter");
const dietaryFilter = document.getElementById("dietaryFilter");
const statusFilter = document.getElementById("statusFilter");
const clearFilterButton = document.getElementById("clearFilterButton");

// ---------- PAGE LOAD ----------
window.addEventListener("DOMContentLoaded", () => {
  displayRecentlyViewedStalls();
  getStalls(false);
});

// ---------- SEARCH AND FILTER EVENTS ----------
searchButton.addEventListener("click", () => {
  getStalls(true);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getStalls(true);
  }
});

foodCourtFilter.addEventListener("change", () => getStalls(true));
foodTypeFilter.addEventListener("change", () => getStalls(true));
dietaryFilter.addEventListener("change", () => getStalls(true));
statusFilter.addEventListener("change", () => getStalls(true));

clearFilterButton.addEventListener("click", () => {
  searchInput.value = "";
  foodCourtFilter.value = "";
  foodTypeFilter.value = "";
  dietaryFilter.value = "";
  statusFilter.value = "";

  getStalls(true);
});

// =========================================================
// API
// =========================================================

function buildStallUrl() {
  const params = [];

  addQueryParam(params, "search", searchInput.value.trim());
  addQueryParam(params, "foodCourt", foodCourtFilter.value);
  addQueryParam(params, "foodType", foodTypeFilter.value);
  addQueryParam(params, "dietary", dietaryFilter.value);
  addQueryParam(params, "status", statusFilter.value);

  if (params.length === 0) {
    return "/api/stalls";
  }

  return "/api/stalls?" + params.join("&");
}

function addQueryParam(params, key, value) {
  if (value !== "") {
    params.push(key + "=" + encodeURIComponent(value));
  }
}

function getStalls(shouldScroll) {
  resultCount.textContent = "Loading stalls...";
  stallContainer.classList.add("loading-soft");

  fetch(buildStallUrl())
    .then((response) => response.json())
    .then((result) => {
      displayStalls(result.data || []);
      stallContainer.classList.remove("loading-soft");

      if (shouldScroll) {
        smoothScrollToResults();
      }
    })
    .catch((error) => {
      console.error("Error loading stalls:", error);
      stallContainer.classList.remove("loading-soft");
      showError("Unable to load stalls. Please try again later.");
    });
}

// =========================================================
// DISPLAY STALLS
// =========================================================

function displayStalls(stalls) {
  stallContainer.innerHTML = "";

  if (stalls.length === 0) {
    resultCount.textContent = "Showing 0 stalls";
    showError("No stalls found. Try changing your search or filters.");
    return;
  }

  resultCount.textContent = "Showing " + stalls.length + " stalls";

  for (let i = 0; i < stalls.length; i++) {
    stallContainer.appendChild(createStallCard(stalls[i]));
  }
}

function createStallCard(stall) {
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
      <p class="stall-description">${stall.stall_description}</p>

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

  return card;
}

function showError(message) {
  stallContainer.innerHTML = `
    <div class="empty-message">
      ${message}
    </div>
  `;
}

// =========================================================
// RECENTLY VIEWED STALLS
// =========================================================

function displayRecentlyViewedStalls() {
  const recentlyViewed = getRecentlyViewedStalls();

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

  recentSection.innerHTML = buildRecentlyViewedHTML(recentlyViewed);
}

function getRecentlyViewedStalls() {
  const savedData = localStorage.getItem("recentlyViewedStalls");

  if (!savedData) {
    return [];
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    localStorage.removeItem("recentlyViewedStalls");
    return [];
  }
}

function buildRecentlyViewedHTML(recentlyViewed) {
  let html = `
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
    html += createRecentStallHTML(recentlyViewed[i]);
  }

  html += `</div>`;

  return html;
}

function createRecentStallHTML(stall) {
  const isClosed = stall.opening_status === "closed";

  return `
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

function clearRecentlyViewedStalls() {
  localStorage.removeItem("recentlyViewedStalls");

  const recentSection = document.getElementById("recentlyViewedSection");

  if (recentSection) {
    recentSection.remove();
  }
}
function smoothScrollToResults() {
  setTimeout(() => {
    resultCount.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 120);
}
// =========================================================
// NAVIGATION
// =========================================================

function goToMenu(stallId) {
  window.location.href = "./stall-detail.html?stall_id=" + stallId;
}
