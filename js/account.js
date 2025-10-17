//All fields
const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const address = document.getElementById("address");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
//all btns
const cancel = document.getElementById("cancel");
const save = document.getElementById("save");
//get the logedin user from local storage
let user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) window.location.href = "../pages/auth/login.html";
fname.value = user.name.split(" ")[0];
lname.value = user.name.split(" ")[1] ?? "";
email.value = user.email;
address.value = user.address ?? "";
//btns onclicking
//cancel btn
cancel.addEventListener("click", () => {
  // Reset field values
  fname.value = user.name.split(" ")[0];
  lname.value = user.name.split(" ")[1] ?? "";
  email.value = user.email;
  address.value = user.address ?? "";

  // Remove validation borders
  [fname, lname, email].forEach((field) =>
    field.classList.remove("is-invalid")
  );

  // Clear alert
  document.getElementById("alert-container").innerHTML = "";
});

//save btn
save.addEventListener("click", (e) => {
  e.preventDefault();
  // Remove any previous invalid styling
  [fname, lname, email, currentPassword, newPassword, confirmPassword].forEach(
    (field) => field.classList.remove("is-invalid")
  );
  // Check empty fields
  if (!fname.value.trim()) {
    fname.classList.add("is-invalid");
    fname.focus();
    showAlert("First name cannot be empty.", "danger");
    return;
  }

  if (!lname.value.trim()) {
    lname.classList.add("is-invalid");
    lname.focus();
    showAlert("Last name cannot be empty.", "danger");
    return;
  }

  if (!email.value.trim()) {
    email.classList.add("is-invalid");
    email.focus();
    showAlert("Email cannot be empty.", "danger");
    return;
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    email.classList.add("is-invalid");
    email.focus();
    showAlert("Please enter a valid email address.", "danger");
    return;
  }
  // --- PASSWORD VALIDATION (if any field is filled, validate all) ---
  if (currentPassword.value || newPassword.value || confirmPassword.value) {
    // Check current password matches stored password
    if (currentPassword.value !== user.password) {
      currentPassword.classList.add("is-invalid");
      currentPassword.focus();
      showAlert("Current password is incorrect.", "danger");
      return;
    }

    // Check new password not empty
    if (!newPassword.value) {
      newPassword.classList.add("is-invalid");
      newPassword.focus();
      showAlert("New password cannot be empty.", "danger");
      return;
    }

    // Check confirm password matches
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.classList.add("is-invalid");
      confirmPassword.focus();
      showAlert("Passwords do not match.", "danger");
      return;
    }

    // Update stored password
    user.password = newPassword.value;
  }
  let updated = false;
  // Check if any field changed
  if (
    user.name.split(" ")[0] !== fname.value ||
    user.name.split(" ")[1] !== lname.value ||
    user.email !== email.value ||
    (user.address ?? "") !== address.value
  ) {
    // Update user object
    user.name = `${fname.value} ${lname.value}`;
    user.email = email.value;
    user.address = address.value;
    updated = true;
  }
  if (updated || (newPassword.value && confirmPassword.value)) {
    // Save to loggedInUser
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // Update ecommerceData
    let ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
    const indexOfTargetUser = ecommerceData.users.findIndex(
      (u) => u.id === user.id
    );
    if (indexOfTargetUser !== -1) {
      ecommerceData.users[indexOfTargetUser] = user;
      localStorage.setItem("ecommerceData", JSON.stringify(ecommerceData));
    }

    showAlert("User updated successfully.", "success");
  } else {
    showAlert("No changes detected.", "warning");
  }
});
function showAlert(message, type = "success") {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}
// ===========orders==========
// Load data from localStorage
const data = JSON.parse(localStorage.getItem("ecommerceData")) || {};

const orders =
  data.orders.filter(
    (o) => o.userId == JSON.parse(localStorage.getItem("loggedInUser")).id
  ) || [];

// Helper: format date
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Render Orders
function renderOrders() {
  const container = document.getElementById("orders-container");

  if (orders.length === 0) {
    container.innerHTML = `<p>No orders yet.</p>`;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  orders.forEach((order) => {
    html += `
      <tr>
        <td>#${order.orderId}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td><span class="badge ${
          order.status === "Delivered" ? "bg-success" : "bg-warning"
        }">${order.status}</span></td>
        <td>$${order.totalAmount}</td>
        <td>
          ${
            order.status === "Pending" || order.status === "Processing"
              ? `
            <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.orderId})">Cancel</button>
          `
              : `
            <button class="btn btn-sm btn-secondary" disabled>Cancel</button>
          `
          }
          <button class="btn btn-sm btn-primary" onclick="viewOrder(${
            order.orderId
          })">View</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

//  View Order Details
function viewOrder(orderId) {
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return;

  let detailsHtml = `
    <div class="card mt-3">
      <div class="card-body">
        <h5>Order #${order.orderId}</h5>
        <p><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
        <p><strong>Status:</strong> <span class="badge ${
          order.status === "Delivered" ? "bg-success" : "bg-warning"
        }">${order.status}</span></p>
        <p><strong>Total:</strong> $${order.totalAmount}</p>
        
        <h6>Items</h6>
        <ul class="list-group">
  `;

  order.items.forEach((item) => {
    detailsHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          Product ${data.products.find((p) => p.id == item.productId).name} (x${
      item.quantity
    })
        </div>
        <span>$${item.price * item.quantity}</span>
      </li>
    `;
  });

  detailsHtml += `
        </ul>
        <button class="btn btn-secondary btn-sm mt-3" onclick="renderOrders()">Back to Orders</button>
      </div>
    </div>
  `;

  document.getElementById("orders-container").innerHTML = detailsHtml;
}
function cancelOrder(orderId) {
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return;

  if (order.status === "Delivered" || order.status === "Shipped") {
    alert("This order cannot be cancelled.");
    return;
  }

  // 1. Update status
  order.status = "Cancelled";

  // 2. Restore stock
  order.items.forEach((item) => {
    const product = data.products.find((p) => p.id === item.productId);
    if (product) {
      product.stock = (product.stock || 0) + item.quantity;
    }
  });

  // 3. Save back to localStorage
  data.orders = data.orders.map((o) => (o.orderId === orderId ? order : o));
  localStorage.setItem("ecommerceData", JSON.stringify(data));

  // 4. Feedback + UI refresh
  alert(`Order #${orderId} has been cancelled and stock restored.`);
  renderOrders();
}

// Initial render
renderOrders();
