const data = JSON.parse(localStorage.getItem("ecommerceData")) || {
  products: [],
};
const products = Array.isArray(data.products) ? data.products : [];
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;

function renderCarousel(carouselId, items) {
  const carouselInner = document.querySelector(`${carouselId} .carousel-inner`);
  if (!carouselInner) return;
  carouselInner.innerHTML = "";

  function getItemsPerSlide() {
    if (window.innerWidth < 576) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 992) return 3;
    return 4;
  }

  const itemsPerSlide = getItemsPerSlide();

  for (let i = 0; i < items.length; i += itemsPerSlide) {
    const chunk = items.slice(i, i + itemsPerSlide);
    const activeClass = i === 0 ? "active" : "";
    let cardsHTML = "";

    chunk.forEach((p) => {
      const hasDiscount = Number(p.discount) > 0;
      const priceNow = hasDiscount
        ? (p.price - (p.price * p.discount) / 100).toFixed(2)
        : p.price;

      const isFav = wishlistEntry.productIds.includes(p.id);

      cardsHTML += `
          <div class="product-card flex-fill mx-2">
            ${
              hasDiscount ? `<span class="discount">-${p.discount}%</span>` : ""
            }


            <button class="icons text-dark btn p-0" onclick="toggleFavorite(${
              p.id
            }, this)" title="Wishlist">
              <i class="${isFav ? "redHeart fas" : "far"} fa-heart"></i>
            </button>
            <div class="mx-auto" onclick="goToProduct(${p.id});">
              <img src=${
                p.imageUrl.startsWith("http") || p.imageUrl.startsWith("data")
                  ? p.imageUrl
                  : "../assets/images/products/" + p.imageUrl
              }
                 alt="${p.name}"
                 onerror="this.src='../assets/images/products/placeholder.jpg'">

            <h4>${p.name}</h4>
            <div class="price">
              ${
                hasDiscount
                  ? `<span class="old">$${p.price}</span>
                     <span class="new">$${priceNow}</span>`
                  : `<span class="new">$${p.price}</span>`
              }
            </div>
            </div>
            
            <button class="add-to-cart btn" onclick="addToCart(${p.id})">
              <i class="fas fa-shopping-cart"></i> Add To Cart
            </button>
          </div>
        `;
    });

    carouselInner.innerHTML += `
        <div class="carousel-item ${activeClass}">
          <div class="d-flex justify-content-center">
            ${cardsHTML}
          </div>
        </div>
      `;
  }
}

