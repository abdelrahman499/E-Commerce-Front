/* eslint-disable no-undef */
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
let currentProduct = null;
let categories = [];
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("ecommerceData")) {
    alert("No product data available. Redirecting to home page.");
    window.location.href = "../index.html";
    return;
  }
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));

  if (ecommerceData.categories && ecommerceData.categories.length > 0) {
    categories = ecommerceData.categories;
  } else {
    categories = [
      { id: 1, name: "Men's Fashion" },
      { id: 2, name: "Women 's Fashion" },
      { id: 3, name: "Electronics" },
      { id: 4, name: "Furniture" },
      { id: 5, name: "Toys" },
    ];
  }

  if (!ecommerceData.products || ecommerceData.products.length === 0) {
    alert("No products available. Redirecting to home page.");
    window.location.href = "../index.html";
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));
  if (!productId || isNaN(productId)) {
    window.location.href = "../404.html";
    return;
  }
  currentProduct = ecommerceData.products.find((p) => p.id === productId);
  if (!currentProduct) {
    window.location.href = "../404.html";
    return;
  }
  displayProductDetails(currentProduct);
  updateBreadcrumb();
  const increaseBtn = document.getElementById("increaseQuantity");
  const decreaseBtn = document.getElementById("decreaseQuantity");
  if (increaseBtn) {
    increaseBtn.addEventListener("click", increaseQuantity);
  }
  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", decreaseQuantity);
  }
});
function getCategoryName(categoryId) {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.name : "Unknown Category";
}
function updateBreadcrumb() {
  if (!currentProduct) return;
  const categoryLink = document.getElementById("productCategory");
  const productNameBreadcrumb = document.getElementById(
    "productNameBreadcrumb"
  );
  if (categoryLink) {
    const categoryName = getCategoryName(currentProduct.categoryId);
    categoryLink.textContent = categoryName;
    categoryLink.href = `../pages/shop.html?category=${encodeURIComponent(
      categoryName
    )}`;
  }
  if (productNameBreadcrumb) {
    productNameBreadcrumb.textContent =
      currentProduct.name || "Unknown Product";
  }
}
function displayProductDetails(product) {
  if (!product) return;
  updateBreadcrumb();
  const finalPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  const productTitle = document.getElementById("productTitle");
  if (productTitle) {
    productTitle.textContent = product.name || "Unknown Product";
  }
  const productPrice = document.getElementById("productPrice");
  if (productPrice) {
    productPrice.innerHTML =
      product.discount > 0
        ? `<span class="text-decoration-line-through text-muted me-2">$${(
            product.price || 0
          ).toFixed(2)}</span>
         <span class="text-danger">$${finalPrice.toFixed(2)}</span>`
        : `$${finalPrice.toFixed(2)}`;
  }

  const productDescription = document.getElementById("productDescription");
  if (productDescription) {
    productDescription.textContent =
      product.description || "No description available.";
  }

  const stockElement = document.getElementById("stockStatus");
  if (stockElement) {
    stockElement.textContent =
      product.stock > 0
        ? `In Stock (${product.stock} available)`
        : "Out of Stock";
    stockElement.className = product.stock > 0 ? "text-success" : "text-danger";
  }

  const quantityInput = document.getElementById("quantityInput");
  if (quantityInput) {
    quantityInput.max = product.stock;
  }

  const imgElement = document.getElementById("productMainImage");
  if (imgElement) {
    imgElement.src = `${
      product.imageUrl.startsWith("http") || product.imageUrl.startsWith("data")
        ? product.imageUrl
        : "../assets/images/products/" + product.imageUrl
    }`;
    imgElement.alt = product.name || "Product Image";
    imgElement.onerror = function () {
      this.src = "../assets/images/products/placeholder.jpg";
    };
  }

  const buyNowBtn = document.getElementById("buyNowBtn");
  if (buyNowBtn) {
    buyNowBtn.onclick = function () {
      const quantityInput = document.getElementById("quantityInput");
      addToCart(product.id, parseInt(quantityInput.value || 1));
    };
  }

  const addToCartBtn = document.getElementById("addToCartBtn");
  if (addToCartBtn) {
    addToCartBtn.onclick = function () {
      const quantityInput = document.getElementById("quantityInput");
      addToCart(product.id, parseInt(quantityInput.value || 1));
    };
  }
}
function increaseQuantity() {
  const input = document.getElementById("quantityInput");
  if (!input || !currentProduct) return;
  const currentValue = parseInt(input.value);
  const maxStock = currentProduct.stock;
  if (currentValue < maxStock) {
    input.value = currentValue + 1;
  } else {
    showToast(
      "Limit Reached",
      `Only ${maxStock} items available in stock.`,
      true
    );
  }
}
function decreaseQuantity() {
  const input = document.getElementById("quantityInput");
  if (!input) return;
  if (input.value > 1) {
    input.value = parseInt(input.value) - 1;
  }
}
function addToCart(productId, quantity) {
  if (!loggedInUser) {
    showToast("Error", "Please login to add items to your cart.", true);
    setTimeout(() => {
      window.location.href = "../pages/auth/login.html";
    }, 2000);
    return;
  }
  const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData")) || {
    products: [],
    users: [],
    cart: [],
  };
  let cartEntry = ecommerceData.cart.find((c) => c.userId === loggedInUser.id);
  if (!cartEntry) {
    cartEntry = { userId: loggedInUser.id, items: [] };
    ecommerceData.cart.push(cartEntry);
  }
  const cartItem = cartEntry.items.find((item) => item.productId === productId);
  if (cartItem) {
    const newQuantity = cartItem.quantity + quantity;
    const product = ecommerceData.products.find((p) => p.id === productId);
    if (product && newQuantity > product.stock) {
      showToast(
        "Error",
        `Only ${product.stock - cartItem.quantity} more available in stock.`,
        true
      );
      return;
    }
    cartItem.quantity = newQuantity;
  } else {
    cartEntry.items.push({ productId, quantity });
  }
  localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));
  showToast("Success", `${quantity} item(s) added to cart!`);
}
function showToast(title, message, isError = false) {
  const toastTitle = document.getElementById("toastTitle");
  const toastBody = document.getElementById("toastBody");
  const toastEl = document.getElementById("buyToast");
  if (toastTitle && toastBody && toastEl) {
    toastTitle.textContent = title;
    toastBody.textContent = message;
    if (isError) {
      toastEl.classList.add("bg-danger", "text-white");
    } else {
      toastEl.classList.remove("bg-danger", "text-white");
    }
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  } else {
    alert(`${title}: ${message}`);
  }
}
