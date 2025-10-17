//ecommerce Data
const ecommerceData = JSON.parse(localStorage.getItem("ecommerceData"));
//all main stats
const totalUsers = document.getElementById("totalUsers");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");
const totalProducts = document.getElementById("totalProducts");

//all substats
const newUsers = document.getElementById("newUsers");
const orderStatus = document.getElementById("orderStatus");
const pendingOrders = ecommerceData.orders.filter(
  (o) => o.status === "Pending"
).length;
const completedOrders = ecommerceData.orders.filter(
  (o) => o.status === "Delivered"
).length;
const frozenRevenue = document.getElementById("frozenRevenue");
const availableProducts = document.getElementById("availableProducts");
const revenueGrowth = document.getElementById("revenueGrowth");
//assigning to main stats
totalUsers.innerText = ecommerceData.users.length;
totalOrders.innerText = ecommerceData.orders.length;
totalProducts.innerText = ecommerceData.products.length;
totalRevenue.innerText =
  "$" +
  ecommerceData.orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    .toFixed(2);
//assigning to the substats
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
const newUsersCount = ecommerceData.users.filter((user) => {
  if (!user.joinedDate) return false; // skip if missing
  const createdAt = new Date(user.joinedDate);
  return createdAt >= oneMonthAgo;
}).length;
newUsers.innerText = `+${newUsersCount} new this month`;
orderStatus.innerText = `Pending: ${pendingOrders} | Completed: ${completedOrders}`;
frozenRevenue.innerText = `Frozen: ${
  "$" +
  ecommerceData.orders
    .filter((o) => o.status === "pending")
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    .toFixed(2)
}`;
availableProducts.innerText =
  "Available: " + ecommerceData.products.filter((sp) => sp.stock > 0).length;
// second section charts
window.addEventListener("load", function () {
  const salesByMonth = Array(12).fill(0); // Jan to Dec
  const orders = ecommerceData.orders || [];
  orders.forEach((order) => {
    if (order.orderDate && order.totalAmount) {
      const monthIndex = new Date(order.orderDate).getMonth(); // 0 = Jan
      salesByMonth[monthIndex] += order.totalAmount;
    }
  });

  // Labels for months
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const revenueCtx = document
    .getElementById("revenueSparkline")
    .getContext("2d");
  new Chart(revenueCtx, {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          data: salesByMonth,
          borderColor: "#fff",
          backgroundColor: "rgba(255,255,255,0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    },
  });
  // --- Sales Overview (Line Chart) ---
  const ctxSales = document.getElementById("salesChart").getContext("2d");
  const salesGradient = ctxSales.createLinearGradient(0, 0, 0, 200);
  salesGradient.addColorStop(0, "rgba(78,115,223,0.3)");
  salesGradient.addColorStop(1, "rgba(78,115,223,0)");
  new Chart(ctxSales, {
    type: "line",
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: "Sales ($)",
          data: salesByMonth,
          fill: true,
          borderColor: "#4e73df",
          backgroundColor: salesGradient,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { beginAtZero: true } },
      },
    },
  });

  // --- Orders by Status (Pie Chart) ---
  const ctxOrders = document
    .getElementById("ordersStatusChart")
    .getContext("2d");
  new Chart(ctxOrders, {
    type: "pie",
    data: {
      labels: ["Pending", "Delivered", "Cancelled"],
      datasets: [
        {
          label: "Orders",
          data: [
            pendingOrders,
            completedOrders,
            ecommerceData.orders.filter((o) => o.status === "Cancelled").length,
          ],
          backgroundColor: ["#f6c23e", "#1cc88a", "#e74a3b"],
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true },
      },
      cutout: "70%", // makes it a donut with empty center
    },
  });
  // Fill Recent Orders
  const recentOrdersTable = document.getElementById("recentOrdersTable");
  recentOrdersTable.innerHTML = orders
    .slice(-5)
    .reverse()
    .map(
      (order) => `
        <tr>
            <td>#${order.orderId}</td>
            <td>${
              ecommerceData.users.find((u) => u.id == order.userId).name ||
              "N/A"
            }</td>
            <td>$${order.totalAmount?.toFixed(2) || "0.00"}</td>
            <td><span class="badge bg-${
              order.status === "Delivered"
                ? "success"
                : order.status === "Pending"
                ? "warning"
                : order.status === "Canceled"
                ? "danger"
                : "secondary"
            }">${order.status}</span></td>
            <td>${order.orderDate || "N/A"}</td>
        </tr>
    `
    )
    .join("");

  // Fill New Users
  const users = ecommerceData.users || [];
  const newUsersList = document.getElementById("newUsersList");
  newUsersList.innerHTML = users
    .slice(-5)
    .reverse()
    .map(
      (user) => `
        <li class="list-group-item d-flex align-items-center">
            <img src="${
              user.img ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random`
            }" alt="Avatar" class="rounded-circle me-2" width="40" height="40">
            <div>
                <div>${user.name}</div>
                <small class="text-muted">${user.email}</small>
            </div>
        </li>
    `
    )
    .join("");
  // Top products and low stock alert
  const products = ecommerceData.products || [];
  const topProductsList = document.getElementById("topProductsList");
  const lowStockList = document.getElementById("lowStockList");
  // Function to render list items
  const renderList = (
    element,
    items,
    emptyText,
    badgeKey,
    badgeClass,
    headers
  ) => {
    element.innerHTML = "";
    if (items.length === 0) {
      element.innerHTML = `<li class="list-group-item">${emptyText}</li>`;
      return;
    }
    // Add headers if provided
    if (headers) {
      element.innerHTML += `
        <li class="list-group-item fw-bold d-flex justify-content-between">
          <span>ID </span>
          <span>${headers[0]}</span>
          <span>${headers[1]}</span>
        </li>
      `;
    }
    // Add product rows
    items.forEach((p) => {
      element.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${p.id} </span>
          <div class="d-flex align-items-center">
        <img src="${
          p.imageUrl.startsWith("http") || p.imageUrl.startsWith("data")
            ? p.imageUrl
            : "../assets/images/products/" + p.imageUrl
        }" 
                                    alt="${p.name}" 
    width="40" 
    height="40" 
    class="me-2 rounded">            ${p.name}
          </div>
          <span class="badge ${badgeClass} rounded-pill">${p[badgeKey]}</span>
        </li>
      `;
    });
  };

  // Top Selling Products
  const topSelling = [...products]
    .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
    .slice(0, 5);
  renderList(
    topProductsList,
    topSelling,
    "No top products yet",
    "soldCount",
    "bg-success",
    ["Product", "Sold"]
  );

  // Low Stock Alerts
  const lowStock = products.filter((p) => (p.stock || 0) <= 5);
  renderList(
    lowStockList,
    lowStock,
    "No low stock items",
    "stock",
    "bg-danger",
    ["Product", "Stock Left"]
  );
});
