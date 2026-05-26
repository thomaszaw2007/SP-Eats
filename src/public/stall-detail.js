const stallHeader = document.getElementById("stallHeader");
const categoryContainer = document.getElementById("categoryContainer");
const menuContainer = document.getElementById("menuContainer");
const menuResultCount = document.getElementById("menuResultCount");

const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get("stall_id");

let selectedStall = null;
let menuItemsData = [];
let selectedCategory = "All";

window.addEventListener("DOMContentLoaded", () => {
  if (!stallId) {
    stallHeader.innerHTML = `
      <div class="stall-detail-content">
        <h1>Stall not found</h1>
        <p class="stall-detail-description">No stall was selected.</p>
      </div>
    `;
    return;
  }

  getStallDetails();
  getStallMenu();
});

// Get selected stall details
function getStallDetails() {
  fetch("/api/stalls/" + stallId)
    .then((response) => response.json())
    .then((result) => {
      
        selectedStall = result.data;
        displayStallHeader(selectedStall);

        if (menuItemsData.length > 0) {
          filterMenuByCategory();
        }

    })
    .catch((error) => {
      console.error("Error loading stall details:", error);

      stallHeader.innerHTML = `
        <div class="stall-detail-content">
          <h1>Unable to load stall</h1>
          <p class="stall-detail-description">Please try again later.</p>
        </div>
      `;
    });
}

// Get menu items for selected stall only
function getStallMenu() {
  fetch("/api/stalls/" + stallId + "/menu")
    .then((response) => response.json())
    .then((result) => {
      menuItemsData = result.data;

      displayCategoryButtons(menuItemsData);
      displayMenuItems(menuItemsData);
    })
    .catch((error) => {
      console.error("Error loading stall menu:", error);

      menuResultCount.textContent = "Unable to load menu.";

      menuContainer.innerHTML = `
        <div class="empty-message">
          Unable to load menu items. Please try again later.
        </div>
      `;
    });
}

// Display personalized stall header
function displayStallHeader(stall) {
  const isClosed = stall.opening_status === "closed";

  stallHeader.innerHTML = `
    <img 
      src="${stall.image_url}" 
      alt="${stall.stall_name}" 
      class="stall-detail-image"
    />

    <div class="stall-detail-content">
      <div class="stall-detail-top-row">
        <div>
          <span class="status-badge ${isClosed ? "status-closed" : "status-open"}">
            ${isClosed ? "Closed" : "Open"}
          </span>

          <h1>${stall.stall_name}</h1>

          <p class="stall-detail-cuisine">
            ${stall.cuisine_type}
          </p>
        </div>

        <div class="stall-rating-box">
          <span class="star-icon">★</span>
          <span>${stall.rating}</span>
          <small>${stall.rating_count} ratings</small>
        </div>
      </div>

      <p class="stall-detail-description">
        ${stall.stall_description}
      </p>

      <div class="stall-detail-info">
        <span class="info-pill">${stall.food_court}</span>
        <span class="info-pill">${stall.location_detail}</span>
        <span class="info-pill">Wait: ${stall.estimated_wait_time}</span>
        ${
          isClosed
            ? `<span class="info-pill">Opens: ${stall.opening_time}</span>`
            : `<span class="info-pill">Open until: ${stall.closing_time}</span>`
        }
      </div>

      <div class="dietary-row">
        ${stall.is_halal ? `<span class="dietary-badge">Halal</span>` : ""}
        ${stall.is_vegetarian ? `<span class="dietary-badge">Vegetarian</span>` : ""}
        ${stall.is_vegan ? `<span class="dietary-badge">Vegan</span>` : ""}
      </div>
    </div>
  `;
}

// Create category buttons based only on this stall's menu
function displayCategoryButtons(menuItems) {
  categoryContainer.innerHTML = "";

  const categories = ["All"];

  for (let i = 0; i < menuItems.length; i++) {
    const itemCategory = menuItems[i].category;

    if (!categories.includes(itemCategory)) {
      categories.push(itemCategory);
    }
  }

  for (let i = 0; i < categories.length; i++) {
    const button = document.createElement("button");
    button.className = "stall-category-btn";

    if (categories[i] === selectedCategory) {
      button.classList.add("active");
    }

    button.textContent = categories[i];

    button.addEventListener("click", () => {
      selectedCategory = categories[i];

      displayCategoryButtons(menuItemsData);
      filterMenuByCategory();
    });

    categoryContainer.appendChild(button);
  }
}

