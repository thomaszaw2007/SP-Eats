// =========================================================
// SP QuickBite - Selected Stall Menu Page
// Uses API response names like stall_name, item_name, etc.
// =========================================================

// ---------- HTML ELEMENTS ----------
const stallHeader = document.getElementById('stallHeader');
const categoryContainer = document.getElementById('categoryContainer');
const menuContainer = document.getElementById('menuContainer');
const menuResultCount = document.getElementById('menuResultCount');
const menuItemModal = document.getElementById('menuItemModal');
const menuItemModalContent = document.getElementById('menuItemModalContent');
const closeMenuModalBtn = document.getElementById('closeMenuModalBtn');

// ---------- PAGE STATE ----------
const urlParams = new URLSearchParams(window.location.search);
const stallId = urlParams.get('stall_id');

let selectedStall = null;
let menuItemsData = [];
let selectedCategory = 'All';

// ---------- PAGE LOAD ----------
window.addEventListener('DOMContentLoaded', () => {
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

  if (!stallId) {
    showNoStallSelected();
    return;
  }

  getStallDetails();
  getStallMenu();
});

// =========================================================
// API
// =========================================================

function getStallDetails() {
  fetch('/api/stalls/' + stallId)
    .then((response) => response.json())
    .then((result) => {
      selectedStall = result.data;

      if (!selectedStall) {
        showNoStallSelected();
        return;
      }

      displayStallHeader(selectedStall);
      saveRecentlyViewedStall(selectedStall);
      refreshMenuDisplay();
    })
    .catch((error) => {
      console.error('Error loading stall details:', error);
      showStallError();
    });
}

