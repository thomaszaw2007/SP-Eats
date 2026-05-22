const menuContainer = document.getElementById("menuContainer");
const menuResultCount = document.getElementById("menuResultCount");
const menuSearchInput = document.getElementById("menuSearchInput");
const menuSearchButton = document.getElementById("menuSearchButton");
const menuFilterButtons = document.querySelectorAll(".menu-filter-btn");
const sortSelect = document.getElementById("sortSelect");

let menuItemsData = [];

// Load all menu items when the page opens
window.addEventListener("DOMContentLoaded", () => {
  getMenuItems("/api/menu-items");
});

// Search button
menuSearchButton.addEventListener("click", () => {
  const searchText = menuSearchInput.value.trim();

  if (searchText === "") {
    getMenuItems("/api/menu-items");
  } else {
    getMenuItems("/api/menu-items?search=" + encodeURIComponent(searchText));
  }

  setActiveMenuButton(null);
  sortSelect.value = "";
});

// Press Enter to search
menuSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    menuSearchButton.click();
  }
});

// Filter buttons
menuFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.type;
    const value = button.dataset.value;

    setActiveMenuButton(button);
    menuSearchInput.value = "";
    sortSelect.value = "";

    if (type === "all") {
      getMenuItems("/api/menu-items");
    } else if (type === "category") {
      getMenuItems("/api/menu-items?category=" + encodeURIComponent(value));
    } else if (type === "popular") {
      getMenuItems("/api/menu-items?popular=true");
    } else if (type === "available") {
      getMenuItems("/api/menu-items?available=true");
    }
  });
});

// Sort dropdown
sortSelect.addEventListener("change", () => {
  const sortValue = sortSelect.value;

  if (sortValue === "") {
    getMenuItems("/api/menu-items");
  } else {
    getMenuItems("/api/menu-items?sort=" + encodeURIComponent(sortValue));
  }

  setActiveMenuButton(null);
  menuSearchInput.value = "";
});

// Fetch menu items from backend
function getMenuItems(url) {
  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      menuItemsData = result.data;
      displayMenuItems(menuItemsData);
    })
    .catch((error) => {
      console.error("Error loading menu items:", error);

      menuContainer.innerHTML = `
        <div class="empty-message">
          Unable to load menu items. Please try again later.
        </div>
      `;
    });
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

        <p class="stall-info">${item.stall_name}</p>

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

// Prepare item object for future cart connection
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
    price: selectedItem.price,
    image_url: selectedItem.image_url,
    quantity: 1,
  };

  console.log("Cart item prepared:", cartItem);
  alert("Cart feature coming soon.");
}

// Make selected filter red
function setActiveMenuButton(activeButton) {
  menuFilterButtons.forEach((button) => {
    button.classList.remove("active");
  });

  if (activeButton) {
    activeButton.classList.add("active");
  }
}