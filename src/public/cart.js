

const CART_STORAGE_KEY = "spQuickBiteCart";

let cartItems = [];

// Load cart when page opens
window.addEventListener("DOMContentLoaded", () => {
  loadCartFromStorage();
  createCartButton();
  createCartSidebar();
  updateCartUI();
});

// =========================================================
// Local Storage
// =========================================================

function loadCartFromStorage() {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (savedCart) {
    cartItems = JSON.parse(savedCart);
  } else {
    cartItems = [];
  }
}

function saveCartToStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

// =========================================================
// Cart Calculations
// =========================================================

function getTotalItems() {
  let total = 0;

  for (let i = 0; i < cartItems.length; i++) {
    total += cartItems[i].quantity;
  }

  return total;
}

function getTotalPrice() {
  let total = 0;

  for (let i = 0; i < cartItems.length; i++) {
    total += Number(cartItems[i].price) * cartItems[i].quantity;
  }

  return total;
}

// =========================================================
// Add / Update / Remove Cart Items
// =========================================================

function addToCart(item) {
  const existingItem = cartItems.find((cartItem) => {
    return cartItem.item_id === item.item_id;
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      item_id: item.item_id,
      item_name: item.item_name,
      stall_name: item.stall_name,
      image_url: item.image_url,
      price: Number(item.price),
      quantity: 1,
    });
  }

  saveCartToStorage();
  updateCartUI();
  showAddedToCartPopup(item.item_name);
}

