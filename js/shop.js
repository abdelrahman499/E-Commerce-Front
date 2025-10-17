const categoryContainer =
  document.getElementsByClassName("category-buttons")[0];
const productsContainer = document.getElementById("shop-container");
const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
const categories = [];
// fill the categories
ecommerceData.categories.forEach((cat) => {
  categories.push(cat.name);
});

categoryContainer.innerHTML = `<button class="category-btn active"  onclick="filterByCategory('all', this)">All Products</button>`;
// Add category buttons dynamically
categories.forEach((category) => {
  const btn = document.createElement("button");
  btn.className = "category-btn";
  btn.textContent = category;
  btn.setAttribute("data-category", category);
  // btn.addEventListener("click", function () {
  //   window.location.href = `shop.html?category=${encodeURIComponent(category)}`;
  // });
  btn.addEventListener("click", function () {
    filterByCategory(category, btn);
  });
  categoryContainer.appendChild(btn);
});
const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get("category");

// After rendering, apply filter if category exists in URL
window.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".category-btn");

  if (selectedCategory) {
    buttons.forEach((btn) => {
      if (btn.getAttribute("data-category") === selectedCategory) {
        btn.classList.add("active");
        filterByCategory(selectedCategory, btn);
      } else {
        btn.classList.remove("active");
      }
    });
  } else {
    filterByCategory("all", buttons[0]);
  }
});

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || [];
const ShopProducts = JSON.parse(localStorage.getItem("ecommerceData")).products;
let WishlistProducts =
  JSON.parse(localStorage.getItem("ecommerceData")).wishlist.find(
    (w) => w.userId == loggedInUser.id
  )?.productIds || [];
