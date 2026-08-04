// =========================================================
// SP QuickBite - Selected Stall Menu Page
// Handles: compact stall hero, menu search/sort/category, dish modal, cart prep
// =========================================================

// ---------- HTML ELEMENTS ----------
const stallHeader = document.getElementById('stallHeader');
const categoryContainer = document.getElementById('categoryContainer');
const menuContainer = document.getElementById('menuContainer');
const menuResultCount = document.getElementById('menuResultCount');

const menuItemModal = document.getElementById('menuItemModal');
const menuItemModalContent = document.getElementById('menuItemModalContent');
const closeMenuModalBtn = document.getElementById('closeMenuModalBtn');

const stallMenuSearch = document.getElementById('stallMenuSearch');
const clearStallMenuSearchBtn = document.getElementById('clearStallMenuSearchBtn');
const stallMenuSort = document.getElementById('stallMenuSort');

// ---------- PAGE STATE ----------
const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get('stall_id');
const apiStallId = getApiStallId(stallId);

function getApiStallId(id) {
  if (!id) {
    return null;
  }

  if (id.startsWith('stall_')) {
    return String(Number(id.replace('stall_', '')));
  }

  return id;
}

let selectedStall = null;
let menuItemsData = [];
let selectedCategory = 'All';
let selectedSearchQuery = '';
let selectedSortOption = 'default';

// =========================================================
// PAGE LOAD
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
  setupModalEvents();
  setupSearchAndSortEvents();

if (!apiStallId) {
    showNoStallSelected();
    return;
  }

  getStallDetails();
  getStallMenu();
});

// =========================================================
// SETUP EVENTS
// =========================================================

