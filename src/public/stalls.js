const stallContainer = document.getElementById("stallContainer");
const resultCount = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const filterButtons = document.querySelectorAll(".filter-btn");

// Load all stalls when the page opens
window.addEventListener("DOMContentLoaded", () => {
  getStalls("/api/stalls");
});

// Search button click
searchButton.addEventListener("click", () => {
  const searchText = searchInput.value.trim();

  if (searchText === "") {
    getStalls("/api/stalls");
  } else {
    getStalls("/api/stalls?search=" + encodeURIComponent(searchText));
  }

  setActiveButton(null);
});

// Press Enter to search
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});

// Filter buttons
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;

    setActiveButton(button);

    if (type === "all") {
      searchInput.value = "";
      getStalls("/api/stalls");
    } else if (type === "category") {
      getStalls("/api/stalls?category=" + encodeURIComponent(value));
    } else if (type === "foodCourt") {
      getStalls("/api/stalls?foodCourt=" + encodeURIComponent(value));
    } else if (type === "status") {
      getStalls("/api/stalls?status=" + encodeURIComponent(value));
    }
  });
});

// Fetch stalls from backend
function getStalls(url) {
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      displayStalls(result.data);
    })
    .catch((error) => {
      console.error("Error loading stalls:", error);
      stallContainer.innerHTML = `
        <div class="empty-message">
          Unable to load stalls. Please try again later.
        </div>
      `;
    });
}

// Display stall cards
function displayStalls(stalls) {
  stallContainer.innerHTML = "";

  if (stalls.length === 0) {
    resultCount.textContent = "Showing 0 stalls";

    stallContainer.innerHTML = `
      <div class="empty-message">
        No stalls found.
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
      <img 
        src="${stall.image_url}" 
        alt="${stall.stall_name}" 
        class="stall-image"
      />

      <div class="stall-content">
        <span class="status-badge ${isClosed ? "status-closed" : "status-open"}">
          ${isClosed ? "Closed" : "Open"}
        </span>

        <h3>${stall.stall_name}</h3>

        <p class="stall-description">
          ${stall.stall_description}
        </p>

        <p class="stall-info">
          ${stall.cuisine_type}
        </p>

        <p class="stall-info">
          ${stall.location_detail} • ${stall.estimated_wait_time}
        </p>

        <p class="stall-info">
          Rating: ${stall.rating} (${stall.rating_count})
        </p>

        ${
          isClosed
            ? `<button class="view-menu-btn disabled" disabled>Currently Closed</button>`
            : `<button class="view-menu-btn" onclick="goToMenu('${stall.stall_id}')">View Menu</button>`
        }
      </div>
    `;

    stallContainer.appendChild(card);
  });
}

// Go to selected stall menu page
function goToMenu(stallId) {
  window.location.href = "./stall-detail.html?stall_id=" + stallId;
}

// Make active filter button red
function setActiveButton(activeButton) {
  filterButtons.forEach((button) => {
    button.classList.remove("active");
  });

  if (activeButton) {
    activeButton.classList.add("active");
  }
}