// scripts/app.js — Melboch Store Functionality

/* ---------- Navbar Scroll ---------- */
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".mixtas-navbar");
  const current = window.scrollY;
  if (!nav) return;
  if (current > 50) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");

  if (current > lastScroll && current > 100)
    nav.style.transform = "translateY(-100%)";
  else nav.style.transform = "translateY(0)";
  lastScroll = current;
});

/* ---------- Smooth Scroll + Initialization ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.getElementById("scrollToProducts");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      document.querySelector(".new-in").scrollIntoView({ behavior: "smooth" });
    });
  }

  // Render both product sliders
  if (document.getElementById("newProducts")) {
    renderProducts(newProducts, "newProducts");
    renderProducts(newProducts, "nateProducts");
    setupSliders();
  }

  // Update cart count always
  updateCartCount();

  // If on cart page
  if (document.getElementById("cart-items")) {
    console.log("Rendering cart page...");
    renderCartPage();
  }
});

/* ---------- LOCAL PRODUCT DATA ---------- */
const newProducts = [
  { id: 1, img: "assets/Product1.jpg", title: "Super Strength Vest Tank", oldPrice: "999.00", newPrice: "799.00" },
  { id: 2, img: "assets/Product2.jpg", title: "Urban Core Hoodie", oldPrice: "1199.00", newPrice: "899.00" },
  { id: 3, img: "assets/Product3.jpg", title: "Street Smart Tee", oldPrice: "999.00", newPrice: "749.00" },
  { id: 4, img: "assets/Product1.jpg", title: "Signature Faded Tee", oldPrice: "1099.00", newPrice: "849.00" }
];

/* ---------- Render Product Cards ---------- */
function renderProducts(list, targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;
  container.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <div class="img-box">
        <span class="badge">SAVE 20%</span>
        <div class="wishlist"><i class="fa-regular fa-heart"></i></div>
        <img src="${p.img}" alt="${p.title}">
        <div class="add-cart" data-id="${p.id}">ADD TO CART</div>
      </div>
      <div class="product-info">
        <h3>${p.title}</h3>
        <div class="price">
          <span class="old-price">Rs.${p.oldPrice}</span>
          <span class="new-price">Rs.${p.newPrice}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".add-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      const product = list.find(item => item.id == id);
      addToCart(product);
    });
  });
}

/* ---------- Slider Buttons ---------- */
function setupSliders() {
  const newRow = document.querySelector("#newProducts");
  const nateRow = document.querySelector("#nateProducts");

  document.querySelector(".new-left").onclick = () =>
    newRow.scrollBy({ left: -300, behavior: "smooth" });
  document.querySelector(".new-right").onclick = () =>
    newRow.scrollBy({ left: 300, behavior: "smooth" });

  document.querySelector(".nate-left").onclick = () =>
    nateRow.scrollBy({ left: -300, behavior: "smooth" });
  document.querySelector(".nate-right").onclick = () =>
    nateRow.scrollBy({ left: 300, behavior: "smooth" });
}

/* ---------- CART SYSTEM ---------- */
function getCart() {
  return JSON.parse(localStorage.getItem("melboch_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("melboch_cart", JSON.stringify(cart));
}

function addToCart(product) {
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(p => p.id === product.id);

  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });

  saveCart(cart);
  updateCartCount();
  flashMessage("Added to cart!");
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((a, b) => a + b.qty, 0);
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = count;
}

/* ---------- CART PAGE ---------- */
function renderCartPage() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!container) {
    console.warn("Cart container not found");
    return;
  }

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = `<p class="muted">Your cart is empty.</p>`;
    if (totalEl) totalEl.textContent = "0.00";
    return;
  }

  cart.forEach(item => {
    const price = parseFloat(item.newPrice || item.price || 0);
    total += price * (item.qty || 1);

    const row = document.createElement("div");
    row.classList.add("cart-row");
    row.innerHTML = `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.title}">
        <div class="cart-info">
          <h4>${item.title}</h4>
          <p>Rs.${price}</p>
          <div class="qty">
            <button class="qty-btn minus" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(row);
  });

  if (totalEl) totalEl.textContent = total.toFixed(2);

  document.querySelectorAll(".minus").forEach(btn =>
    btn.addEventListener("click", e => changeQty(e.target.dataset.id, -1))
  );
  document.querySelectorAll(".plus").forEach(btn =>
    btn.addEventListener("click", e => changeQty(e.target.dataset.id, 1))
  );
  document.querySelectorAll(".remove-btn").forEach(btn =>
    btn.addEventListener("click", e => removeItem(e.target.dataset.id))
  );
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(p => p.id == id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
  saveCart(cart);
  renderCartPage();
  updateCartCount();
}

function removeItem(id) {
  const cart = getCart().filter(p => p.id != id);
  saveCart(cart);
  renderCartPage();
  updateCartCount();
}

/* ---------- Toast Message ---------- */
function flashMessage(msg) {
  const box = document.createElement("div");
  box.className = "toast";
  box.textContent = msg;
  document.body.appendChild(box);
  setTimeout(() => (box.style.opacity = "1"), 10);
  setTimeout(() => {
    box.style.opacity = "0";
    setTimeout(() => box.remove(), 300);
  }, 1500);
}
/* ---------- USER LOGIN STATE HANDLING ---------- */
window.addEventListener("load", () => {
  const profileIcon = document.querySelector("#profile-icon");
  const dropdown = document.querySelector("#profile-dropdown");
  const greeting = document.querySelector("#user-greeting");
  const logoutBtn = document.querySelector("#logout-btn");

  if (!profileIcon) return;

  const user = JSON.parse(localStorage.getItem("mixtas_current_user") || "null");

  // Update greeting text
  if (user && user.name) {
    greeting.textContent = `Hi, ${user.name.split(" ")[0]}`;
    logoutBtn.classList.remove("hidden");
  } else {
    greeting.textContent = "Hi, Guest";
    logoutBtn.classList.add("hidden");
  }

  // 👤 Click Profile icon
  profileIcon.addEventListener("click", (e) => {
    e.preventDefault();

    if (!user) {
      // Not logged in → go to login page
      window.location.href = "login.html";
      return;
    }

    // Logged in → toggle dropdown
    dropdown.classList.toggle("hidden");
  });

  // 🚪 Logout button
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("mixtas_current_user");
    dropdown.classList.add("hidden");
    flashMessage("Logged out successfully!");
    setTimeout(() => window.location.reload(), 700);
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (dropdown && !dropdown.contains(event.target) && event.target !== profileIcon) {
      dropdown.classList.add("hidden");
    }
  });
});