function getStallMenu() {
  fetch('/api/stalls/' + stallId + '/menu')
    .then((response) => response.json())
    .then((result) => {
      menuItemsData = result.data || [];

      displayPopularPicks(menuItemsData);
      displayCategoryButtons(menuItemsData);
      filterMenuByCategory();
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
  const isClosed = stall.opening_status === 'closed';

  stallHeader.innerHTML = `
    <img 
      src="${stall.image_url}" 
      alt="${stall.stall_name}" 
      class="stall-detail-image"
      onerror="this.src='/images/default-food.jpg'"
    />

    <div class="stall-detail-content">
      <div class="stall-detail-top-row">
        <div>
          <span class="status-badge ${isClosed ? 'status-closed' : 'status-open'}">
            ${isClosed ? 'Closed' : 'Open'}
          </span>

          <h1>${stall.stall_name}</h1>
          <p class="stall-detail-cuisine">${stall.cuisine_type}</p>
        </div>

        <div class="stall-rating-box">
          <span class="star-icon">★</span>
          <span>${stall.rating}</span>
          <small>${stall.rating_count} ratings</small>
        </div>
      </div>

      <p class="stall-detail-description">${stall.stall_description}</p>

      ${isClosed ? createClosedBanner(stall) : ''}

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
        ${stall.is_halal ? `<span class="dietary-badge">Halal</span>` : ''}
        ${stall.is_vegetarian ? `<span class="dietary-badge">Vegetarian</span>` : ''}
        ${stall.is_vegan ? `<span class="dietary-badge">Vegan</span>` : ''}
      </div>
    </div>
  `;
}

function createClosedBanner(stall) {
  return `
    <div class="closed-stall-banner">
      <div class="closed-stall-icon">!</div>

      <div>
        <h3>This stall is currently closed</h3>
        <p>
          You can still view the menu, but ordering is unavailable.
          This stall opens at <strong>${stall.opening_time}</strong>.
        </p>
      </div>
    </div>
  `;
}

function showNoStallSelected() {
  stallHeader.innerHTML = `
    <div class="stall-detail-content">
      <h1>Stall not found</h1>
      <p class="stall-detail-description">
        No stall was selected. Please go back and choose a stall.
      </p>
    </div>
  `;

  menuResultCount.textContent = 'No menu available';

  menuContainer.innerHTML = `
    <div class="empty-message">
      Please select a stall from the Browse Stalls page.
    </div>
  `;
}

function showStallError() {
  stallHeader.innerHTML = `
    <div class="stall-detail-content">
      <h1>Unable to load stall</h1>
      <p class="stall-detail-description">Please try again later.</p>
    </div>
  `;
}

function showMenuError() {
  menuResultCount.textContent = 'Unable to load menu.';

  menuContainer.innerHTML = `
    <div class="empty-message">
      Unable to load menu items. Please try again later.
    </div>
  `;
}

// =========================================================
// POPULAR PICKS
// =========================================================

function displayPopularPicks(menuItems) {
  let popularSection = document.getElementById('popularPicksSection');

  if (!popularSection) {
    popularSection = document.createElement('section');
    popularSection.id = 'popularPicksSection';
    popularSection.className = 'popular-picks-section';
    categoryContainer.parentNode.insertBefore(popularSection, categoryContainer);
  }

  const popularItems = menuItems.filter((item) => item.is_popular === true);

  if (popularItems.length === 0) {
    popularSection.style.display = 'none';
    return;
  }

  popularSection.style.display = 'block';

  let html = `
    <div class="popular-picks-header">
      <div>
        <p class="small-title red-text">Popular Picks</p>
        <h3>Recommended from this stall</h3>
      </div>

      <span>${popularItems.length} popular item${popularItems.length === 1 ? '' : 's'}</span>
    </div>

    <div class="popular-picks-row">
  `;

  for (let i = 0; i < popularItems.length; i++) {
    html += createPopularItemHTML(popularItems[i]);
  }

  html += `</div>`;
  popularSection.innerHTML = html;
}

function createPopularItemHTML(item) {
  return `
    <div class="popular-pick-card">
      <img 
        src="${item.image_url}" 
        alt="${item.item_name}" 
        class="popular-pick-image"
        onerror="this.src='/images/default-food.jpg'"
      />

      <div class="popular-pick-content">
        <span class="popular-mini-badge">Popular</span>
        <h4>${item.item_name}</h4>
        <p>${item.category}</p>
        <strong>$${formatPrice(item.price)}</strong>
      </div>
    </div>
  `;
}

// =========================================================
// CATEGORY FILTER
// =========================================================

function displayCategoryButtons(menuItems) {
  categoryContainer.innerHTML = '';

  const categories = getMenuCategories(menuItems);

  for (let i = 0; i < categories.length; i++) {
    const button = document.createElement('button');
    button.className = 'stall-category-btn';
    button.textContent = categories[i];

    if (categories[i] === selectedCategory) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      selectedCategory = categories[i];
      displayCategoryButtons(menuItemsData);
      filterMenuByCategory();
    });

    categoryContainer.appendChild(button);
  }
}

function getMenuCategories(menuItems) {
  const categories = ['All'];

  for (let i = 0; i < menuItems.length; i++) {
    if (!categories.includes(menuItems[i].category)) {
      categories.push(menuItems[i].category);
    }
  }

  return categories;
}

function filterMenuByCategory() {
  if (selectedCategory === 'All') {
    displayMenuItems(menuItemsData);
    return;
  }

  const filteredItems = menuItemsData.filter((item) => {
    return item.category === selectedCategory;
  });

  displayMenuItems(filteredItems);
}

function refreshMenuDisplay() {
  if (menuItemsData.length > 0) {
    displayPopularPicks(menuItemsData);
    filterMenuByCategory();
  }
}

// =========================================================
// MENU CARDS
// =========================================================

function displayMenuItems(menuItems) {
  menuContainer.innerHTML = '';

  if (menuItems.length === 0) {
    menuResultCount.textContent = 'Showing 0 items';

    menuContainer.innerHTML = `
      <div class="empty-message">
        No menu items found for this category.
      </div>
    `;
    return;
  }

  menuResultCount.textContent = 'Showing ' + menuItems.length + ' items';

  for (let i = 0; i < menuItems.length; i++) {
    menuContainer.appendChild(createMenuCard(menuItems[i]));
  }
}