function goToProduct(id) {
  window.location.href = `../pages/productDetails.html?id=${id}`;
}

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlistEntry = data.wishlist.find((w) => w.userId === loggedInUser?.id);
if (!wishlistEntry) {
  wishlistEntry = { userId: loggedInUser?.id, productIds: [] };
  data.wishlist.push(wishlistEntry);
}
let userCart = data.cart.find((c) => c.userId === loggedInUser?.id);
if (!userCart) {
  userCart = { userId: loggedInUser?.id, items: [] };
  data.cart.push(userCart);
}
function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #000; color: #fff; padding: 8px 14px; border-radius: 8px;
    z-index: 3000; opacity: 0.95; font-size: 14px;`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1200);
}
function updateCounts() {
  const favEl = document.getElementById("favCount");
  const cartEl = document.getElementById("cartCount");

  if (favEl) favEl.textContent = wishlistEntry.productIds.length;
  if (cartEl) {
    const total = userCart.items.length;
    cartEl.textContent = total;
  }
}

function addToCart(productId) {
  if (!loggedInUser) {
    toast(" Please log in First.");
    window.location.href = "../pages/auth/login.html";
    return;
  }
  const existingItem = userCart.items.find((i) => i.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    toast("➕ Increased quantity in cart");
  } else {
    userCart.items.push({ productId, quantity: 1 });
    toast("✅ Added to cart");
  }

  localStorage.setItem("ecommerceData", JSON.stringify(data));
  updateCounts();
}

function toggleFavorite(productId, btn) {
  if (!loggedInUser) {
    toast("Please log in to add items to your cart");
    window.location.href = "../pages/auth/login.html";
    return;
  }
  const idx = wishlistEntry.productIds.indexOf(productId);

  if (idx > -1) {
    wishlistEntry.productIds.splice(idx, 1);
    toast("❌ Removed from wishlist");
  } else {
    wishlistEntry.productIds.push(productId);
    toast("❤️ Added to wishlist");
  }

  localStorage.setItem("ecommerceData", JSON.stringify(data));
  updateCounts();

  if (btn) {
    const icon = btn.querySelector("i");
    if (icon) {
      const isFav = wishlistEntry.productIds.includes(productId);
      icon.classList.toggle("fas", isFav);
      icon.classList.toggle("redHeart", isFav);
      icon.classList.toggle("far", !isFav);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateCounts();

  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || {};
  const categories = ecommerceData.categories || [];
  const categoriesContainer = document.getElementById("categoriesContainer");

  const icons = {
    Electronics: '<i class="fas fa-mobile me-2"></i>',
    "Men's Fashion": '<i class="fas fa-tshirt me-2"></i>',
    "Women's Fashion": '<i class="fas fa-female me-2"></i>',
    Furniture: '<i class="fas fa-couch me-2"></i>',
    Toys: '<i class="fas fa-gamepad me-2"></i>',
  };

  const subCategories = {
    "Women's Fashion": ["Dresses", "Shoes", "Accessories"],
    Electronics: ["Mobiles", "Laptops", "Accessories"],
  };

  function goToCategory(categoryName, subName = "") {
    categoryName = decodeURIComponent(categoryName);
    let url = `../pages/shop.html?category=${encodeURIComponent(categoryName)}`;
    if (subName) url += `&sub=${encodeURIComponent(subName)}`;
    window.location.href = url;
  }

  if (categoriesContainer) {
    categories.forEach((cat) => {
      const icon = icons[cat.name] || '<i class="fas fa-tag"></i>';
      const card = document.createElement("div");
      card.className = "mycard";
      card.innerHTML = `${icon}<span>${cat.name}</span>`;

      card.addEventListener("click", () => goToCategory(cat.name));

      categoriesContainer.appendChild(card);
    });
  }

  const flashSales = products
    .filter((p) => Number(p.discount) > 0)
    .slice(0, 12);
  const bestSelling = [...products]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 12);
  const newArrivals = [...products].slice(-8);

  renderCarousel("#flashCarousel1", flashSales);
  renderCarousel("#flashCarousel2", bestSelling);
  renderCarousel("#flashCarousel3", newArrivals);

  window.addEventListener("resize", () => {
    renderCarousel("#flashCarousel1", flashSales);
    renderCarousel("#flashCarousel2", bestSelling);
    renderCarousel("#flashCarousel3", newArrivals);
  });

  function startCountdown(endDate, prefix) {
    function updateCountdown() {
      const now = Date.now();
      const distance = new Date(endDate).getTime() - now;

      const set = (v) => String(v).padStart(2, "0");
      const daysEl = document.getElementById(`days${prefix}`);
      const hoursEl = document.getElementById(`hours${prefix}`);
      const minutesEl = document.getElementById(`minutes${prefix}`);
      const secondsEl = document.getElementById(`seconds${prefix}`);

      if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

      if (distance < 0) {
        daysEl.textContent =
          hoursEl.textContent =
          minutesEl.textContent =
          secondsEl.textContent =
            "00";
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      daysEl.textContent = set(days);
      hoursEl.textContent = set(hours);
      minutesEl.textContent = set(minutes);
      secondsEl.textContent = set(seconds);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
  }

  startCountdown("2025-08-23T23:59:59", "Hero");
  startCountdown("2025-08-23T23:59:59", "Flash");

  const indicatorsContainer = document.getElementById("carouselIndicators");
  const landingCarouselInner = document.getElementById("carouselInner");
  const featuredProducts = products.slice(0, 6);

  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

  if (indicatorsContainer && landingCarouselInner) {
    featuredProducts.forEach((product, index) => {
      const indicatorBtn = document.createElement("button");
      indicatorBtn.type = "button";
      indicatorBtn.style.backgroundColor = "var(--main-color)";
      indicatorBtn.style.border = "white 2px solid";
      indicatorBtn.style.height = "2rem";
      indicatorBtn.style.width = "2rem";
      indicatorBtn.setAttribute("data-bs-target", "#landingCarousel");
      indicatorBtn.setAttribute("data-bs-slide-to", index);
      if (index === 0) indicatorBtn.classList.add("active");
      indicatorsContainer.appendChild(indicatorBtn);

      const itemDiv = document.createElement("div");
      itemDiv.className = `carousel-item ${index === 0 ? "active" : ""}`;
      itemDiv.innerHTML = `
      <div class="hero-banner" onclick="window.location.href='../pages/productDetails.html?id=${
        product.id
      }'">
        <div class="hero-content">
          <h2>${categoryMap[product.categoryId] || "Unknown Category"}</h2>
          <h1>${product.name} - ${
        Number(product.discount) > 0 ? product.discount + "% Off" : "Best Price"
      }</h1>
          <button class="btn" id="shopnow">Shop Now →</button>
        </div>
        <div class="hero-img">
          <img src="${
            product.imageUrl.startsWith("http") ||
            product.imageUrl.startsWith("data")
              ? product.imageUrl
              : "../assets/images/products/" + product.imageUrl
          }" 
                                    alt="${product.name}">
        </div>
      </div>
    `;
      landingCarouselInner.appendChild(itemDiv);
    });
  }

  function renderRandomCategories(categories, products) {
    const container = document.getElementById("randomCategoriesSection");
    if (!container) return;
    container.innerHTML = "";

    const randomCategories = [...categories]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    randomCategories.forEach((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);

      const randomProducts = catProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      let productsHTML = "";
      randomProducts.forEach((p) => {
        productsHTML += `
        <a href="../pages/productDetails.html?id=${p.id}" 
           class="product bg-white text-decoration-none text-dark">
          <img src="${
            p.imageUrl.startsWith("http") || p.imageUrl.startsWith("data")
              ? p.imageUrl
              : "../assets/images/products/" + p.imageUrl
          }" 
                                    alt="${p.name}">
          <p>${p.name}</p>
          <p class="mb-1 fw-bold">$${p.price}</p>
        </a>
      `;
      });

      container.innerHTML += `
      <div class="col-12 col-md-6 col-lg-3">
        <div class="category-card text-dark">
          <h3>${cat.name}</h3>
          <div class="products-grid">
            ${productsHTML}
          </div>
        </div>
      </div>
    `;
    });
  }

  renderRandomCategories(categories, products);

  function renderFeaturedGrid(list) {
    const randomProducts = [...list]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    const slots = ["one", "two", "three", "four"];
    const imgSlots = [".one img", ".two img", ".three img", ".four img"];
    const nameSlots = [".one h3", ".two h3", ".three h3", ".four h3"];
    const priceSlots = [".one p", ".two p", ".three p", ".four p"];

    slots.forEach((slot, index) => {
      const product = randomProducts[index];
      if (product) {
        const slotDiv = document.querySelector(`.${slot}`);
        const imgSlotDiv = document.querySelector(imgSlots[index]);
        const nameSlotDiv = document.querySelector(nameSlots[index]);
        const priceSlotDiv = document.querySelector(priceSlots[index]);

        imgSlotDiv.src = `${
          product.imageUrl.startsWith("http") ||
          product.imageUrl.startsWith("data")
            ? product.imageUrl
            : "../assets/images/products/" + product.imageUrl
        }`;
        nameSlotDiv.textContent = product.name;
        priceSlotDiv.textContent = `$${product.price.toFixed(2)}`;

        slotDiv.style.cursor = "pointer";
        slotDiv.onclick = () => {
          window.location.href = `../pages/productDetails.html?id=${product.id}`;
        };
      }
    });
  }
  renderFeaturedGrid(products);

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", function () {
      const query = this.value.trim().toLowerCase();
      searchResults.innerHTML = "";
      if (!query) {
        searchResults.style.display = "none";
        return;
      }

      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.category && p.category.toLowerCase().includes(query))
      );

      if (filtered.length === 0) {
        searchResults.innerHTML = `<p class="p-2 m-0 text-muted">No results found</p>`;
        searchResults.style.display = "block";
        return;
      }

      filtered.forEach((p) => {
        const item = document.createElement("div");
        item.className =
          "d-flex align-items-center p-2 border-bottom search-item";
        item.style.cursor = "pointer";
        item.innerHTML = `
          <img src=${
            p.imageUrl.startsWith("http") || p.imageUrl.startsWith("data")
              ? p.imageUrl
              : "../assets/images/products/" + p.imageUrl
          }
               onerror="this.src='../assets/images/products/placeholder.jpg'"
               alt="${p.name}"
               style="width:40px; height:40px; object-fit:cover; margin-right:10px; border-radius:5px;">
          <div>
            <div class="fw-bold">${p.name}</div>
            <small class="text-muted">$${p.price}</small>
          </div>
        `;
        item.addEventListener("click", () => {
          window.location.href = `../pages/productDetails.html?id=${p.id}`;
        });
        searchResults.appendChild(item);
      });

      searchResults.style.display = "block";
    });

    document.addEventListener("click", (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.style.display = "none";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("loggedInUser");

    window.location.href = "../pages/auth/login.html";
  });
});
  const accountDropdown = document.getElementById("account-dropdown");
let user = loggedInUser;
if (user) {
  document.getElementById("signupli").style.display = "none";
  // Add role-based dashboard link
  if (user.role === "seller" || user.role === "admin") {
    const dashboardItem = document.createElement("li");
    dashboardItem.innerHTML = `<a class="dropdown-item" href=${
      user.role === "seller"
        ? "../Dashboard/sellerhome.html"
        : "../Dashboard/adminhome.html"
    }>Dashboard</a>`;
    accountDropdown.insertBefore(dashboardItem, accountDropdown.firstChild);
  }

  // Logout button
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.reload();
  });
} else {
  // If not logged in, replace with login link
  const accountMenu = document.getElementById("account-menu");
  if (accountMenu)
    document.getElementById("account-menu").innerHTML = `
        <a href="../pages/auth/login.html">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M24 27V24.3333C24 22.9188 23.5224 21.5623 22.6722 20.5621C21.8221 19.5619 20.669 19 19.4667 19H11.5333C10.331 19 9.17795 19.5619 8.32778 20.5621C7.47762 21.5623 7 22.9188 7 24.3333V27"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path
                  d="M16.5 14C18.9853 14 21 11.9853 21 9.5C21 7.01472 18.9853 5 16.5 5C14.0147 5 12 7.01472 12 9.5C12 11.9853 14.0147 14 16.5 14Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      `;
}