function setupModalEvents() {
  if (closeMenuModalBtn) {
    closeMenuModalBtn.addEventListener('click', closeMenuItemModal);
  }

  if (menuItemModal) {
    menuItemModal.addEventListener('click', (event) => {
      if (event.target === menuItemModal) {
        closeMenuItemModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenuItemModal();
    }
  });
}

function setupSearchAndSortEvents() {
  if (stallMenuSearch) {
    stallMenuSearch.addEventListener('input', () => {
      selectedSearchQuery = stallMenuSearch.value.trim().toLowerCase();
      filterAndDisplayMenu();
    });
  }

  if (clearStallMenuSearchBtn) {
    clearStallMenuSearchBtn.addEventListener('click', () => {
      stallMenuSearch.value = '';
      selectedSearchQuery = '';
      filterAndDisplayMenu();
    });
  }

  if (stallMenuSort) {
    stallMenuSort.addEventListener('change', () => {
      selectedSortOption = stallMenuSort.value;
      filterAndDisplayMenu();
    });
  }
}

// =========================================================
// API
// =========================================================

function getStallDetails() {
    fetch('/api/stalls/' + apiStallId)
    .then((response) => response.json())
    .then((result) => {
      selectedStall = result.data;

      if (!selectedStall) {
        showNoStallSelected();
        return;
      }

      displayStallHeader(selectedStall);
      saveRecentlyViewedStall(selectedStall);
    })
    .catch((error) => {
      console.error('Error loading stall details:', error);
      showStallError();
    });
}

function getStallMenu() {
  fetch('/api/stalls/' + apiStallId + '/menu')
    .then((response) => response.json())
    .then((result) => {
      menuItemsData = result.data || [];

      displayCategoryButtons(menuItemsData);
      filterAndDisplayMenu();
    })
    .catch((error) => {
      console.error('Error loading stall menu:', error);
      showMenuError();
    });
}

// =========================================================
// STALL HEADER
// =========================================================

function displayStallHeader(stall) {
  const stallName = stall.stall_name || stall.name || 'Selected Stall';
  const cuisine = stall.cuisine_type || stall.cuisine || 'Campus Food';
  const rating = Number(stall.rating || stall.stall_rating || 0);
  const ratingCount = Number(stall.rating_count || stall.review_count || 0);
  const isClosed = stall.opening_status === 'closed';

  stallHeader.innerHTML = `
    <div class="teen-stall-hero">
      <div class="teen-stall-glow"></div>
      <div class="teen-stall-bg-text">QUICKBITE</div>

      <div class="teen-stall-left">
        <a href="./stalls.html" class="teen-back-link">← Back to Stalls</a>

        <h1>${stallName}</h1>

        <div class="teen-cuisine-line">
          <span>${cuisine}</span>
        </div>
      </div>

      <div class="teen-stall-right">
        <div class="teen-rating-pill">
          <span class="teen-stars">★★★★★</span>
          <strong>${formatRating(rating)}</strong>
          <span>(${ratingCount})</span>
        </div>

        <span class="${isClosed ? 'teen-open-pill closed' : 'teen-open-pill open'}">
          ${isClosed ? 'Closed' : 'Open'}
        </span>
      </div>
    </div>
  `;
}

function showNoStallSelected() {
  if (stallHeader) {
    stallHeader.innerHTML = `
      <div class="stall-detail-content">
        <h1>Stall not found</h1>
        <p class="stall-detail-description">
          No stall was selected. Please go back and choose a stall.
        </p>
      </div>
    `;
  }

  if (menuResultCount) {
    menuResultCount.textContent = 'No menu available';
  }

  if (menuContainer) {
    menuContainer.innerHTML = `
      <div class="empty-message">
        Please select a stall from the Browse Stalls page.
      </div>
    `;
  }
}

function showStallError() {
  if (!stallHeader) {
    return;
  }

  stallHeader.innerHTML = `
    <div class="stall-detail-content">
      <h1>Unable to load stall</h1>
      <p class="stall-detail-description">Please try again later.</p>
    </div>
  `;
}

function showMenuError() {
  if (menuResultCount) {
    menuResultCount.textContent = 'Unable to load menu.';
  }

  if (menuContainer) {
    menuContainer.innerHTML = `
      <div class="empty-message">
        Unable to load menu items. Please try again later.
      </div>
    `;
  }
}

// =========================================================
// CATEGORY + SEARCH + SORT
// =========================================================

function displayCategoryButtons(menuItems) {
  if (!categoryContainer) {
    return;
  }

  categoryContainer.innerHTML = '';

  const categories = getMenuCategories(menuItems);

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.className = 'stall-category-btn';
    button.textContent = category;

    if (category === selectedCategory) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      selectedCategory = category;
      displayCategoryButtons(menuItemsData);
      filterAndDisplayMenu();
    });

    categoryContainer.appendChild(button);
  });
}

function getMenuCategories(menuItems) {
  const categories = ['All'];

  menuItems.forEach((item) => {
    if (item.category && !categories.includes(item.category)) {
      categories.push(item.category);
    }
  });

  return categories;
}

function filterAndDisplayMenu() {
  let filteredMenu = [...menuItemsData];

  if (selectedCategory !== 'All') {
    filteredMenu = filteredMenu.filter((item) => {
      return item.category === selectedCategory;
    });
  }

  if (selectedSearchQuery) {
    const searchText = selectedSearchQuery.toLowerCase().trim();

    filteredMenu = filteredMenu.filter((item) => {
      const itemName = String(item.item_name || item.name || '').toLowerCase();

      return itemName.includes(searchText);
    });
  }

  filteredMenu = sortMenuItems(filteredMenu);

  displayMenuItems(filteredMenu);
}

function sortMenuItems(menuItems) {
  const sortedItems = [...menuItems];

  if (selectedSortOption === 'name-asc') {
    sortedItems.sort((firstItem, secondItem) => {
      return firstItem.item_name.localeCompare(secondItem.item_name);
    });
  }

  if (selectedSortOption === 'price-asc') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(firstItem.price) - Number(secondItem.price);
    });
  }

  if (selectedSortOption === 'price-desc') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(secondItem.price) - Number(firstItem.price);
    });
  }

  if (selectedSortOption === 'popular-first') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(secondItem.is_popular) - Number(firstItem.is_popular);
    });
  }

  if (selectedSortOption === 'available-first') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(secondItem.is_available) - Number(firstItem.is_available);
    });
  }

  return sortedItems;
}