function createMenuCard(item) {
  const isUnavailable = item.is_available === false;
  const stallClosed = selectedStall && selectedStall.opening_status === 'closed';
  const disableAddButton = isUnavailable || stallClosed;

  const card = document.createElement('div');
  card.className = 'menu-card';

  if (isUnavailable) {
    card.classList.add('unavailable');
  }

  card.innerHTML = `
    <div class="menu-image-wrap">
      <img 
        src="${item.image_url}" 
        alt="${item.item_name}" 
        class="menu-image"
        onerror="this.src='/images/default-food.jpg'"
      />

      ${item.is_popular ? `<span class="popular-corner-badge">Popular</span>` : ''}
    </div>

    <div class="menu-content">
      <h3>${item.item_name}</h3>

      <div class="menu-indicator-row">
        ${createMenuChips(item)}
      </div>

      <p class="menu-description">${item.item_description}</p>

      ${
        item.variation && item.variation !== 'None'
          ? `<p class="variation-text">Variation: ${item.variation}</p>`
          : ''
      }

      ${isUnavailable ? `<span class="status-badge status-closed">Unavailable</span>` : ''}

      <div class="menu-bottom-row">
        <span class="menu-price">$${formatPrice(item.price)}</span>
      
      ${
        disableAddButton
          ? `<button class="add-btn disabled" disabled>+</button>`
          : `<button class="add-btn" type="button">+</button>`
      }
      </div>
    </div>
  `;

    card.addEventListener('click', () => {
    openMenuItemDetails(item.item_id);
  });

  const addButton = card.querySelector('.add-btn:not(.disabled)');

  if (addButton) {
    addButton.addEventListener('click', (event) => {
      event.stopPropagation();
      prepareCartItem(item.item_id);
    });
  }

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
// MENU ITEM DETAILS MODAL
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

  menuItemModalContent.innerHTML = `
    <div class="menu-modal-layout">
      <div class="menu-modal-image-wrap">
        <img
          src="${item.image_url}"
          alt="${item.item_name}"
          class="menu-modal-image"
          onerror="this.src='/images/default-food.jpg'"
        />

        ${item.is_popular ? `<span class="popular-corner-badge">Popular</span>` : ''}
      </div>

      <div class="menu-modal-info">
        <p class="small-title red-text">Menu Item Details</p>

        <h2>${item.item_name}</h2>

        ${
          item.variation && item.variation !== 'None'
            ? `<p class="variation-text">Variation: ${item.variation}</p>`
            : ''
        }

        <div class="menu-modal-badges">
          <span class="menu-chip category-chip">${item.category}</span>
          <span class="menu-chip">${item.food_court}</span>
          <span class="menu-chip">${item.cuisine_type}</span>
          ${
            isUnavailable
              ? `<span class="status-badge status-closed">Unavailable</span>`
              : `<span class="status-badge status-open">Available</span>`
          }
        </div>

        <p class="menu-modal-description">
          ${item.item_description}
        </p>

        <div class="menu-modal-section">
          <h4>Stall Information</h4>
          <p><strong>${item.stall_name}</strong></p>
          <p>${item.stall_description}</p>
          <p>Wait time: ${item.estimated_wait_time}</p>
          <p>Stall rating: ★ ${item.stall_rating}</p>
        </div>

        <div class="menu-modal-section">
          <h4>Food Court Information</h4>
          <p><strong>${item.food_court}</strong> - ${item.food_court_location}</p>
          <p>${item.food_court_description}</p>
        </div>

        <div class="menu-modal-bottom">
          <span class="menu-modal-price">$${formatPrice(item.price)}</span>

          ${
            disableAddButton
              ? `<button class="details-add-btn disabled" disabled>Unavailable</button>`
              : `<button class="details-add-btn" onclick="prepareCartItem('${item.item_id}')">Add to Cart</button>`
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

// =========================================================
// CART PREPARATION
// =========================================================

function prepareCartItem(itemId) {
  const selectedItem = menuItemsData.find((item) => item.item_id === itemId);

  if (!selectedItem) {
    alert('Item not found.');
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

  console.log('Cart item prepared:', cartItem);
  alert('Cart feature coming soon.');
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

function formatPrice(price) {
  return Number(price).toFixed(2);
}

window.prepareCartItem = prepareCartItem;