function showAddedToCartPopup(itemName) {
  let popup = document.getElementById("addedToCartPopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "addedToCartPopup";
    popup.className = "added-cart-popup";
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <strong>Added to cart</strong>
    <span>${itemName}</span>
  `;

  popup.classList.add("active");

  setTimeout(() => {
    popup.classList.remove("active");
  }, 1600);
}

function updateCartQuantity(itemId, newQuantity) {
  if (newQuantity <= 0) {
    removeCartItem(itemId);
    return;
  }

  for (let i = 0; i < cartItems.length; i++) {
    if (cartItems[i].item_id === itemId) {
      cartItems[i].quantity = newQuantity;
    }
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(itemId) {
  cartItems = cartItems.filter((item) => {
    return item.item_id !== itemId;
  });

  saveCartToStorage();
  updateCartUI();
}

function clearCart() {
  cartItems = [];
  saveCartToStorage();
  updateCartUI();
}

// =========================================================
// Create Navbar Cart Button
// =========================================================

function createCartButton() {
  const navLinks = document.querySelector(".nav-links");

  if (!navLinks) {
    return;
  }

  if (document.getElementById("cartButton")) {
    return;
  }

  const cartButton = document.createElement("button");
  cartButton.id = "cartButton";
  cartButton.className = "cart-nav-btn";

  cartButton.innerHTML = `
    <span>Cart</span>
    <span id="cartCountBadge" class="cart-count-badge">0</span>
    <span id="cartPriceText" class="cart-price-text">$0.00</span>
  `;

  cartButton.addEventListener("click", openCartSidebar);

  navLinks.appendChild(cartButton);
}

// =========================================================
// Create Cart Sidebar HTML
// =========================================================

function createCartSidebar() {
  if (document.getElementById("cartBackdrop")) {
    return;
  }

  const cartHTML = `
    <div id="cartBackdrop" class="cart-backdrop"></div>

    <aside id="cartSidebar" class="cart-sidebar">
      <div class="cart-header">
        <div>
          <h2>Your Cart</h2>
          <p id="cartHeaderCount">0 items</p>
        </div>

        <button id="closeCartButton" class="cart-close-btn">×</button>
      </div>

      <div id="cartItemsContainer" class="cart-items-container"></div>

      <div id="cartEmptyState" class="cart-empty-state">
        <div class="cart-empty-icon">⌂</div>
        <h3>Your cart is empty</h3>
        <p>Add items from any stall menu to start your order.</p>
        <button id="browseStallsButton" class="browse-stalls-btn">
          Browse Stalls →
        </button>
      </div>

      <div id="cartFooter" class="cart-footer">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <strong id="cartSubtotal">$0.00</strong>
        </div>

        <div class="cart-summary-row">
          <span>Collection</span>
          <strong>FREE</strong>
        </div>

        <div class="cart-total-row">
          <span>Total</span>
          <strong id="cartTotal">$0.00</strong>
        </div>

        <button id="placeOrderButton" class="place-order-btn">
          Place Order →
        </button>

        <button id="clearCartButton" class="clear-cart-link">
          Clear cart
        </button>
      </div>
    </aside>

    <div id="orderSuccessPopup" class="order-success-popup">
      <div class="success-check">✓</div>
      <h3>Order Placed Successfully</h3>
      <p>Your food order has been added for collection.</p>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", cartHTML);

  document.getElementById("cartBackdrop").addEventListener("click", closeCartSidebar);
  document.getElementById("closeCartButton").addEventListener("click", closeCartSidebar);
  document.getElementById("browseStallsButton").addEventListener("click", () => {
    window.location.href = "./stalls.html";
  });
  document.getElementById("clearCartButton").addEventListener("click", clearCart);
  document.getElementById("placeOrderButton").addEventListener("click", placeOrder);
}

// =========================================================
// Open / Close Sidebar
// =========================================================

function openCartSidebar() {
  document.getElementById("cartBackdrop").classList.add("active");
  document.getElementById("cartSidebar").classList.add("active");
}

function closeCartSidebar() {
  document.getElementById("cartBackdrop").classList.remove("active");
  document.getElementById("cartSidebar").classList.remove("active");
}

// =========================================================
// Update Cart UI
// =========================================================

function updateCartUI() {
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartPriceText = document.getElementById("cartPriceText");
  const cartHeaderCount = document.getElementById("cartHeaderCount");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartEmptyState = document.getElementById("cartEmptyState");
  const cartFooter = document.getElementById("cartFooter");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");
  const placeOrderButton = document.getElementById("placeOrderButton");

  if (!cartItemsContainer) {
    return;
  }

  if (cartCountBadge) {
    cartCountBadge.textContent = totalItems;
    cartCountBadge.classList.toggle("show", totalItems > 0);
  }

  if (cartPriceText) {
    cartPriceText.textContent = totalItems > 0 ? "$" + totalPrice.toFixed(2) : "";
  }

  cartHeaderCount.textContent = totalItems + (totalItems === 1 ? " item" : " items");

  cartItemsContainer.innerHTML = "";

  if (cartItems.length === 0) {
    cartEmptyState.style.display = "flex";
    cartFooter.style.display = "none";
    return;
  }

  cartEmptyState.style.display = "none";
  cartFooter.style.display = "block";

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img src="${item.image_url}" alt="${item.item_name}" class="cart-item-image" />

      <div class="cart-item-details">
        <h4>${item.item_name}</h4>
        <p>${item.stall_name}</p>
        <strong>$${Number(item.price).toFixed(2)}</strong>

        <div class="cart-qty-controls">
          <button onclick="updateCartQuantity('${item.item_id}', ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button class="qty-plus" onclick="updateCartQuantity('${item.item_id}', ${item.quantity + 1})">+</button>
        </div>
      </div>

      <button class="remove-cart-btn" onclick="removeCartItem('${item.item_id}')">
        🗑
      </button>
    `;

    cartItemsContainer.appendChild(cartItem);
  }

  cartSubtotal.textContent = "$" + totalPrice.toFixed(2);
  cartTotal.textContent = "$" + totalPrice.toFixed(2);
  placeOrderButton.textContent = "Place Order → $" + totalPrice.toFixed(2);
}

// =========================================================
// Place Order Popup
// =========================================================

function placeOrder() {
  if (cartItems.length === 0) {
    return;
  }

  clearCart();
  closeCartSidebar();

  const popup = document.getElementById("orderSuccessPopup");
  popup.classList.add("active");

  setTimeout(() => {
    popup.classList.remove("active");
  }, 2200);
}

// Make addToCart available to other JS files
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeCartItem = removeCartItem;