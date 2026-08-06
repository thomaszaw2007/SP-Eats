// =========================================================
// SP Eats - Selected Stall Menu Page
// Handles: stall hero, menu search/sort/category, dish modal, cart storage,
// favourite meals, and try later meals.
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

let selectedStall = null;
let menuItemsData = [];
let selectedCategory = 'All';
let selectedSearchQuery = '';
let selectedSortOption = 'default';
let latestModalItem = null;

// ---------- STORAGE KEYS ----------
const favouriteMealsKey = 'spEatsFavouriteMeals';
const tryLaterMealsKey = 'spEatsTryLaterMeals';
const cartItemsKey = 'spEatsCartItems';

// These keep your old quiz/review saved data connected while moving to SP Eats.
const oldFavouriteMealsKey = 'quickbiteFavouriteMeals';
const oldTryLaterMealsKey = 'quickbiteTryLaterMeals';

// =========================================================
// PAGE LOAD
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
  setupModalEvents();
  setupSearchAndSortEvents();
  setupSaveMealEvents();
  setupImageFallbacks();

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

function setupSaveMealEvents() {
  document.addEventListener(
    'click',
    (event) => {
      const saveButton = event.target.closest('[data-save-meal]');

      if (!saveButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const mealId = saveButton.dataset.foodId;
      const saveType = saveButton.dataset.saveMeal;

      const selectedMeal =
        menuItemsData.find((item) => {
          return String(getMenuItemId(item)) === String(mealId);
        }) || latestModalItem;

      if (!selectedMeal) {
        return;
      }

      const isSaved = toggleMealForSpEats(saveType, selectedMeal);
      const isFavourite = saveType === 'favourite';

      saveButton.classList.toggle('saved', isSaved);
      saveButton.setAttribute('aria-pressed', String(isSaved));
      saveButton.setAttribute(
        'title',
        isSaved
          ? `Remove from ${isFavourite ? 'Favourite' : 'Try Later'}`
          : `Save to ${isFavourite ? 'Favourite' : 'Try Later'}`,
      );

      const saveLabel = saveButton.querySelector('.save-btn-label');

      if (saveLabel) {
        saveLabel.textContent = isSaved
          ? `Saved ${isFavourite ? 'Favourite' : 'Try Later'}`
          : isFavourite
            ? 'Add Favourite'
            : 'Try Later';
      } else if (saveButton.classList.contains('sp-eats-save-btn')) {
        saveButton.textContent = isSaved
          ? `Saved ${isFavourite ? 'Favourite' : 'Try Later'}`
          : isFavourite
            ? 'Add Favourite'
            : 'Try Later';
      }

      showSavedMealToast(
        isSaved
          ? `Saved to ${isFavourite ? 'Favourite' : 'Try Later'}`
          : `Removed from ${isFavourite ? 'Favourite' : 'Try Later'}`,
      );
    },
    true,
  );
}

function setupImageFallbacks() {
  document.addEventListener(
    'error',
    (event) => {
      const image = event.target;

      if (!(image instanceof HTMLImageElement)) {
        return;
      }

      const fallback = document.createElement('div');
      fallback.className = `${image.className || ''} sp-image-fallback`.trim();
      fallback.setAttribute('role', 'img');
      fallback.setAttribute('aria-label', image.alt || 'Image unavailable');
      fallback.innerHTML = '<span>No image yet</span>';

      image.replaceWith(fallback);
    },
    true,
  );
}

function showSavedMealToast(message) {
  const oldToast = document.querySelector('.sp-save-toast');

  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'sp-save-toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 20);

  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => {
      toast.remove();
    }, 220);
  }, 1500);
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
      <div class="teen-stall-bg-text">SP EATS</div>

      <div class="teen-stall-left">
        <a href="./stalls.html" class="teen-back-link">Back to Stalls</a>

        <h1>${escapeHtml(stallName)}</h1>

        <div class="teen-cuisine-line">
          <span>${escapeHtml(cuisine)}</span>
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
      return String(firstItem.item_name || '').localeCompare(String(secondItem.item_name || ''));
    });
  }

  if (selectedSortOption === 'price-asc') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(firstItem.price || 0) - Number(secondItem.price || 0);
    });
  }

  if (selectedSortOption === 'price-desc') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(secondItem.price || 0) - Number(firstItem.price || 0);
    });
  }

  if (selectedSortOption === 'popular-first') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(Boolean(secondItem.is_popular)) - Number(Boolean(firstItem.is_popular));
    });
  }

  if (selectedSortOption === 'available-first') {
    sortedItems.sort((firstItem, secondItem) => {
      return Number(Boolean(secondItem.is_available)) - Number(Boolean(firstItem.is_available));
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

function getHeartIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="menu-save-icon-svg">
      <path d="M12 20.4 4.9 13.8C2.7 11.8 2 8.7 4 6.7c1.7-1.7 4.4-1.7 6.1 0L12 8.6l1.9-1.9c1.7-1.7 4.4-1.7 6.1 0 2 2 1.3 5.1-.9 7.1L12 20.4Z"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `;
}

function getClockIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="menu-save-icon-svg">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function createMenuCard(item) {
  const card = document.createElement('article');
  card.className = 'menu-card menu-card-modern';

  if (!item.is_available) {
    card.classList.add('unavailable');
  }

  const itemRating = Number(item.item_rating || 0);
  const reviewCount = Number(item.item_review_count || 0);
  const itemCategory = item.category || 'Food';
  const selectedItemId = getMenuItemId(item);
  const isFavouriteSaved = isMealSavedForSpEats('favourite', selectedItemId);
  const isTryLaterSaved = isMealSavedForSpEats('tryLater', selectedItemId);

  card.innerHTML = `
    <div class="menu-card-top">
      <div class="menu-image-wrap modern">
        ${
          item.image_url
            ? `<img
                src="${escapeHtml(item.image_url)}"
                alt="${escapeHtml(item.item_name || 'Menu item')}"
                class="menu-image"
              />`
            : `<div class="menu-image menu-image-placeholder">
                <span>No image yet</span>
              </div>`
        }

        <div class="menu-save-actions">
          <button
  type="button"
  class="menu-save-icon-btn favourite-btn ${isFavouriteSaved ? 'saved' : ''}"
  data-save-meal="favourite"
  data-food-id="${escapeHtml(String(selectedItemId))}"
  title="${isFavouriteSaved ? 'Remove from Favourite' : 'Save to Favourite'}"
  aria-label="Save to Favourite"
  aria-pressed="${isFavouriteSaved ? 'true' : 'false'}"
>
  ${getHeartIcon()}
</button>

<button
  type="button"
  class="menu-save-icon-btn trylater-btn ${isTryLaterSaved ? 'saved' : ''}"
  data-save-meal="tryLater"
  data-food-id="${escapeHtml(String(selectedItemId))}"
  title="${isTryLaterSaved ? 'Remove from Try Later' : 'Save to Try Later'}"
  aria-label="Save to Try Later"
  aria-pressed="${isTryLaterSaved ? 'true' : 'false'}"
>
  ${getClockIcon()}
</button>
        </div>

        ${item.is_popular ? `<span class="popular-corner-badge">Popular</span>` : ''}
      </div>
    </div>

    <div class="menu-card-body modern">
      <div class="menu-card-title-row modern">
        <h3>${escapeHtml(item.item_name || 'Untitled Item')}</h3>
        <span class="menu-category-pill">${escapeHtml(itemCategory)}</span>
      </div>

      <div class="menu-card-rating-row modern">
        <span class="menu-stars">★★★★★</span>
        <strong>${formatRating(itemRating)}</strong>
        <span>(${reviewCount})</span>
      </div>

      <div class="menu-card-bottom-row modern">
        <div class="menu-price-block">
          <p class="menu-price">$${formatPrice(item.price)}</p>
        </div>

        <button class="menu-add-btn modern" type="button" aria-label="Add food">
          +
        </button>
      </div>
    </div>
  `;

  card.addEventListener('click', () => {
    openMenuItemDetails(selectedItemId);
  });

  const addButton = card.querySelector('.menu-add-btn');

  if (addButton) {
    addButton.addEventListener('click', (event) => {
      event.stopPropagation();
      prepareCartItem(selectedItemId);
    });
  }

  return card;
}

function getMenuItemId(item) {
  return item.item_id || item.food_id || item.id;
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

      latestModalItem = result.data;
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
  const selectedModalItemId = getMenuItemId(item);

  const itemRating = Number(item.item_rating || item.rating || 0);
  const reviewCount = Number(item.item_review_count || item.review_count || 0);
  const isFavouriteSaved = isMealSavedForSpEats('favourite', selectedModalItemId);
  const isTryLaterSaved = isMealSavedForSpEats('tryLater', selectedModalItemId);

  const stallName = item.stall_name || selectedStall?.stall_name || 'Selected Stall';
  const foodCourtName =
    item.food_court || item.foodcourt_name || selectedStall?.food_court || 'SP Food Court';

  const prepTimeText = item.prep_time_minutes
    ? `${Number(item.prep_time_minutes)} min`
    : item.estimated_wait_time || 'Ask stall';

  menuItemModalContent.innerHTML = `
    <div class="qb-dish-modal qb-polished-dish-modal">
      <div class="qb-dish-image-panel qb-polished-image-panel">
        ${
          item.image_url
            ? `<img
                src="${escapeHtml(item.image_url)}"
                alt="${escapeHtml(item.item_name || 'Menu item')}"
                class="qb-dish-image"
              />`
            : `<div class="qb-dish-image qb-dish-image-placeholder sp-image-fallback">
                <span>No image yet</span>
              </div>`
        }

        ${item.is_popular ? `<span class="qb-popular-badge">Popular</span>` : ''}
      </div>

      <div class="qb-dish-details-panel qb-polished-details-panel">
        <button class="qb-modal-x" type="button" onclick="closeMenuItemModal()">×</button>

        <div class="qb-polished-title-area">
          <p class="qb-polished-stall-name">
            ${escapeHtml(stallName)}
          </p>

          <h2>${escapeHtml(item.item_name || 'Untitled Item')}</h2>

          <div class="qb-status-line qb-clean-status-line">
            ${
              isUnavailable
                ? `<span class="qb-status-badge closed">Unavailable</span>`
                : `<span class="qb-status-badge open">Available</span>`
            }

            <span>${escapeHtml(item.category || 'Food')}</span>

            ${
              item.variation && item.variation !== 'None'
                ? `<span>${escapeHtml(item.variation)}</span>`
                : ''
            }
          </div>
        </div>

        <div class="qb-clean-rating-price">
          <div class="qb-clean-rating-box">
            <span class="qb-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <strong>${formatRating(itemRating)}</strong>
            <small>${reviewCount} review${reviewCount === 1 ? '' : 's'}</small>
          </div>

          <div class="qb-clean-price-box">
            <span>Price</span>
            <strong>$${formatPrice(item.price)}</strong>
          </div>
        </div>

        <p class="qb-dish-description qb-polished-description">
          ${escapeHtml(item.item_description || item.description || 'No description available.')}
        </p>

        <div class="qb-macro-row qb-polished-macro-row">
          <span class="qb-macro ${getLevelClass(item.carb_level)}">
            ${escapeHtml(item.carb_level || 'Medium carb')}
          </span>

          <span class="qb-macro ${getLevelClass(item.protein_level)}">
            ${escapeHtml(item.protein_level || 'Medium protein')}
          </span>

          <span class="qb-macro ${getLevelClass(item.fat_level)}">
            ${escapeHtml(item.fat_level || 'Medium fat')}
          </span>

          <span class="qb-macro ${getLevelClass(item.sugar_level)}">
            ${escapeHtml(item.sugar_level || 'Low sugar')}
          </span>
        </div>

        <div class="qb-useful-fact-grid">
          <div class="qb-useful-fact-card">
            <p>Calories</p>
            <strong>${Number(item.calories || 0)} kcal</strong>
          </div>

          <div class="qb-useful-fact-card">
            <p>Spice</p>
            <strong>${escapeHtml(item.spice_level || 'Not spicy')}</strong>
          </div>

          <div class="qb-useful-fact-card">
            <p>Portion</p>
            <strong>${escapeHtml(item.portion_size || 'Regular')}</strong>
          </div>

          <div class="qb-useful-fact-card">
            <p>Prep Time</p>
            <strong>${escapeHtml(prepTimeText)}</strong>
          </div>
        </div>

        <div class="qb-polished-info-grid">
          <section class="qb-polished-info-card">
            <p>Allergen Note</p>
            <strong>${escapeHtml(item.allergen_info || 'Check with stall before ordering.')}</strong>
          </section>

          <section class="qb-polished-info-card">
            <p>Available At</p>
            <strong>
              ${escapeHtml(stallName)}
              <span>${escapeHtml(foodCourtName)}</span>
            </strong>
          </section>
        </div>

        <div class="qb-modal-footer qb-polished-footer">
          <div class="sp-eats-modal-actions">
            <button
              type="button"
              class="sp-eats-save-btn ${isFavouriteSaved ? 'saved' : ''}"
              data-save-meal="favourite"
              data-food-id="${escapeHtml(String(selectedModalItemId))}"
              aria-pressed="${isFavouriteSaved ? 'true' : 'false'}"
              title="${isFavouriteSaved ? 'Remove from Favourite' : 'Save to Favourite'}"
            >
              <span class="save-btn-label">
                ${isFavouriteSaved ? 'Saved Favourite' : 'Add Favourite'}
              </span>
            </button>

            <button
              type="button"
              class="sp-eats-save-btn ${isTryLaterSaved ? 'saved' : ''}"
              data-save-meal="tryLater"
              data-food-id="${escapeHtml(String(selectedModalItemId))}"
              aria-pressed="${isTryLaterSaved ? 'true' : 'false'}"
              title="${isTryLaterSaved ? 'Remove from Try Later' : 'Save to Try Later'}"
            >
              <span class="save-btn-label">
                ${isTryLaterSaved ? 'Saved Try Later' : 'Try Later'}
              </span>
            </button>

            ${
              disableAddButton
                ? `<button class="qb-add-cart disabled" disabled>Unavailable</button>`
                : `<button class="qb-add-cart" onclick="prepareCartItem('${escapeHtml(
                    String(selectedModalItemId),
                  )}')">
                    Add to Cart
                  </button>`
            }
          </div>
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
// SAVED MEALS
// =========================================================

function saveMealForSpEats(type, meal) {
  const saveKeys = getMealSaveKeys(type);
  const savedMeal = normaliseSavedMeal(meal);

  saveKeys.forEach((key) => {
    const currentList = getSavedMealList(key);

    const exists = currentList.some((item) => {
      return String(item.id) === String(savedMeal.id);
    });

    if (!exists) {
      currentList.unshift(savedMeal);
    }

    localStorage.setItem(key, JSON.stringify(currentList.slice(0, 24)));
  });

  window.dispatchEvent(new Event('spEatsSavedMealsUpdated'));
  window.dispatchEvent(new Event('quickbiteSavedMealsUpdated'));
}

function toggleMealForSpEats(type, meal) {
  const savedMeal = normaliseSavedMeal(meal);
  const alreadySaved = isMealSavedForSpEats(type, savedMeal.id);

  if (alreadySaved) {
    removeMealForSpEats(type, savedMeal.id);
    return false;
  }

  saveMealForSpEats(type, meal);
  return true;
}

function isMealSavedForSpEats(type, mealId) {
  const saveKeys = getMealSaveKeys(type);

  return saveKeys.some((key) => {
    const currentList = getSavedMealList(key);

    return currentList.some((meal) => {
      const savedMeal = normaliseSavedMeal(meal);
      return String(savedMeal.id) === String(mealId);
    });
  });
}

function removeMealForSpEats(type, mealId) {
  const saveKeys = getMealSaveKeys(type);

  saveKeys.forEach((key) => {
    const currentList = getSavedMealList(key);

    const updatedList = currentList.filter((meal) => {
      const savedMeal = normaliseSavedMeal(meal);
      return String(savedMeal.id) !== String(mealId);
    });

    localStorage.setItem(key, JSON.stringify(updatedList.slice(0, 24)));
  });

  window.dispatchEvent(new Event('spEatsSavedMealsUpdated'));
  window.dispatchEvent(new Event('quickbiteSavedMealsUpdated'));
}

function getMealSaveKeys(type) {
  if (type === 'tryLater') {
    return [tryLaterMealsKey, oldTryLaterMealsKey];
  }

  return [favouriteMealsKey, oldFavouriteMealsKey];
}

function getSavedMealList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function normaliseSavedMeal(meal) {
  const stallName =
    meal.stall_name || meal.stallName || selectedStall?.stall_name || 'SP Eats Stall';

  const foodCourtName =
    meal.foodcourt_name ||
    meal.foodCourtName ||
    meal.food_court ||
    selectedStall?.food_court ||
    'SP Food Court';

  return {
    id: String(
      meal.food_id || meal.foodId || meal.item_id || meal.id || meal.item_name || meal.name,
    ),
    foodId: meal.food_id || meal.foodId || meal.item_id || meal.id || '',
    stallId: meal.stall_id || meal.stallId || apiStallId || '',
    foodCourtId: meal.foodcourt_id || meal.foodCourtId || selectedStall?.foodcourt_id || '',
    name: meal.item_name || meal.name || meal.food_name || 'Saved Meal',
    stallName,
    foodCourtName,
    imageUrl: meal.image_url || meal.imageUrl || '',
    price: Number(meal.price || 0),
    rating: Number(meal.item_rating || meal.rating || 0),
    reviewCount: Number(meal.item_review_count || meal.review_count || meal.rating_count || 0),
    category: meal.category || 'Meal',
  };
}

// =========================================================
// CART STORAGE
// =========================================================

function prepareCartItem(itemId) {
  const selectedItem = menuItemsData.find((item) => {
    return String(getMenuItemId(item)) === String(itemId);
  });

  if (!selectedItem) {
    alert('Item not found.');
    return;
  }

  const cartItem = {
    item_id: selectedItem.item_id || selectedItem.food_id,
    stall_id: selectedItem.stall_id || apiStallId,
    stall_name: selectedItem.stall_name || selectedStall?.stall_name,
    item_name: selectedItem.item_name,
    variation: selectedItem.variation,
    price: selectedItem.price,
    image_url: selectedItem.image_url,
    quantity: 1,
  };

  const cartItems = getStoredCartItems();
  const existingItem = cartItems.find((item) => {
    return (
      String(item.item_id) === String(cartItem.item_id) &&
      String(item.stall_id) === String(cartItem.stall_id) &&
      String(item.variation || '') === String(cartItem.variation || '')
    );
  });

  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity || 0) + 1;
  } else {
    cartItems.push(cartItem);
  }

  localStorage.setItem(cartItemsKey, JSON.stringify(cartItems));
  window.dispatchEvent(
    new CustomEvent('spEatsCartUpdated', {
      detail: {
        items: cartItems,
      },
    }),
  );
  showSavedMealToast(`${selectedItem.item_name} added to cart.`);
}

function getStoredCartItems() {
  const storedCart = localStorage.getItem(cartItemsKey);

  if (!storedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    localStorage.removeItem(cartItemsKey);
    return [];
  }
}

// =========================================================
// RECENTLY VIEWED
// =========================================================

function saveRecentlyViewedMenuItem(item) {
  let recentlyViewedItems = getRecentlyViewedMenuItems();

  recentlyViewedItems = recentlyViewedItems.filter((recentItem) => {
    return String(recentItem.item_id) !== String(item.item_id || item.food_id);
  });

  recentlyViewedItems.unshift({
    item_id: item.item_id || item.food_id,
    item_name: item.item_name,
    item_description: item.item_description || item.description,
    price: item.price,
    category: item.category,
    image_url: item.image_url,
    stall_name: item.stall_name,
    food_court: item.food_court || item.foodcourt_name,
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
    return String(recentStall.stall_id) !== String(stall.stall_id);
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

function getApiStallId(id) {
  if (!id) {
    return null;
  }

  if (String(id).startsWith('stall_')) {
    return String(Number(String(id).replace('stall_', '')));
  }

  return String(id);
}

function formatPrice(price) {
  return Number(price || 0).toFixed(2);
}

function formatRating(rating) {
  return Number(rating || 0).toFixed(1);
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Allow inline onclick handlers to work.
window.prepareCartItem = prepareCartItem;
window.closeMenuItemModal = closeMenuItemModal;