// Filter menu by selected category
function filterMenuByCategory() {
  if (selectedCategory === "All") {
    displayMenuItems(menuItemsData);
    return;
  }

  const filteredItems = [];

  for (let i = 0; i < menuItemsData.length; i++) {
    if (menuItemsData[i].category === selectedCategory) {
      filteredItems.push(menuItemsData[i]);
    }
  }

  displayMenuItems(filteredItems);
}

// Display menu items
function displayMenuItems(menuItems) {
  menuContainer.innerHTML = "";

  if (menuItems.length === 0) {
    menuResultCount.textContent = "Showing 0 items";

    menuContainer.innerHTML = `
      <div class="empty-message">
        No menu items found for this category.
      </div>
    `;
    return;
  }

  menuResultCount.textContent = "Showing " + menuItems.length + " items";

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];

    const isUnavailable = item.is_available === false;
    const stallClosed = selectedStall && selectedStall.opening_status === "closed";
    const disableAddButton = isUnavailable || stallClosed;

    const showHalal = selectedStall && selectedStall.is_halal;

    const showVegetarian =
      (selectedStall && selectedStall.is_vegetarian) ||
      item.category === "Vegetarian";

    const showVegan =
      (selectedStall && selectedStall.is_vegan) ||
      item.category === "Vegan";

    const card = document.createElement("div");
    card.className = "menu-card";

    if (isUnavailable) {
      card.classList.add("unavailable");
    }

    card.innerHTML = `
      <div class="menu-image-wrap">
        <img 
          src="${item.image_url}" 
          alt="${item.item_name}" 
          class="menu-image"
        />

        ${
          item.is_popular
            ? `<span class="popular-corner-badge">Popular</span>`
            : ""
        }
      </div>

      <div class="menu-content">
        <h3>${item.item_name}</h3>

        <div class="menu-indicator-row">
          <span class="menu-chip category-chip">${item.category}</span>

          ${
            showHalal
              ? `<span class="menu-chip halal-chip">Halal</span>`
              : ""
          }

          ${
            showVegetarian
              ? `<span class="menu-chip veg-chip">Vegetarian</span>`
              : ""
          }

          ${
            showVegan
              ? `<span class="menu-chip veg-chip">Vegan</span>`
              : ""
          }
        </div>

        <p class="menu-description">
          ${item.item_description}
        </p>

        ${
          item.variation && item.variation !== "None"
            ? `<p class="variation-text">Variation: ${item.variation}</p>`
            : ""
        }

        ${
          isUnavailable
            ? `<span class="status-badge status-closed">Unavailable</span>`
            : ""
        }

        <div class="menu-bottom-row">
          <span class="menu-price">$${Number(item.price).toFixed(2)}</span>

          ${
            disableAddButton
              ? `<button class="add-btn disabled" disabled>+</button>`
              : `<button class="add-btn" onclick="prepareCartItem('${item.item_id}')">+</button>`
          }
        </div>
      </div>
    `;

    menuContainer.appendChild(card);
  }
}

// Prepare cart item for future cart teammate
function prepareCartItem(itemId) {
  let selectedItem = null;

  for (let i = 0; i < menuItemsData.length; i++) {
    if (menuItemsData[i].item_id === itemId) {
      selectedItem = menuItemsData[i];
    }
  }

  if (selectedItem === null) {
    alert("Item not found.");
    return;
  }

  const cartItem = {
    item_id: selectedItem.item_id,
    stall_id: selectedItem.stall_id,
    stall_name: selectedItem.stall_name,
    item_name: selectedItem.item_name,
    variation: selectedItem.variation,
    price: selectedItem.price,
    image_url: selectedItem.image_url,
    quantity: 1,
  };

  addToCart(cartItem);
}