// =========================================================
// MENU CARDS
// =========================================================

function displayMenuItems(menuItems) {
  if (!menuContainer) {
    return;
  }

  menuContainer.innerHTML = '';

  if (!menuItems || menuItems.length === 0) {
    menuContainer.innerHTML = `
      <div class="empty-message">
        <h3>No menu items found</h3>
        <p>Try another search keyword, category, or sort option.</p>
      </div>
    `;

    if (menuResultCount) {
      menuResultCount.textContent = '0 items found';
    }

    return;
  }

  if (menuResultCount) {
    menuResultCount.textContent = `${menuItems.length} item${menuItems.length === 1 ? '' : 's'} found`;
  }

  menuItems.forEach((item) => {
    const menuCard = createMenuCard(item);
    menuContainer.appendChild(menuCard);
  });
}

function createMenuCard(item) {
  const card = document.createElement('article');
  card.className = 'menu-card';

  if (!item.is_available) {
    card.classList.add('unavailable');
  }

  const itemRating = Number(item.item_rating || 0);
  const reviewCount = Number(item.item_review_count || 0);
  const itemCategory = item.category || 'Food';
  const selectedItemId = item.item_id || item.food_id;

  card.innerHTML = `
    <div class="menu-image-wrap">
      ${
        item.image_url
          ? `<img 
              src="${item.image_url}" 
              alt="${item.item_name}" 
              class="menu-image"
            />`
          : `<div class="menu-image menu-image-placeholder">
              <span>No image yet</span>
            </div>`
      }

      ${item.is_popular ? `<span class="popular-corner-badge">🔥 Popular</span>` : ''}

      <button class="menu-fav-btn" type="button" aria-label="Favourite food">
        ♡
      </button>
    </div>

    <div class="menu-card-body">
      <div class="menu-card-title-row">
        <h3>${item.item_name}</h3>
        <span class="menu-category-pill">${itemCategory}</span>
      </div>

      <div class="menu-card-rating-row">
        <span class="menu-stars">★★★★★</span>
        <strong>${formatRating(itemRating)}</strong>
        <span>(${reviewCount})</span>
      </div>

      <div class="menu-card-bottom-row">
        <p class="menu-price">$${formatPrice(item.price)}</p>

        <button class="menu-add-btn" type="button" aria-label="Add food">
          +
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    openMenuItemDetails(selectedItemId);
  });

  const favouriteButton = card.querySelector('.menu-fav-btn');
  favouriteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    favouriteButton.classList.toggle('active');
    favouriteButton.textContent = favouriteButton.classList.contains('active') ? '♥' : '♡';
  });

  const addButton = card.querySelector('.menu-add-btn');
  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    prepareCartItem(selectedItemId);
  });

  return card;
}

function createMenuChips(item) {
  let chips = `<span class="menu-chip category-chip">${item.category}</span>`;

  if (selectedStall && selectedStall.is_halal) {
    chips += `<span class="menu-chip halal-chip">Halal</span>`;
  }

  if ((selectedStall && selectedStall.is_vegetarian) || item.category === 'Vegetarian') {
    chips += `<span class="menu-chip veg-chip">Vegetarian</span>`;
  }

  if ((selectedStall && selectedStall.is_vegan) || item.category === 'Vegan') {
    chips += `<span class="menu-chip veg-chip">Vegan</span>`;
  }

  return chips;
}

// =========================================================
// DISH DETAILS MODAL
// =========================================================

function openMenuItemDetails(itemId) {
  if (!menuItemModal || !menuItemModalContent) {
    return;
  }

  menuItemModal.classList.remove('hidden');

  menuItemModalContent.innerHTML = `
    <div class="modal-loading">
      Loading menu item details...
    </div>
  `;

  fetch('/api/menu-items/' + itemId)
    .then((response) => response.json())
    .then((result) => {
      if (!result.success || !result.data) {
        showMenuItemModalError();
        return;
      }

      displayMenuItemDetails(result.data);
      saveRecentlyViewedMenuItem(result.data);
    })
    .catch((error) => {
      console.error('Error loading menu item details:', error);
      showMenuItemModalError();
    });
}

function displayMenuItemDetails(item) {
const isUnavailable = item.is_available === false;
const stallClosed = item.opening_status === 'closed';
const disableAddButton = isUnavailable || stallClosed;
const selectedModalItemId = item.item_id || item.food_id;

  menuItemModalContent.innerHTML = `
    <div class="qb-dish-modal">
      <div class="qb-dish-image-panel">
      ${
        item.image_url
          ? `<img
              src="${item.image_url}"
              alt="${item.item_name}"
              class="qb-dish-image"
            />`
          : `<div class="qb-dish-image qb-dish-image-placeholder">
              <span>No image yet</span>
            </div>`
      }

        ${item.is_popular ? `<span class="qb-popular-badge">🔥 Popular</span>` : ''}
      </div>

      <div class="qb-dish-details-panel">
        <button class="qb-modal-x" type="button" onclick="closeMenuItemModal()">×</button>

        <div class="qb-dish-title-row">
          <div>
            <h2>${item.item_name}</h2>

            <div class="qb-status-line">
              ${
                isUnavailable
                  ? `<span class="qb-status-badge closed">Unavailable</span>`
                  : `<span class="qb-status-badge open">Available</span>`
              }

              <span>${item.category}</span>
            </div>
          </div>
        </div>

        ${
          item.variation && item.variation !== 'None'
            ? `<p class="qb-variation">Variation: ${item.variation}</p>`
            : ''
        }

        <p class="qb-dish-description">
          ${item.item_description}
        </p>

        <div class="qb-rating-row">
          <span class="qb-stars">★★★★★</span>
          <strong>${formatRating(item.item_rating || 0)}</strong>
          <span>(${Number(item.item_review_count || 0)})</span>
        </div>

        <div class="qb-macro-row">
          <span class="qb-macro ${getLevelClass(item.carb_level)}">${item.carb_level}</span>
          <span class="qb-macro ${getLevelClass(item.protein_level)}">${item.protein_level}</span>
          <span class="qb-macro ${getLevelClass(item.fat_level)}">${item.fat_level}</span>
          <span class="qb-macro ${getLevelClass(item.sugar_level)}">${item.sugar_level} Sugar</span>
        </div>

        <div class="qb-meta-grid">
          <div class="qb-meta-card">
            <p>Calories</p>
            <strong>${item.calories} kcal</strong>
          </div>

          <div class="qb-meta-card">
            <p>Carb Level</p>
            <strong>${item.carb_level}</strong>
          </div>

          <div class="qb-meta-card">
            <p>Protein</p>
            <strong>${item.protein_level}</strong>
          </div>

          <div class="qb-meta-card">
            <p>Sugar</p>
            <strong>${item.sugar_level}</strong>
          </div>

          <div class="qb-meta-card">
            <p>Spice</p>
            <strong>${item.spice_level}</strong>
          </div>

          <div class="qb-meta-card">
            <p>Portion</p>
            <strong>${item.portion_size}</strong>
          </div>
        </div>

        <div class="qb-allergen-block">
          <p>Allergens</p>

          <div class="qb-allergen-tags">
            <span>${item.allergen_info}</span>
          </div>
        </div>

        <div class="qb-available-block">
          <p>Available at</p>

          <div>
            <span>${item.stall_name}</span>
            <span>${item.food_court}</span>
          </div>
        </div>

        <div class="qb-modal-footer">
          <div class="qb-modal-price-box">
            <span>Price</span>
            <strong>$${formatPrice(item.price)}</strong>
          </div>

          ${
            disableAddButton
              ? `<button class="qb-add-cart disabled" disabled>Unavailable</button>`
              : `<button class="qb-add-cart" onclick="prepareCartItem('${selectedModalItemId}')">
                  Add to Cart
                </button>`
          }
        </div>
      </div>
    </div>
  `;
}

function closeMenuItemModal() {
  if (!menuItemModal) {
    return;
  }

  menuItemModal.classList.add('hidden');
}

function showMenuItemModalError() {
  menuItemModalContent.innerHTML = `
    <div class="modal-error">
      <h3>Unable to load menu item</h3>
      <p>Please try again later.</p>
    </div>
  `;
}

function getLevelClass(value) {
  if (!value) {
    return 'level-medium';
  }

  const lowerValue = value.toLowerCase();

  if (lowerValue.includes('high')) {
    return 'level-high';
  }

  if (lowerValue.includes('low')) {
    return 'level-low';
  }

  return 'level-medium';
}

// =========================================================
// CART PREPARATION
// =========================================================

function prepareCartItem(itemId) {
  const selectedItem = menuItemsData.find((item) => {
    return String(item.item_id || item.food_id) === String(itemId);
  });

  if (!selectedItem) {
    alert('Item not found.');
    return;
  }

  const cartItem = {
    item_id: selectedItem.item_id || selectedItem.food_id,
    stall_id: selectedItem.stall_id,
    stall_name: selectedItem.stall_name,
    item_name: selectedItem.item_name,
    variation: selectedItem.variation,
    price: selectedItem.price,
    image_url: selectedItem.image_url,
    quantity: 1,
  };

  console.log('Cart item prepared:', cartItem);
  alert(`${selectedItem.item_name} added to cart.`);
}
// =========================================================
// RECENTLY VIEWED
// =========================================================

function saveRecentlyViewedMenuItem(item) {
  let recentlyViewedItems = getRecentlyViewedMenuItems();

  recentlyViewedItems = recentlyViewedItems.filter((recentItem) => {
    return recentItem.item_id !== item.item_id;
  });

  recentlyViewedItems.unshift({
    item_id: item.item_id,
    item_name: item.item_name,
    item_description: item.item_description,
    price: item.price,
    category: item.category,
    image_url: item.image_url,
    stall_name: item.stall_name,
    food_court: item.food_court,
    is_available: item.is_available,
  });

  recentlyViewedItems = recentlyViewedItems.slice(0, 5);

  localStorage.setItem('recentlyViewedMenuItems', JSON.stringify(recentlyViewedItems));
}

function getRecentlyViewedMenuItems() {
  const savedData = localStorage.getItem('recentlyViewedMenuItems');

  if (!savedData) {
    return [];
  }

  try {
    return JSON.parse(savedData);
  } catch {
    localStorage.removeItem('recentlyViewedMenuItems');
    return [];
  }
}

function saveRecentlyViewedStall(stall) {
  let recentlyViewed = getRecentlyViewedStalls();

  recentlyViewed = recentlyViewed.filter((recentStall) => {
    return recentStall.stall_id !== stall.stall_id;
  });

  recentlyViewed.unshift({
    stall_id: stall.stall_id,
    stall_name: stall.stall_name,
    cuisine_type: stall.cuisine_type,
    food_court: stall.food_court,
    image_url: stall.image_url,
    opening_status: stall.opening_status,
    rating: stall.rating,
    rating_count: stall.rating_count,
  });

  recentlyViewed = recentlyViewed.slice(0, 4);

  localStorage.setItem('recentlyViewedStalls', JSON.stringify(recentlyViewed));
}

function getRecentlyViewedStalls() {
  const savedData = localStorage.getItem('recentlyViewedStalls');

  if (!savedData) {
    return [];
  }

  try {
    return JSON.parse(savedData);
  } catch {
    localStorage.removeItem('recentlyViewedStalls');
    return [];
  }
}

// =========================================================
// HELPERS
// =========================================================

function formatPrice(price) {
  return Number(price).toFixed(2);
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}

// Allow inline onclick handlers to work
window.prepareCartItem = prepareCartItem;
window.closeMenuItemModal = closeMenuItemModal;