let currentProducts = [...ShopProducts];
let filteredProducts = [...currentProducts];
let pagginationArr = filteredProducts.slice(0, 12);
let currentCategory = "all";
let currentSort = "default";
function renderProducts(products) {
  const container = document.getElementById("shop-container");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `<p class="text-center">No products found.</p>`;
    return;
  }

  products.forEach((p) => {
    container.innerHTML += `
                        <div class="col-lg-3 col-md-6 col-sm-6">
                            <div class="product-card">
                                <div class="product-image">
                                    ${
                                      p.discount
                                        ? `<span class="sale-badge">${p.discount}%</span>`
                                        : ""
                                    }
                                    <button class="Shop-btn" onclick="copyToWishlist(${
                                      p.id
                                    })">
                                        <i id="heart-${p.id}" class="${
      checkWishlist(p.id) ? "fa-solid fa-heart redHeart" : "fa-regular fa-heart"
    }"></i>
                                    </button>
                                    <button class="view-btn">
                                        <i class="fas fa-eye" onclick="goToProductDetails(${
                                          p.id
                                        })"></i>
                                    </button>
                                    <img src="${
                                      p.imageUrl.startsWith("http") ||
                                      p.imageUrl.startsWith("data")
                                        ? p.imageUrl
                                        : "../assets/images/products/" +
                                          p.imageUrl
                                    }" 
                                    alt="${p.name}">
                                  </div>
                                <div class="product-info">
                                    <h5 class="product-title">${p.name}</h5>
                                    <div class="product-price">
                                        <span class="current-price ${
                                          p.discount
                                            ? "text-decoration-line-through small text-black"
                                            : ""
                                        }">$${p.price}</span>&nbsp;
                                        <span class="current-price ${
                                          !p.discount ? "d-none" : ""
                                        }"> $${
      p.discount ? p.price - p.price * (p.discount / 100) : p.price
    }</span>
                                    </div>
                                    <button class="add-to-cart" onclick="addToCart(${
                                      p.id
                                    },1)">
                                        <i class="fas fa-shopping-cart me-2"></i>
                                        Add To Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
  });
}
const pagginationArea = document.getElementById("pagginationId");
const pageNumbers = Math.ceil(currentProducts.length / 12);
let pages = Array.from({ length: pageNumbers }, (_, i) => i + 1);
function filterByCategory(category, btn) {
  // reset active class
  document
    .querySelectorAll(".category-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  currentCategory = category;

  if (category === "all") {
    filteredProducts = [...ShopProducts];
  } else {
    filteredProducts = ShopProducts.filter(
      (product) =>
        ecommerceData.categories.find((c) => c.id === product.categoryId)
          ?.name === category
    );
  }

  pagginationArr = filteredProducts.slice(0, 12);
  renderProducts(pagginationArr);
  renderPaggination();
}
function renderPaggination() {
  const paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredProducts.length / 12);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent = i;
    a.href = "#";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      paggination(i, e);
    });
    if (i === 1) a.classList.add("active");
    li.appendChild(a);
    paginationContainer.appendChild(li);
  }
}
function toggleFilters() {
  const filtersSection = document.getElementById("filtersSection");
  filtersSection.classList.toggle("show");
}
function toggleSearch() {
  const searchBox = document.getElementById("searchBox");
  searchBox.classList.toggle("show");

  if (searchBox.classList.contains("show")) {
    document.getElementById("searchInput").focus();
  }
}
function searchProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let productsToSearch =
    currentCategory === "all"
      ? ShopProducts
      : ShopProducts.filter(
          (product) =>
            ecommerceData.categories.find((c) => c.id === product.categoryId)
              .name === currentCategory
        );
  console.log(productsToSearch);
  if (searchTerm === "") {
    filteredProducts = productsToSearch;
  } else {
    filteredProducts = productsToSearch.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }
  pagginationArr = filteredProducts.slice(0, 12);
  renderProducts(pagginationArr);
  renderPaggination();
}
function sortProducts(sortType) {
  currentSort = sortType;

  document
    .querySelectorAll(".filter-group .filter-option")
    .forEach((option) => {
      option.classList.remove("active");
    });
  event.target.classList.add("active");

  let sortedProducts = [...filteredProducts];

  switch (sortType) {
    case "price-low":
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case "name":
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  filteredProducts = sortedProducts;
  pagginationArr = sortedProducts.slice(0, 12);
  renderProducts(pagginationArr);
  renderPaggination();
}
function filterByPrice() {
  const minPrice = document.getElementById("minPrice").value || 0;
  const maxPrice = document.getElementById("maxPrice").value || 999999;

  let productsToFilter =
    currentCategory === "all"
      ? currentProducts
      : currentProducts.filter(
          (product) =>
            ecommerceData.categories.find((c) => c.id === product.categoryId)
              .name === currentCategory
        );
  filteredProducts = productsToFilter.filter(
    (product) => product.price >= minPrice && product.price <= maxPrice
  );
  pagginationArr = filteredProducts.slice(0, 12);
  renderProducts(pagginationArr);
  renderPaggination();
}
function setPriceRange(min, max) {
  document.getElementById("minPrice").value = min;
  document.getElementById("maxPrice").value = max;
  filterByPrice();
}
function copyToWishlist(productId) {
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser){ alert("you must login first."); return;}
  const userWishlist = ecommerceData.wishlist.find(
    (w) => w.userId === loggedInUser.id
  );
  let inWishlist = false;

  if (!userWishlist) {
    ecommerceData.wishlist.push({
      userId: loggedInUser.id,
      productIds: [productId],
    });
    inWishlist = true;
  } else {
    const existIndex = userWishlist.productIds.findIndex(
      (id) => id === productId
    );
    if (existIndex === -1) {
      userWishlist.productIds.push(productId);
      inWishlist = true;
    } else {
      userWishlist.productIds.splice(existIndex, 1);
      inWishlist = false;
    }
  }

  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));

  // Change the heart icon directly
  const heartIcon = document.querySelector(`#heart-${productId}`);
  if (inWishlist) {
    heartIcon.className = "fa-solid fa-heart redHeart";
  } else {
    heartIcon.className = "fa-regular fa-heart";
  }
  updateCounters();
}
function checkWishlist(productID) {
  return WishlistProducts.some((product) => product === productID);
}
function goToProductDetails(ID) {
  window.location.href = `productDetails.html?id=${ID}`;
}
function addToCart(productId, quantity) {
  // Get ecommerce data from localStorage or initialize it
  let data = JSON.parse(localStorage.getItem("ecommerceData")) || { cart: [] };

  // Find the logged in user ID (replace with your actual variable)
  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser || !loggedInUser.id) {
    alert("You must be logged in to add items to the cart.");
    return;
  }

  // Find the user's cart
  let userCart = data.cart.find((c) => c.userId === loggedInUser.id);

  // If no cart exists for this user, create one
  if (!userCart) {
    userCart = { userId: loggedInUser.id, items: [] };
    data.cart.push(userCart);
  }

  // Check if product is already in cart
  let existingItem = userCart.items.find(
    (item) => item.productId === productId
  );
  if (existingItem) {
    existingItem.quantity += quantity; // Increment quantity
    showToast("+1 Item Added", "success");
  } else {
    userCart.items.push({ productId, quantity }); // Add new product
    showToast("Item Added Successfully To Cart", "success");
  }

  // Save back to localStorage
  localStorage.setItem("ecommerceData", JSON.stringify(data));
  updateCounters();
  console.log(
    `Product ${productId} added to cart. Current cart:, userCart.items`
  );
}
function showToast(message, type = "danger") {
  let toastEl = document.getElementById("toastMessage");

  toastEl.className = `toast align-items-center text-bg-${type} border-0`;

  toastEl.querySelector(".toast-body").textContent = message;

  let toast = new bootstrap.Toast(toastEl);
  toast.show();
}
function paggination(pageNum, event) {
  let startIndex;
  let endIndex;
  let pagginationIcons = document.querySelectorAll(".pagination>li>a.active");
  console.log(pagginationIcons);
  if (pagginationIcons.length > 0) {
    pagginationIcons[0].className = "";
  }
  startIndex = (pageNum - 1) * 12;
  endIndex = startIndex + 12;
  pagginationArr = filteredProducts.slice(startIndex, endIndex);
  event.target.className = "active";
  renderProducts(pagginationArr);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
