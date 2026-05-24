const stallHeader = document.getElementById("stallHeader");
const menuContainer = document.getElementById("menuContainer");
const menuResultCount = document.getElementById("menuResultCount");
const menuSearchInput = document.getElementById("menuSearchInput");
const menuSearchButton = document.getElementById("menuSearchButton");
const menuFilterButtons = document.querySelectorAll(".menu-filter-btn");

let menuItemsData = [];

// Get stall_id from the URL
const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get("stall_id");

// Load stall and menu when page opens
window.addEventListener("DOMContentLoaded", () => {
  if (stallId === null) {
    stallHeader.innerHTML = "<p>Stall ID is missing.</p>";
    return;
  }

  getStallDetails();
  getStallMenu();
});

// Get stall information
function getStallDetails() {
  fetch("/api/stalls/" + stallId)
    .then((response) => response.json())
    .then((result) => {
      displayStallDetails(result.data);
    })
    .catch((error) => {
      console.error("Error loading stall details:", error);
      stallHeader.innerHTML = "<p>Unable to load stall details.</p>";
    });
}

// Get menu items from the selected stall
function getStallMenu() {
  fetch("/api/stalls/" + stallId + "/menu")
    .then((response) => response.json())
    .then((result) => {
      menuItemsData = result.data;
      displayMenuItems(menuItemsData);
    })
    .catch((error) => {
      console.error("Error loading stall menu:", error);
      menuContainer.innerHTML = `
        <div class="empty-message">
          Unable to load menu items.
        </div>
      `;
    });
}

// Display stall details at the top
function displayStallDetails(stall) {
  if (!stall) {
    stallHeader.innerHTML = "<p>Stall not found.</p>";
    return;
  }

  const isClosed = stall.opening_status === "closed";

  stallHeader.innerHTML = `
    <img 
      src="${stall.image_url}" 
      alt="${stall.stall_name}" 
      class="stall-detail-image"
    />

    <div class="stall-detail-content">
      <span class="status-badge ${isClosed ? "status-closed" : "status-open"}">
        ${isClosed ? "Closed" : "Open"}
      </span>

      <h1>${stall.stall_name}</h1>

      <p class="stall-detail-description">
        ${stall.stall_description}
      </p>

      <div class="stall-detail-info">
        <span class="info-pill">${stall.cuisine_type}</span>
        <span class="info-pill">${stall.location_detail}</span>
        <span class="info-pill">${stall.estimated_wait_time}</span>
        <span class="info-pill">Rating: ${stall.rating} (${stall.rating_count})</span>
      </div>
    </div>
  `;
}

// Display menu item cards
function displayMenuItems(menuItems) {
  menuContainer.innerHTML = "";

  if (menuItems.length === 0) {
    menuResultCount.textContent = "Showing 0 menu items";

    menuContainer.innerHTML = `
      <div class="empty-message">
        No menu items found.
      </div>
    `;
    return;
  }

  menuResultCount.textContent = "Showing " + menuItems.length + " menu items";

  menuItems.forEach((item) => {
    const isUnavailable = item.is_available === false;

    const card = document.createElement("div");
    card.className = "menu-card";

    if (isUnavailable) {
      card.classList.add("unavailable");
    }

    card.innerHTML = `
      <img 
        src="${item.image_url}" 
        alt="${item.item_name}" 
        class="menu-image"
      />

      <div class="menu-content">
        <div class="menu-top-row">
          <span class="menu-category">${item.category}</span>
          ${item.is_popular ? `<span class="popular-badge">Popular</span>` : ""}
        </div>

        <h3>${item.item_name}</h3>

        <p class="menu-description">
          ${item.item_description}
        </p>

        <div class="menu-top-row">
          ${item.is_halal ? `<span class="halal-badge">Halal</span>` : ""}
          ${isUnavailable ? `<span class="status-badge status-closed">Unavailable</span>` : ""}
        </div>

        <div class="menu-bottom-row">
          <span class="menu-price">$${Number(item.price).toFixed(2)}</span>

          ${
            isUnavailable
              ? `<button class="add-btn disabled" disabled>+</button>`
              : `<button class="add-btn" onclick="prepareCartItem('${item.item_id}')">+</button>`
          }
        </div>
      </div>
    `;

    menuContainer.appendChild(card);
  });
}

// Search this stall's menu items
menuSearchButton.addEventListener("click", () => {
  const searchText = menuSearchInput.value.trim().toLowerCase();

  if (searchText === "") {
    displayMenuItems(menuItemsData);
    return;
  }

  const filteredItems = menuItemsData.filter((item) => {
    return (
      item.item_name.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText)
    );
  });

  displayMenuItems(filteredItems);
});

// Press Enter to search
menuSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    menuSearchButton.click();
  }
});

// Category filter buttons
menuFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    setActiveMenuButton(button);

    if (category === "all") {
      displayMenuItems(menuItemsData);
      return;
    }

    const filteredItems = menuItemsData.filter((item) => {
      return item.category === category;
    });

    displayMenuItems(filteredItems);
  });
});

// Prepare item object for future cart teammate
function prepareCartItem(itemId) {
  let selectedItem = null;

  for (let i = 0; i < menuItemsData.length; i++) {
    if (menuItemsData[i].item_id === itemId) {
      selectedItem = menuItemsData[i];
    }
  }
A
  if (selectedItem === null) {
    alert("Item not found.");
    return;
  }

  const cartItem = {
    item_id: selectedItem.item_id,
    stall_id: selectedItem.stall_id,
    stall_name: selectedItem.stall_name,
    item_name: selectedItem.item_name,
    price: selectedItem.price,
    image_url: selectedItem.image_url,
    quantity: 1,
  };

  console.log("Cart item prepared:", cartItem);
  alert("Cart feature coming soon.");
}

// Make active filter button red
function setActiveMenuButton(activeButton) {
  menuFilterButtons.forEach((button) => {
    button.classList.remove("active");
  });

  activeButton.classList.add("active");
}